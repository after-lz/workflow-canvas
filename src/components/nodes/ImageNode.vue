<script setup lang="ts">
import { computed, ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { ImageNodeData } from '../../types/workflow'
import { useProjectStore } from '../../stores/project'
import { useAuthStore } from '../../stores/auth'
import { uploadSourceImage } from '../../services/generation'

const props = defineProps<{
  id: string
  data: ImageNodeData
}>()

const store = useProjectStore()
const auth = useAuthStore()
const inputRef = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const displayUrl = computed(() => props.data.previewUrl || props.data.remoteUrl || '')

function openPicker() {
  inputRef.value?.click()
}

async function onFile(file?: File | null) {
  if (!file || !file.type.startsWith('image/')) return
  const previewUrl = URL.createObjectURL(file)
  props.data.fileName = file.name
  props.data.previewUrl = previewUrl
  props.data.remoteUrl = ''
  props.data.status = 'idle'
  store.updateNodeData(props.id, {
    fileName: file.name,
    previewUrl,
    remoteUrl: '',
    status: 'idle',
  })

  if (!auth.isLoggedIn) return
  try {
    const remoteUrl = await uploadSourceImage(file)
    props.data.remoteUrl = remoteUrl
    store.updateNodeData(props.id, { remoteUrl })
  } catch {
    props.data.errorMessage = '参考图暂未上传，开始任务时会再试一次'
  }
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
  <div class="image-node">
    <Handle id="in" type="target" :position="Position.Left" class="port" />
    <Handle id="out" type="source" :position="Position.Right" class="port" />

    <header class="node-header">
      <span class="header-left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="M21 16l-5-5-4 4-2-2-5 5" />
        </svg>
        {{ data.label }}
      </span>
      <span class="title">{{ data.title }}</span>
    </header>

    <div
      class="dropzone"
      :class="{ active: dragging, filled: !!displayUrl, running: data.status === 'running' }"
      @click="openPicker"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop="onDrop"
      @mousedown.stop
    >
      <img v-if="displayUrl" :src="displayUrl" :alt="data.fileName || data.title" class="preview" />
      <template v-else>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="M21 16l-5-5-4 4-2-2-5 5" />
        </svg>
        <p>点击上传或拖动图片</p>
      </template>
      <div v-if="data.status === 'running'" class="overlay">生成中</div>
      <p v-else-if="data.status === 'failed'" class="fail">{{ data.errorMessage || '生成失败' }}</p>
    </div>

    <input ref="inputRef" type="file" accept="image/*" hidden @change="onInputChange" />
  </div>
</template>

<style scoped>
.image-node {
  width: 280px;
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
  min-width: 0;
}

.title {
  color: #9ca3af;
  white-space: nowrap;
}

.dropzone {
  position: relative;
  min-height: 180px;
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
  border-color: #60a5fa;
  background: #151a22;
}

.dropzone.filled {
  border-style: solid;
  padding: 0;
}

.dropzone.running {
  position: relative;
}

.overlay,
.fail {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  margin: 0;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
}

.overlay {
  background: rgba(17, 24, 39, 0.78);
  color: #bfdbfe;
}

.fail {
  background: rgba(127, 29, 29, 0.88);
  color: #fecaca;
}

.preview {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.port {
  width: 10px !important;
  height: 10px !important;
  background: #34d399 !important;
  border: 2px solid #0f1012 !important;
}
</style>
