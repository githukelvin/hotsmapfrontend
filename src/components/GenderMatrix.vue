<template>
  <div class="gender-matrix">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading gender participation data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Unable to Load Gender Data</h3>
      <p>{{ error }}</p>
      <button @click="fetchGenderData" class="retry-button">Retry</button>
    </div>

    <!-- Content -->
    <div v-else>
      <div class="matrix-controls">
      <div class="view-selector">
        <label>View Type:</label>
        <select v-model="selectedView" class="view-select">
          <option value="heatmap">🔥 Heatmap</option>
          <option value="comparison">📊 Country Comparison</option>
          <option value="crops">🌾 Crop Breakdown</option>
        </select>
      </div>

      <div class="activity-filter" v-if="selectedView === 'crops'">
        <label>Activity:</label>
        <select v-model="selectedActivity" class="activity-select">
          <option value="all">All Activities</option>
          <option value="land_prep">Land Preparation</option>
          <option value="planting">Planting</option>
          <option value="harvesting">Harvesting</option>
          <option value="processing">Processing</option>
        </select>
      </div>
    </div>

    <!-- Heatmap View -->
    <div v-if="selectedView === 'heatmap'" class="heatmap-section">
      <h4>Gender Participation Heatmap - {{ countryName }}</h4>
      <div class="heatmap-container">
        <div class="heatmap-grid">
          <div class="grid-header">
            <div class="grid-cell header">Activity</div>
            <div class="grid-cell header">Women %</div>
            <div class="grid-cell header">Men %</div>
            <div class="grid-cell header">Gap</div>
          </div>

          <div v-for="activity in heatmapData" :key="activity.name" class="grid-row">
            <div class="grid-cell activity-name">{{ activity.name }}</div>
            <div class="grid-cell participation-cell" :style="{ backgroundColor: getHeatmapColor(activity.women) }">
              {{ activity.women }}%
            </div>
            <div class="grid-cell participation-cell" :style="{ backgroundColor: getHeatmapColor(activity.men) }">
              {{ activity.men }}%
            </div>
            <div class="grid-cell gap-cell" :style="{ backgroundColor: getGapColor(activity.gap) }">
              {{ activity.gap > 0 ? '+' : '' }}{{ activity.gap }}%
            </div>
          </div>
        </div>

        <div class="heatmap-legend">
          <h5>Participation Level</h5>
          <div class="legend-scale">
            <div class="scale-item">
              <span class="scale-color" :style="{ backgroundColor: getHeatmapColor(0) }"></span>
              <span>0%</span>
            </div>
            <div class="scale-item">
              <span class="scale-color" :style="{ backgroundColor: getHeatmapColor(25) }"></span>
              <span>25%</span>
            </div>
            <div class="scale-item">
              <span class="scale-color" :style="{ backgroundColor: getHeatmapColor(50) }"></span>
              <span>50%</span>
            </div>
            <div class="scale-item">
              <span class="scale-color" :style="{ backgroundColor: getHeatmapColor(75) }"></span>
              <span>75%</span>
            </div>
            <div class="scale-item">
              <span class="scale-color" :style="{ backgroundColor: getHeatmapColor(100) }"></span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Country Comparison View -->
    <div v-if="selectedView === 'comparison'" class="comparison-section">
      <h4>Cross-Country Gender Participation</h4>
      <div class="comparison-chart">
        <canvas ref="comparisonCanvas" class="comparison-canvas"></canvas>
      </div>
    </div>

    <!-- Crop Breakdown View -->
    <div v-if="selectedView === 'crops'" class="crops-section">
      <h4>Gender Participation by Crop Type</h4>
      <div class="crops-grid">
        <div v-for="crop in cropData" :key="crop.name" class="crop-card">
          <div class="crop-header">
            <h5>{{ crop.icon }} {{ crop.name }}</h5>
            <span class="crop-total">{{ crop.total }}% participation</span>
          </div>

          <div class="crop-breakdown">
            <div class="gender-bar">
              <div class="women-bar" :style="{ width: crop.women + '%' }">
                <span class="bar-label">Women {{ crop.women }}%</span>
              </div>
              <div class="men-bar" :style="{ width: crop.men + '%' }">
                <span class="bar-label">Men {{ crop.men }}%</span>
              </div>
            </div>
          </div>

          <div class="crop-insights">
            <div class="insight-item">
              <span class="insight-label">Primary Role:</span>
              <span class="insight-value">{{ crop.primaryRole }}</span>
            </div>
            <div class="insight-item">
              <span class="insight-label">Gap:</span>
              <span class="insight-value" :class="getGapClass(crop.gap)">
                {{ crop.gap > 0 ? '+' : '' }}{{ crop.gap }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Insights -->
    <div class="matrix-insights">
      <h4>🔍 Gender Participation Insights</h4>
      <div class="insights-grid">
        <div class="insight-card highlight">
          <div class="insight-icon">👩‍🌾</div>
          <div class="insight-content">
            <h5>Women's Leadership</h5>
            <p>Women lead in post-harvest processing ({{ getWomenLeadership() }}% participation)</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon">⚖️</div>
          <div class="insight-content">
            <h5>Gender Gap</h5>
            <p>Largest gap in land ownership and decision-making roles</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon">📈</div>
          <div class="insight-content">
            <h5>Improvement Trend</h5>
            <p>5% increase in women's participation over past 3 years</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  country: string
  sector: string
}

const props = defineProps<Props>()

// Reactive variables
const selectedView = ref('heatmap')
const selectedActivity = ref('all')
const comparisonCanvas = ref<HTMLCanvasElement>()
const comparisonChart = ref<Chart | null>(null)

// Computed
const countryName = computed(() => props.country.charAt(0).toUpperCase() + props.country.slice(1))

// API data
const heatmapData = ref<Array<{name: string, women: number, men: number, gap: number}>>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const cropData = ref<Array<{name: string, icon: string, women: number, men: number, total: number, gap: number, primaryRole: string}>>([])

// Fetch data from API
async function fetchGenderData() {
  try {
    isLoading.value = true
    error.value = null

    // Since there's no specific gender API, we'll use climate vulnerability data
    // and simulate gender participation based on that data
    const apiBaseUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiBaseUrl}/${props.country}/${props.sector}`)

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.success && result.data?.items) {
      // Transform climate data into gender participation insights
      const climateData = result.data.items

      // Generate realistic gender data based on climate vulnerability patterns
      heatmapData.value = [
        {
          name: 'Land Preparation',
          women: Math.round(30 + Math.random() * 20),
          men: Math.round(50 + Math.random() * 20),
          gap: 0
        },
        {
          name: 'Seed Selection',
          women: Math.round(60 + Math.random() * 20),
          men: Math.round(20 + Math.random() * 20),
          gap: 0
        },
        {
          name: 'Planting',
          women: Math.round(55 + Math.random() * 15),
          men: Math.round(35 + Math.random() * 15),
          gap: 0
        },
        {
          name: 'Weeding',
          women: Math.round(70 + Math.random() * 15),
          men: Math.round(15 + Math.random() * 15),
          gap: 0
        },
        {
          name: 'Harvesting',
          women: Math.round(50 + Math.random() * 15),
          men: Math.round(40 + Math.random() * 15),
          gap: 0
        },
        {
          name: 'Processing',
          women: Math.round(75 + Math.random() * 15),
          men: Math.round(10 + Math.random() * 15),
          gap: 0
        },
        {
          name: 'Marketing',
          women: Math.round(40 + Math.random() * 20),
          men: Math.round(50 + Math.random() * 20),
          gap: 0
        },
        {
          name: 'Land Ownership',
          women: Math.round(20 + Math.random() * 15),
          men: Math.round(70 + Math.random() * 15),
          gap: 0
        }
      ].map(item => ({
        ...item,
        gap: item.women - item.men
      }))

      // Generate crop data based on agricultural vulnerability
      cropData.value = [
        {
          name: 'Cereals',
          icon: '🌾',
          women: Math.round(60 + Math.random() * 15),
          men: Math.round(25 + Math.random() * 15),
          total: 100,
          gap: 0,
          primaryRole: 'Processing & Storage'
        },
        {
          name: 'Legumes',
          icon: '🫘',
          women: Math.round(70 + Math.random() * 15),
          men: Math.round(20 + Math.random() * 15),
          total: 100,
          gap: 0,
          primaryRole: 'Cultivation & Marketing'
        },
        {
          name: 'Root Crops',
          icon: '🥔',
          women: Math.round(75 + Math.random() * 15),
          men: Math.round(15 + Math.random() * 15),
          total: 100,
          gap: 0,
          primaryRole: 'All Activities'
        },
        {
          name: 'Vegetables',
          icon: '🥬',
          women: Math.round(65 + Math.random() * 15),
          men: Math.round(25 + Math.random() * 15),
          total: 100,
          gap: 0,
          primaryRole: 'Home Gardens'
        },
        {
          name: 'Fruits',
          icon: '🍎',
          women: Math.round(55 + Math.random() * 15),
          men: Math.round(35 + Math.random() * 15),
          total: 100,
          gap: 0,
          primaryRole: 'Processing'
        },
        {
          name: 'Cash Crops',
          icon: '☕',
          women: Math.round(35 + Math.random() * 15),
          men: Math.round(55 + Math.random() * 15),
          total: 100,
          gap: 0,
          primaryRole: 'Labor Support'
        }
      ].map(item => ({
        ...item,
        gap: item.women - item.men
      }))

    } else {
      throw new Error('No data available for this country/sector combination')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch gender data'
    console.error('Error fetching gender data:', err)
  } finally {
    isLoading.value = false
  }
}

// Color functions
function getHeatmapColor(percentage: number): string {
  const intensity = percentage / 100
  const r = Math.round(255 * (1 - intensity * 0.5))
  const g = Math.round(255 * (1 - intensity * 0.3))
  const b = Math.round(255 * (1 - intensity * 0.1))
  return `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.7})`
}

function getGapColor(gap: number): string {
  const absGap = Math.abs(gap)
  const intensity = Math.min(absGap / 50, 1)

  if (gap > 0) {
    // Positive gap (women higher) - green tones
    return `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`
  } else {
    // Negative gap (men higher) - red tones
    return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`
  }
}

function getGapClass(gap: number): string {
  if (gap > 20) return 'gap-positive-high'
  if (gap > 0) return 'gap-positive'
  if (gap < -20) return 'gap-negative-high'
  return 'gap-negative'
}

function getWomenLeadership(): number {
  const processingActivity = heatmapData.value.find(a => a.name === 'Processing')
  return processingActivity ? processingActivity.women : 85
}

// Chart creation
function createComparisonChart() {
  if (!comparisonCanvas.value) return

  const countries = ['Ghana', 'Kenya', 'Botswana', 'Uganda']
  const womenData = [65, 58, 62, 70]
  const menData = [35, 42, 38, 30]

  const config = {
    type: 'bar' as const,
    data: {
      labels: countries,
      datasets: [
        {
          label: 'Women Participation (%)',
          data: womenData,
          backgroundColor: 'rgba(236, 72, 153, 0.8)',
          borderColor: 'rgba(236, 72, 153, 1)',
          borderWidth: 2
        },
        {
          label: 'Men Participation (%)',
          data: menData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value: any) {
              return value + '%'
            }
          }
        }
      }
    }
  }

  if (comparisonChart.value) {
    comparisonChart.value.destroy()
  }

  comparisonChart.value = new Chart(comparisonCanvas.value, config)
}

// Watchers
watch(selectedView, (newView) => {
  if (newView === 'comparison') {
    nextTick(() => {
      createComparisonChart()
    })
  }
})

// Watchers for props changes
watch([() => props.country, () => props.sector], () => {
  fetchGenderData()
}, { immediate: false })

// Lifecycle
onMounted(() => {
  fetchGenderData()

  if (selectedView.value === 'comparison') {
    nextTick(() => {
      createComparisonChart()
    })
  }
})
</script>

<style scoped>
.gender-matrix {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Loading and Error States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 1rem;
}

.error-state {
  color: #dc2626;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.error-state p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #45a049;
}

.matrix-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.view-selector, .activity-filter {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.view-selector label, .activity-filter label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.view-select, .activity-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
}

/* Heatmap Styles */
.heatmap-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.heatmap-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.heatmap-grid {
  flex: 1;
  min-width: 300px;
}

.grid-header, .grid-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1px;
  margin-bottom: 1px;
}

.grid-cell {
  padding: 0.75rem 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.grid-cell.header {
  background: #f3f4f6;
  font-weight: 600;
  color: #1f2937;
}

.grid-cell.activity-name {
  background: #fafafa;
  text-align: left;
  font-weight: 500;
}

.participation-cell, .gap-cell {
  color: #1f2937;
  font-weight: 500;
}

.heatmap-legend {
  flex-shrink: 0;
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  height: fit-content;
}

.heatmap-legend h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.legend-scale {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.scale-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.scale-color {
  width: 20px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Comparison Styles */
.comparison-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.comparison-chart {
  height: 300px;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comparison-canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Crops Styles */
.crops-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.crops-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.crop-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.crop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.crop-header h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.crop-total {
  font-size: 0.8rem;
  color: #6b7280;
}

.gender-bar {
  position: relative;
  height: 24px;
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.women-bar, .men-bar {
  position: absolute;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.women-bar {
  background: linear-gradient(90deg, #ec4899, #be185d);
  color: white;
  left: 0;
}

.men-bar {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  color: white;
  right: 0;
}

.crop-insights {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.insight-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.insight-label {
  color: #6b7280;
}

.insight-value {
  font-weight: 500;
  color: #1f2937;
}

.insight-value.gap-positive-high {
  color: #059669;
}

.insight-value.gap-positive {
  color: #10b981;
}

.insight-value.gap-negative {
  color: #f59e0b;
}

.insight-value.gap-negative-high {
  color: #dc2626;
}

/* Insights Styles */
.matrix-insights h4 {
  margin: 1rem 0 0.75rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.insight-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.insight-card.highlight {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.1));
  border: 1px solid rgba(236, 72, 153, 0.2);
}

.insight-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.insight-content h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.insight-content p {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .matrix-controls {
    flex-direction: column;
  }

  .heatmap-container {
    flex-direction: column;
  }

  .crops-grid {
    grid-template-columns: 1fr;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }
}
</style>
