<template>
  <div class="climate-trends">
    <div class="trends-controls">
      <div class="time-selector">
        <label>Time Period:</label>
        <select v-model="selectedPeriod" class="period-select">
          <option value="yearly">Yearly Trends</option>
          <option value="seasonal">Seasonal Patterns</option>
          <option value="monthly">Monthly Data</option>
        </select>
      </div>
      
      <div class="metric-selector">
        <label>Climate Metric:</label>
        <select v-model="selectedMetric" class="metric-select">
          <option value="temperature">🌡️ Temperature</option>
          <option value="rainfall">🌧️ Rainfall</option>
          <option value="drought">🏜️ Drought Index</option>
          <option value="extreme">⚡ Extreme Events</option>
        </select>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="chartCanvas" class="trends-chart"></canvas>
    </div>

    <div class="trends-insights">
      <h4>Key Trends for {{ countryName }}</h4>
      <div class="insight-grid">
        <div class="insight-card">
          <div class="insight-icon">📈</div>
          <div class="insight-content">
            <h5>Temperature Rise</h5>
            <p>Average temperature increased by 1.2°C over the past decade</p>
          </div>
        </div>
        
        <div class="insight-card">
          <div class="insight-icon">💧</div>
          <div class="insight-content">
            <h5>Rainfall Variation</h5>
            <p>15% decrease in annual rainfall patterns observed</p>
          </div>
        </div>
        
        <div class="insight-card">
          <div class="insight-icon">⚠️</div>
          <div class="insight-content">
            <h5>Extreme Events</h5>
            <p>25% increase in drought frequency since 2010</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

interface Props {
  country: string
  sector: string
}

const props = defineProps<Props>()

// Reactive variables
const chartCanvas = ref<HTMLCanvasElement>()
const chart = ref<Chart | null>(null)
const selectedPeriod = ref('yearly')
const selectedMetric = ref('temperature')

// Computed
const countryName = computed(() => props.country.charAt(0).toUpperCase() + props.country.slice(1))

// Sample data generation
function generateTrendData(metric: string, period: string) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i)
  
  let data: number[] = []
  let labels: string[] = []
  
  switch (metric) {
    case 'temperature':
      data = years.map((_, i) => 25 + Math.random() * 3 + i * 0.1) // Gradual increase
      labels = years.map(y => y.toString())
      break
    case 'rainfall':
      data = years.map(() => 800 + Math.random() * 400 - 200) // Variation around 800mm
      labels = years.map(y => y.toString())
      break
    case 'drought':
      data = years.map(() => Math.random() * 100) // Drought index 0-100
      labels = years.map(y => y.toString())
      break
    case 'extreme':
      data = years.map(() => Math.floor(Math.random() * 10)) // Number of extreme events
      labels = years.map(y => y.toString())
      break
  }
  
  return { data, labels }
}

function createChart() {
  if (!chartCanvas.value) return

  const { data, labels } = generateTrendData(selectedMetric.value, selectedPeriod.value)
  
  const config = {
    type: 'line' as const,
    data: {
      labels,
      datasets: [{
        label: getMetricLabel(selectedMetric.value),
        data,
        borderColor: getMetricColor(selectedMetric.value),
        backgroundColor: getMetricColor(selectedMetric.value) + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: getMetricColor(selectedMetric.value),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: getMetricColor(selectedMetric.value),
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: selectedMetric.value === 'extreme',
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: function(value: any) {
              return formatValue(value, selectedMetric.value)
            }
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const
      }
    }
  }

  // Destroy existing chart
  if (chart.value) {
    chart.value.destroy()
  }

  // Create new chart
  chart.value = new Chart(chartCanvas.value, config)
}

function getMetricLabel(metric: string): string {
  const labels = {
    temperature: 'Average Temperature (°C)',
    rainfall: 'Annual Rainfall (mm)',
    drought: 'Drought Index',
    extreme: 'Extreme Events Count'
  }
  return labels[metric as keyof typeof labels] || metric
}

function getMetricColor(metric: string): string {
  const colors = {
    temperature: '#ef4444',
    rainfall: '#3b82f6',
    drought: '#f59e0b',
    extreme: '#8b5cf6'
  }
  return colors[metric as keyof typeof colors] || '#6b7280'
}

function formatValue(value: number, metric: string): string {
  switch (metric) {
    case 'temperature':
      return value.toFixed(1) + '°C'
    case 'rainfall':
      return Math.round(value) + 'mm'
    case 'drought':
      return Math.round(value) + '%'
    case 'extreme':
      return Math.round(value).toString()
    default:
      return value.toString()
  }
}

// Watchers
watch([selectedMetric, selectedPeriod], () => {
  createChart()
})

watch(() => props.country, () => {
  // Regenerate chart with new country data
  createChart()
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  createChart()
})
</script>

<style scoped>
.climate-trends {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.trends-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.time-selector, .metric-selector {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-selector label, .metric-selector label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.period-select, .metric-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
}

.chart-container {
  flex: 1;
  min-height: 300px;
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.trends-chart {
  width: 100% !important;
  height: 100% !important;
}

.trends-insights h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.insight-grid {
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
  .trends-controls {
    flex-direction: column;
  }
  
  .insight-grid {
    grid-template-columns: 1fr;
  }
}
</style>