<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: string
  color: string
}>()
</script>

<template>
  <div class="stat-card" :style="`--card-color: ${color}`">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="card-title text-uppercase mb-1">{{ title }}</h6>
          <div class="card-value">{{ value }}</div>
        </div>
        <div class="card-icon">
          <i :class="`bi ${icon}`"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background-color: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border-left: 4px solid var(--card-color);
  border-radius: 5px;
  box-shadow: 0 0.15rem 1.75rem rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  color: white;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.25);
}

.card-body {
  padding: 1.25rem;
}

.card-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
}

.card-icon {
  font-size: 2rem;
  opacity: 0.3;
  color: var(--card-color);
}
</style> 