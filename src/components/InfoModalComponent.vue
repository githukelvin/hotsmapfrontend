<template>
  <div class="flex flex-col h-auto max-w-4xl mx-auto max-h-[90vh]">
    <!-- Compact Header -->
    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold tracking-tight">Scaled Score Calculation</h2>
          <p class="text-white/80 text-sm">Understanding vulnerability metrics and normalization</p>
        </div>
      </div>
      <button @click="closeModal" class="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group">
        <svg class="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-6 space-y-6">
        <!-- Overview -->
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"></div>
          <div class="relative p-4 border-l-4 border-blue-500 rounded-xl">
            <div class="flex items-start space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-2">📊 What is a Scaled Score?</h3>
                <p class="text-gray-700 mb-3 leading-relaxed text-sm">
                  A <strong class="text-blue-600">Scaled Score</strong> shows how your district compares to all others, expressed as a value between 0-100.
                </p>
                <div class="grid grid-cols-3 gap-3">
                  <div class="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div class="text-xl font-bold text-red-500 mb-1">0</div>
                    <div class="text-xs text-gray-600">Minimum value in dataset</div>
                  </div>
                  <div class="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div class="text-xl font-bold text-yellow-500 mb-1">50</div>
                    <div class="text-xs text-gray-600">Exactly in the middle</div>
                  </div>
                  <div class="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div class="text-xl font-bold text-green-500 mb-1">100</div>
                    <div class="text-xs text-gray-600">Maximum value in dataset</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 1: Raw Data Range -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <span class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">Step 1</span>
              <h3 class="text-base font-semibold text-gray-900">Get Raw Data Range</h3>
            </div>
          </div>
          <div class="p-4">
            <p class="text-gray-700 mb-3 text-sm">From your Kenya agriculture data, we examine Ag_Area values:</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div>
                    <div class="font-semibold text-red-800 text-sm">Minimum</div>
                    <div class="text-red-600 text-sm">10,713</div>
                    <div class="text-xs text-red-500">Smallest agricultural area</div>
                  </div>
                </div>
              </div>
              <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <div class="font-semibold text-green-800 text-sm">Maximum</div>
                    <div class="text-green-600 text-sm">349,050</div>
                    <div class="text-xs text-green-500">Largest agricultural area</div>
                  </div>
                </div>
              </div>
              <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <div class="font-semibold text-blue-800 text-sm">Your Example</div>
                    <div class="text-blue-600 text-sm">824,874</div>
                    <div class="text-xs text-blue-500">Exceeds maximum!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Formula -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <span class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">Step 2</span>
              <h3 class="text-base font-semibold text-gray-900">Apply Min-Max Normalization Formula</h3>
            </div>
          </div>
          <div class="p-4">
            <div class="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div class="mb-3 text-center">
                <span class="text-yellow-300 text-base">scaled</span>
                <span class="text-white mx-2">=</span>
                <span class="text-green-300">((value - min) / (max - min))</span>
                <span class="text-white mx-2">×</span>
                <span class="text-blue-300">100</span>
              </div>
              <div class="space-y-1 text-gray-300 text-xs">
                <div class="text-gray-500">// For Ag_Area = 824,874:</div>
                <div><span class="text-yellow-300">scaled</span> = ((824,874 - 10,713) / (349,050 - 10,713)) × 100</div>
                <div><span class="text-yellow-300">scaled</span> = (814,161 / 338,337) × 100</div>
                <div><span class="text-yellow-300">scaled</span> = 2.41 × 100</div>
                <div><span class="text-yellow-300">scaled</span> = <span class="text-red-400 font-bold">240.7</span></div>
                <div class="text-orange-400 mt-1">// Capped at 100: scaled = 100.0</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Inversion -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <span class="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">Step 3</span>
              <h3 class="text-base font-semibold text-gray-900">Handle Inversion (for "Good" Indicators)</h3>
            </div>
          </div>
          <div class="p-4">
            <div class="p-3 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg mb-3">
              <p class="text-purple-800 text-sm">
                Since <strong>larger agricultural area = lower vulnerability</strong>, we <strong>DON'T invert</strong> this field.
              </p>
            </div>
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div class="flex items-start space-x-2">
                <div class="p-1 bg-amber-200 rounded-full mt-0.5">
                  <svg class="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-amber-800 mb-1 text-sm">Important Note</p>
                  <p class="text-amber-700 text-xs">
                    Your district has <strong>exceptionally large agricultural area</strong> compared to other Kenyan counties, resulting in the maximum score of 100.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Example: Rainfall -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <span class="bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full">Example</span>
              <h3 class="text-base font-semibold text-gray-900">🌧️ Average Rainfall (Inverted Data)</h3>
            </div>
          </div>
          <div class="p-4">
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                <tr class="bg-gray-50">
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">County</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Raw Rainfall</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Basic Scale</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Inverted Scale</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Risk Level</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Color</th>
                </tr>
                </thead>
                <tbody class="bg-white">
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-3 py-3 text-xs font-medium text-gray-900 border-b border-gray-100">Marsabit</td>
                  <td class="px-3 py-3 text-xs text-gray-600 border-b border-gray-100">327mm</td>
                  <td class="px-3 py-3 text-xs text-gray-600 border-b border-gray-100">0.0</td>
                  <td class="px-3 py-3 text-xs font-semibold text-red-600 border-b border-gray-100">100.0</td>
                  <td class="px-3 py-3 text-xs text-gray-600 border-b border-gray-100">Very High Risk</td>
                  <td class="px-3 py-3 border-b border-gray-100">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🔴 Red
                      </span>
                  </td>
                </tr>
                <tr class="hover:bg-gray-50 transition-colors bg-gray-25">
                  <td class="px-3 py-3 text-xs font-medium text-gray-900 border-b border-gray-100">Mombasa</td>
                  <td class="px-3 py-3 text-xs text-gray-600 border-b border-gray-100">947mm</td>
                  <td class="px-3 py-3 text-xs text-gray-600 border-b border-gray-100">69.7</td>
                  <td class="px-3 py-3 text-xs font-semibold text-green-600 border-b border-gray-100">30.3</td>
                  <td class="px-3 py-3 text-xs text-gray-600 border-b border-gray-100">Low Risk</td>
                  <td class="px-3 py-3 border-b border-gray-100">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        🟢 Light Green
                      </span>
                  </td>
                </tr>
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-3 py-3 text-xs font-medium text-gray-900">Siaya</td>
                  <td class="px-3 py-3 text-xs text-gray-600">1,217mm</td>
                  <td class="px-3 py-3 text-xs text-gray-600">100.0</td>
                  <td class="px-3 py-3 text-xs font-semibold text-green-600">0.0</td>
                  <td class="px-3 py-3 text-xs text-gray-600">Very Low Risk</td>
                  <td class="px-3 py-3">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
                        🟢 Green
                      </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Key Insight -->
        <div class="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 overflow-hidden shadow-sm">
          <div class="p-4">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span class="p-2 bg-green-100 rounded-lg mr-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </span>
              🎯 Key Insight
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-3 bg-white rounded-lg border border-red-200">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-red-500 text-lg">❌</span>
                  <span class="font-semibold text-red-700 text-sm">Without Inversion</span>
                </div>
                <p class="text-gray-700 text-xs">High rainfall → High score → Red color</p>
                <p class="text-red-600 text-xs mt-1 font-medium">(Counterintuitive!)</p>
              </div>
              <div class="p-3 bg-white rounded-lg border border-green-200">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-green-500 text-lg">✅</span>
                  <span class="font-semibold text-green-700 text-sm">With Inversion</span>
                </div>
                <p class="text-gray-700 text-xs">High rainfall → Low risk score → Green color</p>
                <p class="text-green-600 text-xs mt-1 font-medium">(Makes sense!)</p>
              </div>
            </div>
            <div class="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <p class="font-semibold text-gray-800 mb-2 text-sm">Simple Rules:</p>
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <span class="text-base">🌧️</span>
                  <span class="text-gray-700 text-xs"><strong>More rain</strong> = Less drought risk = <span class="text-green-600 font-semibold">Green color</span></span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-base">🏜️</span>
                  <span class="text-gray-700 text-xs"><strong>Less rain</strong> = More drought risk = <span class="text-red-600 font-semibold">Red color</span></span>
                </div>
              </div>
              <p class="text-green-700 mt-3 font-medium text-center text-sm">
                ✨ Inversion ensures colors make logical sense!
              </p>
            </div>
          </div>
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

<!--  &lt;!&ndash; Footer &ndash;&gt;-->
<!--  <div class="flex justify-end p-4 bg-gray-50 border-t">-->
<!--    <button-->
<!--      @click="closeModal"-->
<!--      class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"-->
<!--    >-->
<!--      Close-->
<!--    </button>-->
<!--  </div>-->
<!-- -->

</template>
<script lang="ts" setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// Store original overflow value
const originalOverflow = ref('')

// Methods
const closeModal = () => {
  emit('close')
  setBodyOverflow(false)
}

const setBodyOverflow = (hidden: boolean) => {
  if (hidden) {
    // Scroll to top before setting overflow hidden
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Store original overflow and set to hidden
    originalOverflow.value = document.body.style.overflow || ''
    document.body.style.overflow = 'hidden'
  } else {
    // Restore original overflow
    document.body.style.overflow = 'auto'
  }
}

// Watch for isOpen changes
watch(() => props.isOpen, (newValue) => {
  setBodyOverflow(newValue)
}, { immediate: true })

// Lifecycle - Setup escape key handler and body overflow
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && props.isOpen) {
      closeModal()
    }
  }

  document.addEventListener('keydown', handleEscape)

  // Set body overflow if modal is open on mount
  if (props.isOpen) {
    setBodyOverflow(true)
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape)
    // Always restore body overflow on unmount
    setBodyOverflow(false)
  })
})
</script>
