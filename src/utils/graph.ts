import type { WorkflowEdge, WorkflowNode } from '../types/workflow'

export interface GraphIssue {
  type: 'duplicate' | 'cycle' | 'self'
  message: string
}

/** 是否已存在相同方向的连线（source → target） */
export function isDuplicateEdge(
  edges: WorkflowEdge[],
  source: string,
  target: string,
  ignoreEdgeId?: string,
): boolean {
  return edges.some(
    (e) => e.source === source && e.target === target && e.id !== ignoreEdgeId,
  )
}

/** 从 start 出发是否能到达 goal（沿现有有向边） */
export function canReach(
  edges: WorkflowEdge[],
  start: string,
  goal: string,
): boolean {
  if (start === goal) return true
  const adj = new Map<string, string[]>()
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, [])
    adj.get(e.source)!.push(e.target)
  }

  const visited = new Set<string>()
  const stack = [start]
  while (stack.length) {
    const cur = stack.pop()!
    if (cur === goal) return true
    if (visited.has(cur)) continue
    visited.add(cur)
    for (const next of adj.get(cur) ?? []) {
      if (!visited.has(next)) stack.push(next)
    }
  }
  return false
}

/**
 * 若新增 source → target，是否会形成环：
 * 当 target 已经能到达 source 时，再连上就会闭环
 */
export function wouldCreateCycle(
  edges: WorkflowEdge[],
  source: string,
  target: string,
): boolean {
  if (source === target) return true
  return canReach(edges, target, source)
}

/** 当前图是否存在环（Kahn） */
export function hasCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const inDegree = new Map<string, number>()
  nodes.forEach((n) => inDegree.set(n.id, 0))
  const adj = new Map<string, string[]>()

  for (const e of edges) {
    if (!inDegree.has(e.source) || !inDegree.has(e.target)) continue
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
    if (!adj.has(e.source)) adj.set(e.source, [])
    adj.get(e.source)!.push(e.target)
  }

  const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([id]) => id)
  let visited = 0
  while (queue.length) {
    const id = queue.shift()!
    visited++
    for (const next of adj.get(id) ?? []) {
      const d = (inDegree.get(next) ?? 1) - 1
      inDegree.set(next, d)
      if (d === 0) queue.push(next)
    }
  }
  return visited < nodes.length && edges.length > 0
}

/** 找出重复连线（同一 source→target 出现多次） */
export function findDuplicateEdges(edges: WorkflowEdge[]): WorkflowEdge[] {
  const seen = new Set<string>()
  const dups: WorkflowEdge[] = []
  for (const e of edges) {
    const key = `${e.source}->${e.target}`
    if (seen.has(key)) dups.push(e)
    else seen.add(key)
  }
  return dups
}

/** 尝试连接前的校验 */
export function validateConnection(
  edges: WorkflowEdge[],
  source: string,
  target: string,
): GraphIssue | null {
  if (source === target) {
    return { type: 'self', message: '不能将节点连接到自身' }
  }
  if (isDuplicateEdge(edges, source, target)) {
    return { type: 'duplicate', message: '已存在相同连线，不能重复连接' }
  }
  if (wouldCreateCycle(edges, source, target)) {
    return { type: 'cycle', message: '该连线会形成循环引用，已阻止' }
  }
  return null
}

/** 全图校验：重复边 + 环 */
export function validateGraph(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): GraphIssue[] {
  const issues: GraphIssue[] = []
  const dups = findDuplicateEdges(edges)
  if (dups.length) {
    issues.push({
      type: 'duplicate',
      message: `存在 ${dups.length} 条重复连线`,
    })
  }
  if (hasCycle(nodes, edges)) {
    issues.push({
      type: 'cycle',
      message: '工作流存在循环引用',
    })
  }
  return issues
}
