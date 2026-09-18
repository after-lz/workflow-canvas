<script setup lang="ts">
import { useRouter } from 'vue-router'
import UserEntry from '../components/auth/UserEntry.vue'
import { useProjectStore } from '../stores/project'

const store = useProjectStore()
const router = useRouter()

function open(id: string) {
  store.openProject(id)
  router.push(`/canvas/${id}`)
}

function create() {
  const p = store.createProject()
  open(p.id)
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="page">
    <header class="hero">
      <div>
        <p class="eyebrow">工作流画板</p>
        <h1>个人项目</h1>
        <p class="sub">每个项目都是一块独立画板，可自由搭建文本 / 图片 / 视频节点工作流</p>
      </div>
      <div class="actions">
        <UserEntry />
        <button class="create" type="button" @click="create">+ 新建项目</button>
      </div>
    </header>

    <section class="grid">
      <article
        v-for="project in store.projects"
        :key="project.id"
        class="card"
        @click="open(project.id)"
      >
        <div class="preview">
          <div class="dots">
            <span v-for="n in Math.min(project.nodes.length, 5)" :key="n" />
            <em v-if="!project.nodes.length">空画板</em>
          </div>
        </div>
        <div class="meta">
          <h3>{{ project.name }}</h3>
          <p>
            {{ project.nodes.length }} 节点 · {{ project.edges.length }} 连线 ·
            {{ formatTime(project.updatedAt) }}
          </p>
        </div>
        <button
          class="delete"
          type="button"
          title="删除"
          @click.stop="store.deleteProject(project.id)"
        >
          删除
        </button>
      </article>
    </section>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 48px 56px 80px;
  background:
    radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.12), transparent 40%),
    radial-gradient(ellipse at bottom right, rgba(99, 102, 241, 0.08), transparent 35%),
    #0b0c0e;
  color: #e5e7eb;
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #60a5fa;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 36px;
  font-weight: 650;
  letter-spacing: -0.02em;
}

.sub {
  margin: 10px 0 0;
  color: #9ca3af;
  max-width: 520px;
  line-height: 1.6;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.create {
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111;
  font-weight: 600;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.card {
  position: relative;
  border: 1px solid #24262c;
  border-radius: 16px;
  background: #141517;
  overflow: hidden;
  cursor: pointer;
  transition: 0.2s ease;
}

.card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.preview {
  height: 140px;
  background:
    linear-gradient(180deg, #1a1c22, #101114);
  display: grid;
  place-items: center;
}

.dots {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #6b7280;
  font-size: 13px;
  font-style: normal;
}

.dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 18px 0 0 #34d399, 36px 0 0 #f472b6;
}

.dots em {
  font-style: normal;
}

.meta {
  padding: 14px 16px 18px;
}

h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.meta p {
  margin: 0;
  color: #9ca3af;
  font-size: 12px;
}

.delete {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  border: 1px solid #3f3f46;
  background: rgba(0, 0, 0, 0.55);
  color: #e5e7eb;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}

.card:hover .delete {
  opacity: 1;
}
</style>
