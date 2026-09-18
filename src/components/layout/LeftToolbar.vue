<script setup lang="ts">
import type { NodeKind } from '../../types/workflow'

const props = defineProps<{
  activeTool: 'select' | NodeKind | 'add'
}>()

const emit = defineEmits<{
  selectTool: [tool: 'select' | NodeKind | 'add']
  addNode: [kind: NodeKind]
}>()

const tools: Array<{
  id: 'select' | NodeKind | 'add'
  title: string
  kind?: NodeKind
}> = [
  { id: 'add', title: '新增节点' },
  { id: 'select', title: '选择' },
  { id: 'text', title: '文本节点', kind: 'text' },
  { id: 'image', title: '图片节点', kind: 'image' },
  { id: 'video', title: '视频节点', kind: 'video' },
]

function onClick(tool: (typeof tools)[number]) {
  emit('selectTool', tool.id)
  if (tool.kind) emit('addNode', tool.kind)
  if (tool.id === 'add') emit('addNode', 'text')
}
</script>

<template>
  <aside class="toolbar">
    <button
      v-for="tool in tools"
      :key="tool.id"
      type="button"
      class="tool"
      :class="{ active: props.activeTool === tool.id }"
      :title="tool.title"
      @click="onClick(tool)"
    >
      <!-- add -->
      <svg v-if="tool.id === 'add'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <!-- select -->
      <svg v-else-if="tool.id === 'select'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 3l7 17 2-7 7-2L4 3z" />
      </svg>
      <!-- text -->
      <svg v-else-if="tool.id === 'text'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="4 7 4 4 20 4 20 7" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="8" y1="20" x2="16" y2="20" />
      </svg>
      <!-- image -->
      <svg v-else-if="tool.id === 'image'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 16l-5-5-4 4-2-2-5 5" />
      </svg>
      <!-- video -->
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="3" y="5" width="14" height="14" rx="2" />
        <path d="M17 10l4-2v8l-4-2z" />
      </svg>
    </button>
  </aside>
</template>

<style scoped>
.toolbar {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 14px;
  background: rgba(22, 23, 26, 0.92);
  border: 1px solid #2a2b30;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  z-index: 15;
}

.tool {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #9ca3af;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: 0.15s ease;
}

.tool:hover,
.tool.active {
  background: #2a2d36;
  color: #f3f4f6;
}
</style>
