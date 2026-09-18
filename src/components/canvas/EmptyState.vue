<script setup lang="ts">
import type { NodeKind } from '../../types/workflow'

defineEmits<{
  add: [kind: NodeKind]
}>()
</script>

<template>
  <div class="empty">
    <h2>您的空间已准备就绪</h2>
    <p>选择您的首个节点并开始创建</p>
    <div class="actions">
      <button type="button" @click="$emit('add', 'text')">+ 文本节点</button>
      <button type="button" @click="$emit('add', 'image')">+ 图片节点</button>
      <button type="button" @click="$emit('add', 'video')">+ 视频节点</button>
    </div>
  </div>
</template>

<style scoped>
.empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 5;
  text-align: center;
}

h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #f3f4f6;
}

p {
  margin: 12px 0 24px;
  color: #9ca3af;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  pointer-events: auto;
}

button {
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #2a2b30;
  background: #1a1b1e;
  color: #e5e7eb;
  cursor: pointer;
  font-size: 13px;
}

button:hover {
  border-color: #4b5563;
  background: #22242a;
}
</style>
