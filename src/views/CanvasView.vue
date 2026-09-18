<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopBar from '../components/layout/TopBar.vue'
import LeftToolbar from '../components/layout/LeftToolbar.vue'
import BottomBar from '../components/layout/BottomBar.vue'
import WorkflowCanvas from '../components/canvas/WorkflowCanvas.vue'
import LoginRequiredDialog from '../components/auth/LoginRequiredDialog.vue'
import type { NodeKind } from '../types/workflow'
import { useProjectStore } from '../stores/project'
import { useAuthStore } from '../stores/auth'
import { currentPath, loginLocation, parseIntent } from '../utils/redirect'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()
const auth = useAuthStore()

const projectId = route.params.id as string
const activeTool = ref<'select' | NodeKind | 'add'>('select')
const canvasRef = ref<InstanceType<typeof WorkflowCanvas> | null>(null)
const zoom = ref(1)
const prompt = ref<'save' | 'run' | null>(null)

const promptTitle = {
  run: '登录后才能开始任务',
  save: '登录后才能保存项目',
} as const

const promptMessage = {
  run: '游客可以查看和编辑画板。开始任务前请先登录，登录后会回到当前画板，已搭建的内容会保留。',
  save: '游客可以查看和编辑画板。保存项目前请先登录，登录后会回到当前页面，已编辑的内容会保留。',
} as const

onMounted(() => {
  const exists = store.projects.some((p) => p.id === projectId)
  if (!exists) {
    router.replace('/')
    return
  }
  store.openProject(projectId)
  resumeIntent()
})

function resumeIntent() {
  const intent = parseIntent(route.query.intent)
  if (!intent || !auth.isLoggedIn) return
  const query = { ...route.query }
  delete query.intent
  router.replace({ path: route.path, query })
  if (intent === 'run') {
    void store.runWorkflow()
    return
  }
  store.saveCurrentProject()
}

watch(
  () => canvasRef.value?.zoom,
  (z) => {
    if (typeof z === 'number') zoom.value = z
  },
  { flush: 'post' },
)

let zoomTimer: number | undefined
onMounted(() => {
  zoomTimer = window.setInterval(() => {
    const z = canvasRef.value?.zoom
    if (typeof z === 'number') zoom.value = z
  }, 300)
})

onUnmounted(() => {
  if (zoomTimer) window.clearInterval(zoomTimer)
})

function onAddNode(kind: NodeKind) {
  canvasRef.value?.addNode(kind)
}

function onRename(name: string) {
  store.renameProject(projectId, name)
}

function goLogin() {
  const intent = prompt.value ?? undefined
  prompt.value = null
  canvasRef.value?.flush()
  router.push(loginLocation(currentPath(router, route), intent))
}

async function onRun() {
  if (!auth.isLoggedIn) {
    prompt.value = 'run'
    return
  }
  await store.runWorkflow()
}

function onSave() {
  if (!auth.isLoggedIn) {
    prompt.value = 'save'
    return
  }
  canvasRef.value?.flush()
  store.saveCurrentProject()
}
</script>

<template>
  <div class="canvas-page" v-if="store.currentProject">
    <TopBar :project-name="store.currentProject.name" @rename="onRename" />

    <main class="stage">
      <LeftToolbar
        :active-tool="activeTool"
        @select-tool="activeTool = $event"
        @add-node="onAddNode"
      />

      <WorkflowCanvas ref="canvasRef" :project-id="projectId" />

      <BottomBar
        :zoom="zoom"
        :message="store.lastRunMessage"
        @zoom-in="canvasRef?.zoomIn()"
        @zoom-out="canvasRef?.zoomOut()"
        @fit-view="canvasRef?.fitView()"
        @run="onRun"
        @save="onSave"
      />
    </main>

    <LoginRequiredDialog
      :open="prompt !== null"
      :title="prompt ? promptTitle[prompt] : ''"
      :message="prompt ? promptMessage[prompt] : ''"
      @confirm="goLogin"
      @cancel="prompt = null"
    />
  </div>
</template>

<style scoped>
.canvas-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0b0c0e;
  color: #e5e7eb;
  overflow: hidden;
}

.stage {
  position: relative;
  flex: 1;
  min-height: 0;
}
</style>
