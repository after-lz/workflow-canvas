<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { VideoNodeData } from '../../types/workflow'
import { useProjectStore } from '../../stores/project'

const props = defineProps<{
  id: string
  data: VideoNodeData
}>()

const store = useProjectStore()
const inputRef = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

function openPicker() {
  inputRef.value?.click()
}

function onFile(file?: File | null) {
  if (!file || !file.type.startsWith('video/')) return
  const previewUrl = URL.createObjectURL(file)
  props.data.fileName = file.name
  props.data.previewUrl = previewUrl
  store.updateNodeData(props.id, {
    fileName: file.name,
    previewUrl,
  })
}

function onInputChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  onFile(file)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  e.preventDefault()
  onFile(e.dataTransfer?.files?.[0])
}
</script>

<template>
  <div class="video-node">
    <Handle id="in" type="target" :position="Position.Left" class="port" />
    <Handle id="out" type="source" :position="Position.Right" class="port" />

    <header class="node-header">
      <span class="header-left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8">
          <rect x="3" y="5" width="14" height="14" rx="2" />
          <path d="M17 10l4-2v8l-4-2z" />
        </svg>
        {{ data.label }}
      </span>
      <span class="title">{{ data.title }}</span>
    </header>

    <div
      class="dropzone"
      :class="{ active: dragging, filled: !!data.previewUrl }"
      @click="openPicker"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop="onDrop"
      @mousedown.stop
    >
      <video v-if="data.previewUrl" :src="data.previewUrl" class="preview" controls @mousedown.stop />
      <template v-else>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5">
          <rect x="3" y="5" width="14" height="14" rx="2" />
          <path d="M17 10l4-2v8l-4-2z" />
        </svg>
        <p>点击上传或拖动视频</p>
      </template>
    </div>

    <input ref="inputRef" type="file" accept="video/*" hidden @change="onInputChange" />
  </div>
</template>

<style scoped>
.video-node {
  width: 300px;
  background: #1a1b1e;
  border: 1px solid #2a2b30;
  border-radius: 12px;
  color: #e8e8ea;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.node-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #141517;
  border-bottom: 1px solid #2a2b30;
  font-size: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #c4c7cf;
}

.title {
  color: #9ca3af;
}

.dropzone {
  min-height: 170px;
  margin: 10px;
  border-radius: 10px;
  background: #121316;
  border: 1px dashed #3a3d46;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  color: #8b909a;
  font-size: 13px;
  overflow: hidden;
}

.dropzone.active {
  border-color: #f472b6;
  background: #1a1519;
}

.dropzone.filled {
  border-style: solid;
  padding: 0;
  cursor: default;
}

.preview {
  width: 100%;
  height: 170px;
  object-fit: cover;
  display: block;
  background: #000;
}

.port {
  width: 10px !important;
  height: 10px !important;
  background: #f472b6 !important;
  border: 2px solid #0f1012 !important;
}
</style>
