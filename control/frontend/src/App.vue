<template>
  <Component :is="currentLayout">
    <RouterView :key="$route.fullPath" />
  </Component>
</template>

<script setup>
import { useRoute, RouterView } from 'vue-router'
import { computed } from 'vue'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
const layouts = {
  default: DefaultLayout,
  auth: AuthLayout
}

const route = useRoute()

const currentLayout = computed(() => {
  const layoutKey = route.meta.layout || 'default'
  return layouts[layoutKey] || DefaultLayout
})

</script>

<style>
@import '@/assets/base.css';
</style>