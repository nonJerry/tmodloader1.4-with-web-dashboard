<template>
  <Component :is="currentLayout">
    <RouterView :key="$route.fullPath" />
  </Component>
</template>

<script setup lang="ts">
import { useRoute, RouterView } from 'vue-router'
import { computed } from 'vue'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
const layouts = {
  default: DefaultLayout,
  auth: AuthLayout
}

const route = useRoute()

type LayoutKey = keyof typeof layouts
const currentLayout = computed(() => {
  const layoutKey = (route.meta.layout as LayoutKey) ?? 'default'
  return layouts[layoutKey]
})

</script>

<style>
@import '@/assets/base.css';
</style>