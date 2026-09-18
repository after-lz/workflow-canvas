<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../../stores/project'
import UserEntry from '../auth/UserEntry.vue'

const props = defineProps<{
  projectName: string
}>()

const emit = defineEmits<{
  rename: [name: string]
}>()

const router = useRouter()
const store = useProjectStore()
const editing = ref(false)
const draft = ref(props.projectName)

const displayName = computed(() => props.projectName)

function goHome() {
  router.push('/')
}

function startEdit() {
  draft.value = props.projectName
  editing.value = true
}

function commitEdit() {
  editing.value = false
  emit('rename', draft.value)
}
</script>

<template>
  <header class="topbar">
    <div class="left">
      <button class="crumb link" type="button" @click="goHome">个人项目</button>
      <span class="sep">›</span>
      <button v-if="!editing" class="crumb name" type="button" @dblclick="startEdit">
        {{ displayName }}
      </button>
      <input
        v-else
        v-model="draft"
        class="name-input"
        autofocus
        @blur="commitEdit"
        @keydown.enter="commitEdit"
      />
    </div>

    <div class="right">
      <button class="icon" type="button" title="新建项目" @click="store.createProject(); router.push('/')">+</button>
      <button class="icon" type="button" title="历史">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" />
        </svg>
      </button>
      <button class="share" type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
        </svg>
        分享
      </button>
      <UserEntry />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-bottom: 1px solid #1f2126;
  background: rgba(10, 10, 12, 0.92);
  backdrop-filter: blur(8px);
  z-index: 20;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 13px;
}

.crumb {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
}

.crumb.link:hover {
  color: #e5e7eb;
}

.crumb.name {
  color: #f3f4f6;
  font-weight: 500;
}

.sep {
  opacity: 0.5;
}

.name-input {
  background: #1a1b1e;
  border: 1px solid #3b82f6;
  color: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  outline: none;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon,
.share {
  border: 1px solid #2a2b30;
  background: #16171a;
  color: #d1d5db;
  cursor: pointer;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.share {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 13px;
}
</style>
