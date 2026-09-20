<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { TextNodeData } from '../../types/workflow'
import { useProjectStore } from '../../stores/project'

const props = defineProps<{
  id: string
  data: TextNodeData
}>()

const store = useProjectStore()

function update(field: keyof TextNodeData, value: string | number) {
  ;(props.data as TextNodeData)[field] = value as never
  store.updateNodeData(props.id, { [field]: value })
}
</script>

<template>
  <div class="text-node">
    <Handle id="in" type="target" :position="Position.Left" class="port" />
    <Handle id="out" type="source" :position="Position.Right" class="port" />

    <header class="node-header">
      <span class="header-left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" fill="#a78bfa" />
        </svg>
        {{ data.label || '文本节点' }}
      </span>
      <button class="icon-btn" type="button" title="展开">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>
    </header>

    <textarea
      class="prompt"
      :value="data.content"
      placeholder="可直接文字生图，或上传图片输入文字指令对图片进行编辑"
      rows="5"
      @input="update('content', ($event.target as HTMLTextAreaElement).value)"
      @mousedown.stop
    />

    <div class="toolbar-row">
      <button class="ghost-btn" type="button" @mousedown.stop>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
        </svg>
        AI 优化文字
      </button>
      <select
        class="select"
        :value="data.optimizeModel"
        @change="update('optimizeModel', ($event.target as HTMLSelectElement).value)"
        @mousedown.stop
      >
        <option>GPT4.0</option>
        <option>GPT4o</option>
        <option>Claude</option>
      </select>
      <button class="opt-btn" type="button" @mousedown.stop>优化</button>
    </div>

    <div class="toolbar-row secondary">
      <select
        class="select"
        :value="data.model"
        @change="update('model', ($event.target as HTMLSelectElement).value)"
        @mousedown.stop
      >
        <option value="gpt-image-2">推理模型</option>
        <option value="nano-banana-pro">美学模型</option>
        <option value="gpt-image-2-we">gpt-image-2-we</option>
        <option value="gpt-image-2.5-we">gpt-image-2.5-we</option>
      </select>
      <button class="chip" type="button" @mousedown.stop>{{ data.quality }}</button>
      <button class="chip" type="button" @mousedown.stop>{{ data.resolution }}</button>
      <button class="chip" type="button" @mousedown.stop>{{ data.aspectRatio }}</button>
    </div>

    <footer class="node-footer">
      <div class="footer-left">
        <button class="icon-btn" type="button" @mousedown.stop>★</button>
        <span class="meta">{{ data.count }}张</span>
        <span class="credits">+ {{ data.credits }}</span>
      </div>
      <button class="send-btn" type="button" title="提交（预留）" @mousedown.stop>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.text-node {
  width: 360px;
  background: #1a1b1e;
  border: 1px solid #2a2b30;
  border-radius: 12px;
  color: #e8e8ea;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #141517;
  border-bottom: 1px solid #2a2b30;
  font-size: 13px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.prompt {
  width: 100%;
  box-sizing: border-box;
  resize: none;
  border: none;
  outline: none;
  background: #16171a;
  color: #e8e8ea;
  padding: 12px;
  font-size: 13px;
  line-height: 1.5;
  font-family: inherit;
}

.prompt::placeholder {
  color: #6b6e76;
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-top: 1px solid #2a2b30;
}

.toolbar-row.secondary {
  padding-top: 0;
  border-top: none;
}

.ghost-btn,
.opt-btn,
.chip,
.select {
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #33353c;
  background: #22242a;
  color: #d0d2d8;
  padding: 4px 8px;
  cursor: pointer;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
}

.opt-btn {
  margin-left: auto;
  background: #2b2d34;
}

.chip {
  white-space: nowrap;
}

.select {
  outline: none;
  max-width: 110px;
}

.node-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 10px;
  border-top: 1px solid #2a2b30;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #9a9da6;
}

.credits {
  color: #7dd3fc;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #9a9da6;
  cursor: pointer;
  padding: 2px;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #3b82f6;
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.port {
  width: 10px !important;
  height: 10px !important;
  background: #60a5fa !important;
  border: 2px solid #0f1012 !important;
}
</style>
