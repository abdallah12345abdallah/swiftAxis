<script setup>
import { RouterView } from 'vue-router'
import ConfirmHost from '@/components/common/ConfirmHost.vue'
</script>

<template>
  <RouterView />
  <!-- the one shared confirmation dialog (useConfirm) -->
  <ConfirmHost />
</template>
