<script setup lang="ts">
defineProps<{
  zoom: number
  message?: string
}>()

const emit = defineEmits<{
  zoomIn: []
  zoomOut: []
  fitView: []
  run: []
  save: []
}>()
</script>

<template>
  <footer class="bottombar">
    <div class="left">
      <span class="page-pill">PAGE 1</span>
    </div>

    <div class="center">
      <button class="primary" type="button" @click="emit('run')">开始任务</button>
      <button class="secondary" type="button" @click="emit('save')">保存项目</button>
      <span v-if="message" class="hint">{{ message }}</span>
    </div>

    <div class="right">
      <button class="icon" type="button" title="适应画布" @click="emit('fitView')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>
      <div class="zoom">
        <button type="button" @click="emit('zoomOut')">−</button>
        <span>{{ Math.round(zoom * 100) }}%</span>
        <button type="button" @click="emit('zoomIn')">+</button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.bottombar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 64px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 18px;
  pointer-events: none;
  z-index: 15;
}

.left,
.center,
.right {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.center {
  justify-content: center;
}

.right {
  justify-content: flex-end;
}

.page-pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: #16171a;
  border: 1px solid #2a2b30;
  color: #d1d5db;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.primary,
.secondary {
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.primary {
  background: #f3f4f6;
  color: #111;
  font-weight: 600;
}

.secondary {
  background: #1e3a5f;
  color: #e5e7eb;
}

.hint {
  max-width: 280px;
  font-size: 12px;
  color: #93c5fd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #2a2b30;
  background: #16171a;
  color: #d1d5db;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.zoom {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid #2a2b30;
  background: #16171a;
  color: #d1d5db;
  font-size: 12px;
}

.zoom button {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
}
</style>
