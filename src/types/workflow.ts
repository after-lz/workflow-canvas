/** 节点类型 */
export type NodeKind = 'text' | 'image' | 'video'

/** 文本节点数据 */
export interface TextNodeData {
  label: string
  content: string
  model: string
  optimizeModel: string
  quality: string
  resolution: string
  aspectRatio: string
  count: number
  credits: number
}

/** 图片节点数据 */
export interface ImageNodeData {
  label: string
  title: string
  fileName?: string
  previewUrl?: string
}

/** 视频节点数据 */
export interface VideoNodeData {
  label: string
  title: string
  fileName?: string
  previewUrl?: string
  duration?: string
}

export type WorkflowNodeData = TextNodeData | ImageNodeData | VideoNodeData

/** 画布节点（与 Vue Flow 结构对齐的精简类型，避免深层泛型） */
export interface WorkflowNode {
  id: string
  type?: string
  position: { x: number; y: number }
  data: WorkflowNodeData
  [key: string]: unknown
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  type?: string
  animated?: boolean
  style?: Record<string, string | number>
  [key: string]: unknown
}

/** 单个项目（独立画板） */
export interface Project {
  id: string
  name: string
  updatedAt: number
  createdAt: number
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

/** 工作流执行上下文（预留） */
export interface WorkflowRunContext {
  projectId: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

/** 工作流执行结果（预留） */
export interface WorkflowRunResult {
  success: boolean
  message: string
  outputs?: Record<string, unknown>
}

export function createDefaultTextData(index: number): TextNodeData {
  return {
    label: `文本节点 ${index}`,
    content: '',
    model: 'W Image 2.5',
    optimizeModel: 'GPT4.0',
    quality: '高质量',
    resolution: '4K',
    aspectRatio: '9:16',
    count: 1,
    credits: 120,
  }
}

export function createDefaultImageData(index: number): ImageNodeData {
  return {
    label: `图片节点 ${index}`,
    title: `图片 ${index}`,
  }
}

export function createDefaultVideoData(index: number): VideoNodeData {
  return {
    label: `视频节点 ${index}`,
    title: `视频 ${index}`,
  }
}
