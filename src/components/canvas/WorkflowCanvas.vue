<script setup lang="ts">
import { computed, markRaw, nextTick, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import type { Connection, NodeTypesObject } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import TextNode from '../nodes/TextNode.vue'
import ImageNode from '../nodes/ImageNode.vue'
import VideoNode from '../nodes/VideoNode.vue'
import EmptyState from './EmptyState.vue'
import type { NodeKind, WorkflowEdge, WorkflowNode } from '../../types/workflow'
import { useProjectStore } from '../../stores/project'
import { validateConnection } from '../../utils/graph'

/** 深拷贝为纯 JSON 对象，避免 structuredClone 无法处理 Vue Proxy */
function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(toRaw(value))) as T
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}

const props = defineProps<{
  projectId: string
}>()

const store = useProjectStore()
let applyingRemote = false

const nodeTypes = {
  text: markRaw(TextNode),
  image: markRaw(ImageNode),
  video: markRaw(VideoNode),
} as unknown as NodeTypesObject

const nodes = ref<WorkflowNode[]>([])
const edges = ref<WorkflowEdge[]>([])
const zoom = ref(1)
const toast = ref('')
let toastTimer: number | undefined

const {
  onConnect,
  onNodesChange,
  onEdgesChange,
  onViewportChange,
  addEdges,
  removeNodes,
  removeEdges,
  getSelectedNodes,
  getSelectedEdges,
  fitView,
  zoomIn,
  zoomOut,
  project,
} = useVueFlow()

const isEmpty = computed(() => nodes.value.length === 0)

function showToast(message: string) {
  toast.value = message
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2600)
}

function syncFromStore() {
  const projectData = store.projects.find((p) => p.id === props.projectId)
  if (!projectData) return
  nodes.value = clonePlain(projectData.nodes)
  edges.value = clonePlain(projectData.edges).map((e) => ({
    ...e,
    selectable: true,
    focusable: true,
    updatable: true,
    class: 'workflow-edge',
    // 去掉历史内联描边，避免盖住选中样式
    style: undefined,
  }))
}

watch(
  () => props.projectId,
  () => {
    syncFromStore()
    nextTick(() => fitView({ padding: 0.2 }))
  },
  { immediate: true },
)

watch(
  () => store.canvasEpoch,
  () => {
    applyingRemote = true
    syncFromStore()
    nextTick(() => {
      applyingRemote = false
    })
  },
)

function persist() {
  if (applyingRemote) return
  store.updateCanvas(clonePlain(nodes.value), clonePlain(edges.value))
}

onNodesChange(() => {
  if (applyingRemote) return
  nextTick(persist)
})

onEdgesChange(() => {
  if (applyingRemote) return
  nextTick(persist)
})

onConnect((connection: Connection) => {
  if (!connection.source || !connection.target) return

  const issue = validateConnection(edges.value, connection.source, connection.target)
  if (issue) {
    showToast(issue.message)
    return
  }

  addEdges([
    {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      type: 'smoothstep',
      animated: true,
      selectable: true,
      focusable: true,
      updatable: true,
      class: 'workflow-edge',
    },
  ])
  nextTick(persist)
})

onViewportChange((viewport) => {
  zoom.value = viewport.zoom
})

function deleteSelection() {
  const selectedNodes = getSelectedNodes.value
  const selectedEdges = getSelectedEdges.value
  if (!selectedNodes.length && !selectedEdges.length) return

  if (selectedNodes.length) {
    // 删除节点时一并清掉相关连线
    removeNodes(
      selectedNodes.map((n) => n.id),
      true,
      true,
    )
  }
  if (selectedEdges.length) {
    removeEdges(selectedEdges.map((e) => e.id))
  }
  nextTick(persist)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Delete' && e.key !== 'Backspace') return
  if (isEditableTarget(e.target)) return
  e.preventDefault()
  deleteSelection()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (toastTimer) window.clearTimeout(toastTimer)
})

function addNode(kind: NodeKind, screenCenter = true) {
  let position = { x: 240 + Math.random() * 120, y: 160 + Math.random() * 80 }
  if (screenCenter) {
    const el = document.querySelector('.vue-flow')
    if (el) {
      const rect = el.getBoundingClientRect()
      position = project({
        x: rect.width / 2 - 140,
        y: rect.height / 2 - 80,
      })
    }
  }
  const created = store.addNode(kind, position)
  if (created) {
    nodes.value.push(clonePlain(created))
  }
}

function flush() {
  persist()
}

defineExpose({
  addNode,
  flush,
  fitView: () => fitView({ padding: 0.2 }),
  zoomIn,
  zoomOut,
  zoom,
})
</script>

<template>
  <div class="canvas-wrap">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :default-viewport="{ zoom: 1 }"
      :min-zoom="0.3"
      :max-zoom="2"
      :snap-to-grid="true"
      :snap-grid="[16, 16]"
      :delete-key-code="null"
      :multi-selection-key-code="['Meta', 'Control']"
      selection-key-code="Shift"
      edges-updatable
      fit-view-on-init
      elevate-edges-on-select
      class="flow"
    >
      <Background pattern-color="#2a2b30" :gap="24" :size="1" />
    </VueFlow>

    <EmptyState v-if="isEmpty" @add="addNode" />

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.canvas-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.flow {
  width: 100%;
  height: 100%;
  background: #0b0c0e;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 88px;
  transform: translateX(-50%);
  z-index: 30;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(127, 29, 29, 0.92);
  border: 1px solid #f87171;
  color: #fecaca;
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

:deep(.vue-flow__edge-path) {
  stroke: #60a5fa;
  stroke-width: 2;
  transition: stroke 0.15s ease, stroke-width 0.15s ease, filter 0.15s ease;
}

/* 扩大可点击热区，方便选中线条 */
:deep(.vue-flow__edge-interaction) {
  stroke-width: 24 !important;
}

:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke: #93c5fd;
  stroke-width: 2.5;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path),
:deep(.vue-flow__edge.selectable:focus .vue-flow__edge-path) {
  stroke: #fbbf24 !important;
  stroke-width: 3.5 !important;
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.85));
  stroke-dasharray: 0 !important;
  animation: none !important;
}

:deep(.vue-flow__edge.selected) {
  z-index: 10 !important;
}

/* 选中时端点更醒目 */
:deep(.vue-flow__edge.selected .vue-flow__edge-textwrapper),
:deep(.vue-flow__edgeupdater) {
  opacity: 1;
}

:deep(.vue-flow__edge.selected .vue-flow__edgeupdater) {
  r: 5;
  fill: #fbbf24;
  stroke: #0b0c0e;
  stroke-width: 2;
}

:deep(.vue-flow__connection-line) {
  stroke: #93c5fd;
  stroke-width: 2;
}

:deep(.vue-flow__node) {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

:deep(.vue-flow__node.selected) {
  outline: 1px solid #60a5fa;
  outline-offset: 2px;
  border-radius: 12px;
}

:deep(.vue-flow__handle) {
  z-index: 5;
}
</style>
