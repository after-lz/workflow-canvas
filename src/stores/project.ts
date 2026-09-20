import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { NodeKind, Project, WorkflowEdge, WorkflowNode, WorkflowNodeData } from '../types/workflow'
import {
  createDefaultImageData,
  createDefaultTextData,
  createDefaultVideoData,
} from '../types/workflow'
import { ApiError } from '../services/http'
import { runImageTasks } from '../services/runTasks'

const STORAGE_KEY = 'workflow-canvas-projects'

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Project[]
  } catch {
    return []
  }
}

function saveProjects(list: Project[]) {
  // 先转成纯对象，避免把 Vue Proxy 写进 localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toRaw(list)))
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>(loadProjects())
  const currentProjectId = ref<string | null>(null)
  const lastRunMessage = ref('')
  const running = ref(false)
  const canvasEpoch = ref(0)

  const currentProject = computed(() => {
    return projects.value.find((p) => p.id === currentProjectId.value) ?? null
  })

  function persist() {
    saveProjects(projects.value)
  }

  function createProject(name = '未命名空间') {
    const now = Date.now()
    const project: Project = {
      id: uuidv4(),
      name,
      createdAt: now,
      updatedAt: now,
      nodes: [],
      edges: [],
    }
    projects.value.unshift(project)
    persist()
    return project
  }

  function renameProject(id: string, name: string) {
    const p = projects.value.find((x) => x.id === id)
    if (!p) return
    p.name = name.trim() || '未命名空间'
    p.updatedAt = Date.now()
    persist()
  }

  function deleteProject(id: string) {
    projects.value = projects.value.filter((p) => p.id !== id)
    if (currentProjectId.value === id) currentProjectId.value = null
    persist()
  }

  function openProject(id: string) {
    currentProjectId.value = id
  }

  function updateCanvas(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
    const p = currentProject.value
    if (!p) return
    p.nodes = nodes
    p.edges = edges
    p.updatedAt = Date.now()
    persist()
  }

  function nextNodeIndex(kind: NodeKind) {
    const p = currentProject.value
    if (!p) return 1
    return p.nodes.filter((n) => n.type === kind).length + 1
  }

  function addNode(kind: NodeKind, position?: { x: number; y: number }) {
    const p = currentProject.value
    if (!p) return null

    const index = nextNodeIndex(kind)
    const pos = position ?? {
      x: 180 + Math.random() * 280,
      y: 120 + Math.random() * 200,
    }

    let data: WorkflowNodeData
    if (kind === 'text') data = createDefaultTextData(index)
    else if (kind === 'image') data = createDefaultImageData(index)
    else data = createDefaultVideoData(index)

    const node: WorkflowNode = {
      id: `${kind}-${uuidv4().slice(0, 8)}`,
      type: kind,
      position: pos,
      data,
    }

    p.nodes = [...p.nodes, node]
    p.updatedAt = Date.now()
    persist()
    return node
  }

  function updateNodeData(nodeId: string, patch: Record<string, unknown>) {
    const p = currentProject.value
    if (!p) return
    const node = p.nodes.find((n) => n.id === nodeId)
    if (!node?.data) return
    Object.assign(node.data, patch)
    p.updatedAt = Date.now()
    persist()
  }

  function saveCurrentProject() {
    const p = currentProject.value
    if (!p) {
      lastRunMessage.value = '请先打开一个项目'
      return false
    }
    p.updatedAt = Date.now()
    persist()
    lastRunMessage.value = '项目已保存'
    return true
  }

  async function runWorkflow(onlyNodeId?: string) {
    const p = currentProject.value
    if (!p) {
      lastRunMessage.value = '请先打开一个项目'
      return
    }
    if (running.value) {
      lastRunMessage.value = '任务进行中，请稍候'
      return
    }

    running.value = true
    lastRunMessage.value = '正在提交生成任务...'
    try {
      lastRunMessage.value = await runImageTasks({
        getNodes: () => currentProject.value?.nodes ?? [],
        getEdges: () => currentProject.value?.edges ?? [],
        onProgress: (message) => {
          lastRunMessage.value = message
        },
        patchNode: (nodeId, patch) => {
          updateNodeData(nodeId, patch)
          canvasEpoch.value += 1
        },
        createResultNode: (sourceId, imageUrl) => {
          const source = currentProject.value?.nodes.find((node) => node.id === sourceId)
          const created = addNode('image', {
            x: (source?.position.x ?? 200) + 420,
            y: source?.position.y ?? 160,
          })
          if (!created || !currentProject.value) return
          updateNodeData(created.id, {
            previewUrl: imageUrl,
            remoteUrl: imageUrl,
            title: '生成结果',
            status: 'success',
          })
          currentProject.value.edges = [
            ...currentProject.value.edges,
            {
              id: `e-${sourceId}-${created.id}`,
              source: sourceId,
              target: created.id,
              type: 'smoothstep',
              animated: true,
            },
          ]
          persist()
          canvasEpoch.value += 1
        },
      }, onlyNodeId)
    } catch (error) {
      lastRunMessage.value = error instanceof ApiError ? error.message : '任务失败，请稍后重试'
    } finally {
      running.value = false
    }
  }

  if (!projects.value.length) {
    createProject('我的第一个空间')
  }

  return {
    projects,
    currentProjectId,
    currentProject,
    lastRunMessage,
    running,
    canvasEpoch,
    createProject,
    renameProject,
    deleteProject,
    openProject,
    updateCanvas,
    addNode,
    updateNodeData,
    saveCurrentProject,
    runWorkflow,
  }
})
