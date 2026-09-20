import type { ImageNodeData, TextNodeData, WorkflowEdge, WorkflowNode } from '../types/workflow'
import { workflowEngine } from './workflowEngine'
import { ApiError } from './http'
import {
  createAndPollGeneration,
  isTaskFinished,
  resolveModel,
  uploadSourceImage,
  type GenerationTask,
} from './generation'

export interface RunTasksHandlers {
  getNodes: () => WorkflowNode[]
  getEdges: () => WorkflowEdge[]
  onProgress: (message: string) => void
  patchNode: (nodeId: string, patch: Record<string, unknown>) => void
  createResultNode: (sourceId: string, imageUrl: string) => void
}

function isText(node: WorkflowNode): node is WorkflowNode & { data: TextNodeData } {
  return node.type === 'text'
}

function isImage(node: WorkflowNode): node is WorkflowNode & { data: ImageNodeData } {
  return node.type === 'image'
}

function progressText(task: GenerationTask) {
  if (typeof task.progress === 'number') return `正在查询任务 ${task.progress}%`
  return '正在查询任务结果...'
}

async function ensureRemoteUrl(
  node: WorkflowNode & { data: ImageNodeData },
  patchNode: RunTasksHandlers['patchNode'],
) {
  if (node.data.remoteUrl) return node.data.remoteUrl
  const preview = node.data.previewUrl
  if (preview?.startsWith('http://') || preview?.startsWith('https://')) return preview
  if (!preview?.startsWith('blob:')) return ''

  const response = await fetch(preview)
  if (!response.ok) throw new ApiError('参考图读取失败，请重新上传', 1)
  const blob = await response.blob()
  const file = new File([blob], node.data.fileName || 'source.png', {
    type: blob.type || 'image/png',
  })
  const remoteUrl = await uploadSourceImage(file)
  patchNode(node.id, { remoteUrl })
  return remoteUrl
}

async function collectSourceImages(
  textId: string,
  handlers: RunTasksHandlers,
) {
  const urls: string[] = []
  for (const edge of handlers.getEdges()) {
    if (edge.target !== textId) continue
    const node = handlers.getNodes().find((item) => item.id === edge.source)
    if (!node || !isImage(node)) continue
    const url = await ensureRemoteUrl(node, handlers.patchNode)
    if (url) urls.push(url)
    if (urls.length >= 5) break
  }
  return [...new Set(urls)]
}

function applyImages(
  textId: string,
  images: string[],
  handlers: RunTasksHandlers,
) {
  const targets = handlers
    .getEdges()
    .filter((edge) => edge.source === textId)
    .map((edge) => handlers.getNodes().find((node) => node.id === edge.target))
    .filter((node): node is WorkflowNode & { data: ImageNodeData } => !!node && isImage(node))

  if (!targets.length) {
    handlers.createResultNode(textId, images[0])
    return
  }

  targets.forEach((node, index) => {
    const url = images[index] || images[0]
    handlers.patchNode(node.id, {
      previewUrl: url,
      remoteUrl: url,
      status: 'success',
      errorMessage: '',
      title: '生成结果',
    })
  })
}

export async function runImageTasks(handlers: RunTasksHandlers, onlyNodeId?: string) {
  const nodes = handlers.getNodes()
  const edges = handlers.getEdges()
  const check = workflowEngine.validate({ projectId: '', nodes, edges })
  if (!check.valid) {
    throw new ApiError(check.errors.join('；'), 1)
  }

  const order = workflowEngine.getExecutionOrder(nodes, edges)
  const textIds = order.filter((id) => {
    const node = nodes.find((item) => item.id === id)
    return !!node && isText(node) && (!onlyNodeId || id === onlyNodeId)
  })

  if (!textIds.length) {
    throw new ApiError('请先添加文本节点，并填写提示词或连入参考图', 1)
  }

  let finished = 0
  for (const textId of textIds) {
    const node = handlers.getNodes().find((item) => item.id === textId)
    if (!node || !isText(node)) continue

    const sourceImages = await collectSourceImages(textId, handlers)
    const prompt = node.data.content.trim().slice(0, 5000)
    if (!prompt && !sourceImages.length) {
      throw new ApiError(`「${node.data.label}」需要提示词或参考图`, 1)
    }

    const targets = handlers
      .getEdges()
      .filter((edge) => edge.source === textId)
      .map((edge) => handlers.getNodes().find((item) => item.id === edge.target))
      .filter((item): item is WorkflowNode => !!item && item.type === 'image')
    targets.forEach((item) => handlers.patchNode(item.id, { status: 'running', errorMessage: '' }))

    handlers.onProgress(`正在提交「${node.data.label}」...`)
    const task = await createAndPollGeneration(
      {
        model: resolveModel(node.data.model).slice(0, 50),
        size: (node.data.aspectRatio || '1:1').slice(0, 20),
        image_size: (node.data.resolution || '1K').slice(0, 10),
        prompt: prompt || '',
        count: Math.min(20, Math.max(1, Number(node.data.count) || 1)),
        source_images: sourceImages.length ? sourceImages : undefined,
      },
      (current) => {
        if (!isTaskFinished(current)) handlers.onProgress(progressText(current))
      },
    )

    if (task.status === 'failed' || task.status === 'error' || !task.images.length) {
      targets.forEach((item) => {
        handlers.patchNode(item.id, {
          status: 'failed',
          errorMessage: task.errorMessage || '生成失败',
        })
      })
      throw new ApiError(task.errorMessage || `「${node.data.label}」生成失败`, 1)
    }

    applyImages(textId, task.images, handlers)
    finished += 1
    handlers.onProgress(`「${node.data.label}」已生成 ${task.images.length} 张`)
  }

  return `任务完成，共生成 ${finished} 个节点`
}
