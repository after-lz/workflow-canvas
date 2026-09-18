import type { WorkflowEdge, WorkflowNode, WorkflowRunContext, WorkflowRunResult } from '../types/workflow'
import { validateGraph } from '../utils/graph'

/**
 * 工作流引擎预留接口
 * 底层执行逻辑后续接入：拓扑排序、节点调度、媒体上传、模型调用等
 */
export interface IWorkflowEngine {
  /** 校验工作流是否可运行（环检测、必填项等） */
  validate(ctx: WorkflowRunContext): { valid: boolean; errors: string[] }

  /** 按拓扑顺序获取可执行节点列表 */
  getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[]

  /** 启动工作流（当前为占位实现） */
  run(ctx: WorkflowRunContext): Promise<WorkflowRunResult>

  /** 取消正在运行的工作流 */
  cancel(runId: string): Promise<void>
}

class WorkflowEngineStub implements IWorkflowEngine {
  validate(ctx: WorkflowRunContext) {
    const errors: string[] = []
    if (!ctx.nodes.length) {
      errors.push('画板中没有节点')
    }
    for (const issue of validateGraph(ctx.nodes, ctx.edges)) {
      errors.push(issue.message)
    }
    return { valid: errors.length === 0, errors }
  }

  getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
    const inDegree = new Map<string, number>()
    nodes.forEach((n) => inDegree.set(n.id, 0))
    edges.forEach((e) => {
      inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
    })

    const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([id]) => id)
    const order: string[] = []
    const adj = new Map<string, string[]>()
    edges.forEach((e) => {
      if (!adj.has(e.source)) adj.set(e.source, [])
      adj.get(e.source)!.push(e.target)
    })

    while (queue.length) {
      const id = queue.shift()!
      order.push(id)
      for (const next of adj.get(id) ?? []) {
        const d = (inDegree.get(next) ?? 1) - 1
        inDegree.set(next, d)
        if (d === 0) queue.push(next)
      }
    }

    // 有环时拓扑不完整，返回空表示无法得到合法执行序
    return order.length === nodes.length ? order : []
  }

  async run(ctx: WorkflowRunContext): Promise<WorkflowRunResult> {
    const { valid, errors } = this.validate(ctx)
    if (!valid) {
      return { success: false, message: errors.join('；') }
    }

    const order = this.getExecutionOrder(ctx.nodes, ctx.edges)
    if (!order.length && ctx.nodes.length) {
      return { success: false, message: '存在循环引用，无法确定执行顺序' }
    }

    console.info('[WorkflowEngine] 预留执行入口', {
      projectId: ctx.projectId,
      order,
      nodeCount: ctx.nodes.length,
      edgeCount: ctx.edges.length,
    })

    return {
      success: true,
      message: `工作流接口已预留，共 ${order.length} 个节点待接入后端执行`,
      outputs: { order },
    }
  }

  async cancel(runId: string): Promise<void> {
    console.info('[WorkflowEngine] 取消运行（预留）', runId)
  }
}

export const workflowEngine: IWorkflowEngine = new WorkflowEngineStub()
