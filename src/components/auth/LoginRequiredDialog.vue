<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div v-if="open" class="mask" @click.self="emit('cancel')">
    <section class="dialog" role="dialog" aria-modal="true">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="actions">
        <button class="ghost" type="button" @click="emit('cancel')">取消</button>
        <button class="primary" type="button" @click="emit('confirm')">去登录</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.55);
}

.dialog {
  width: min(420px, 100%);
  padding: 22px 22px 18px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(20, 22, 28, 0.96);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
}

p {
  margin: 10px 0 0;
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.7;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

button {
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
}

.ghost {
  border: 1px solid #3a3d44;
  background: transparent;
  color: #e5e7eb;
}

.primary {
  border: none;
  background: linear-gradient(90deg, #3b6cff, #6d5efc);
  color: white;
  font-weight: 600;
}
</style>
