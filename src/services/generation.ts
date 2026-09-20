import { API_BASE_URL } from '../config/api'
import { ApiError, request } from './http'

export interface GenerationRequest {
  model: string
  size: string
  image_size: string
  prompt?: string
  count?: number
  source_images?: string[]
  quality?: string
  skill_id?: number
}

export interface GenerationTask {
  id: string
  status: string
  progress?: number
  images: string[]
  errorMessage?: string
}

const TERMINAL_STATUS = new Set(['succeeded', 'success', 'failed', 'error', 'cancelled', 'canceled'])
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 3 * 60 * 1000

const MODEL_ALIAS: Record<string, string> = {
  'W Image 2.5': 'gpt-image-2',
  'Flux Pro': 'nano-banana-pro',
  SDXL: 'stable-diffusion-xl',
}

export function resolveModel(model: string) {
  const value = model.trim()
  return MODEL_ALIAS[value] || value || 'gpt-image-2'
}

export function isTaskFinished(task: GenerationTask) {
  return TERMINAL_STATUS.has(task.status)
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function pushUrl(images: string[], value: unknown) {
  if (typeof value === 'string' && value) images.push(value)
}

export function normalizeTask(raw: unknown): GenerationTask {
  const data = asRecord(raw)
  const images: string[] = []

  if (Array.isArray(data.images)) data.images.forEach((item) => pushUrl(images, item))
  if (Array.isArray(data.results)) {
    for (const item of data.results) {
      if (typeof item === 'string') pushUrl(images, item)
      else pushUrl(images, asRecord(item).url)
    }
  }
  pushUrl(images, data.result_image)

  const id = data.task_id ?? data.id ?? ''
  const status = String(data.status ?? (images.length ? 'succeeded' : 'pending'))
  const progress = typeof data.progress === 'number' ? data.progress : undefined
  const errorMessage = typeof data.error_message === 'string' ? data.error_message : undefined

  return {
    id: String(id),
    status,
    progress,
    images: [...new Set(images)],
    errorMessage,
  }
}

export function createGeneration(body: GenerationRequest) {
  return request<unknown>('/api/generationapi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, API_BASE_URL).then(normalizeTask)
}

export function queryGeneration(taskId: string) {
  return request<unknown>(`/api/generations/${encodeURIComponent(taskId)}`, {
    method: 'GET',
  }, API_BASE_URL).then(normalizeTask)
}

export async function uploadSourceImage(file: File) {
  const body = new FormData()
  body.append('image', file)
  const data = await request<{ url?: string; urls?: string[] }>('/api/uploads', {
    method: 'POST',
    body,
  }, API_BASE_URL)
  const url = data.url || data.urls?.[0]
  if (!url) throw new ApiError('参考图上传失败', 1)
  return url
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function pollGeneration(
  taskId: string,
  onUpdate?: (task: GenerationTask) => void,
) {
  const started = Date.now()
  while (Date.now() - started < POLL_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS)
    const task = await queryGeneration(taskId)
    onUpdate?.(task)
    if (isTaskFinished(task)) return task
  }
  throw new ApiError('查询任务超时，请稍后重试', -1)
}

export async function createAndPollGeneration(
  body: GenerationRequest,
  onUpdate?: (task: GenerationTask) => void,
) {
  const created = await createGeneration(body)
  onUpdate?.(created)
  if (!created.id || isTaskFinished(created)) return created
  return pollGeneration(created.id, onUpdate)
}
