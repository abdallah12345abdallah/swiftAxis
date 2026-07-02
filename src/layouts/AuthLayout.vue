<script setup>
import BrandLogo from '@/components/common/BrandLogo.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LangToggle from '@/components/common/LangToggle.vue'
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
    <!-- Branded navy backdrop -->
    <div class="bg-navy absolute inset-0 -z-10" />
    <div
      class="absolute -z-10 h-[520px] w-[520px] rounded-full bg-primary/25 blur-[120px] -top-32 start-[-8rem]"
    />
    <div
      class="absolute -z-10 h-[520px] w-[520px] rounded-full bg-orange/20 blur-[120px] -bottom-40 end-[-8rem]"
    />

    <div class="absolute top-5 flex items-center gap-1 end-5">
      <LangToggle class="text-white" />
      <ThemeToggle />
    </div>

    <div class="w-full max-w-md">
      <div class="mb-6 flex justify-center">
        <BrandLogo tone="light" :mark-size="46" />
      </div>
      <div class="bg-card text-card-foreground rounded-2xl border p-8 shadow-2xl">
        <RouterView />
      </div>
    </div>
  </div>
</template>
