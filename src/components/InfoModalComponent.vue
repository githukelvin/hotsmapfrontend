<template>
  <div class="flex flex-col h-auto max-w-lg mx-auto">
    <!-- Compact Header -->
    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
      <div class="flex items-center space-x-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <h2 class="text-lg font-semibold">Scaled Score Formula</h2>
      </div>
      <button @click="closeModal" class="p-1 hover:bg-white/20 rounded">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="p-6 space-y-4">
      <!-- Formula -->
      <div class="bg-gray-900 rounded-lg p-5 font-mono">
        <div class="text-center mb-3">
          <span class="text-yellow-300 text-base">scaled</span>
          <span class="text-white mx-2 text-base">=</span>
          <span class="text-green-300 text-base">((value - min) / (max - min))</span>
          <span class="text-white mx-2 text-base">×</span>
          <span class="text-blue-300 text-base">100</span>
        </div>
        <div class="text-gray-400 text-sm text-center">
          Min-Max Normalization (0-100 scale)
        </div>
      </div>

      <!-- Quick Example -->
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 class="font-semibold text-blue-900 mb-2 text-base">Example: Ag_Area = 824,874</h3>
        <div class="space-y-1 text-blue-800">
          <div class="text-sm">Min: 10,713 | Max: 349,050</div>
          <div class="text-sm">Calculation: ((824,874 - 10,713) / (349,050 - 10,713)) × 100</div>
          <div class="text-sm">Result: <span class="font-bold text-orange-600 text-base">240.7 → Capped at 100</span></div>
        </div>
      </div>

      <!-- Scale Reference -->
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="p-3 bg-red-50 rounded-lg border border-red-200">
          <div class="font-bold text-red-600 text-xl">0</div>
          <div class="text-red-500 text-sm">Minimum</div>
        </div>
        <div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div class="font-bold text-yellow-600 text-xl">50</div>
          <div class="text-yellow-500 text-sm">Middle</div>
        </div>
        <div class="p-3 bg-green-50 rounded-lg border border-green-200">
          <div class="font-bold text-green-600 text-xl">100</div>
          <div class="text-green-500 text-sm">Maximum</div>
        </div>
      </div>

      <!-- Inversion Note -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="text-sm text-amber-800">
          <span class="font-semibold">Note:</span> Some indicators are inverted so higher values = lower risk
          (e.g., more rainfall = less drought risk = green color)
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-end p-4 bg-gray-50 border-t">
      <button
        @click="closeModal"
        class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// Methods
const closeModal = () => {
  emit('close')
}

// Lifecycle - Setup escape key handler
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && props.isOpen) {
      closeModal()
    }
  }

  document.addEventListener('keydown', handleEscape)

  // Cleanup on unmount
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>
