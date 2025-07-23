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
      <div class="matrix-header">
        <h2>👩‍🌾 Gender Participation Matrix - {{ countryName }}</h2>
        <p>Female participation across agricultural activities and crop types</p>
      
      <div class="view-controls">
        <button 
          v-for="view in views" 
          :key="view.key"
          @click="selectedView = view.key"
          :class="['view-btn', { active: selectedView === view.key }]"
        >
          {{ view.icon }} {{ view.label }}
        </button>
      </div>
    </div>

    <!-- Heatmap Matrix View -->
    <div v-if="selectedView === 'heatmap'" class="heatmap-section">
      <div class="section-title">
        <h3>🔥 Participation Intensity Heatmap</h3>
        <p>Color intensity shows level of female participation by activity and region</p>
      </div>
      
      <div class="heatmap-container">
        <div class="heatmap-grid">
          <!-- Column headers -->
          <div class="grid-header"></div>
          <div v-for="activity in activities" :key="activity" class="grid-header activity-header">
            {{ activity }}
          </div>
          
          <!-- Data rows -->
          <template v-for="region in regions" :key="region.name">
            <div class="grid-header region-header">{{ region.name }}</div>
            <div 
              v-for="activity in activities" 
              :key="`${region.name}-${activity}`"
              class="grid-cell"
              :style="{ backgroundColor: getHeatmapColor(region.activities[activity]) }"
              @click="selectCell(region.name, activity, region.activities[activity])"
            >
              <span class="cell-value">{{ region.activities[activity] }}%</span>
            </div>
          </template>
        </div>
        
        <!-- Heatmap Legend -->
        <div class="heatmap-legend">
          <h4>Participation Level</h4>
          <div class="legend-gradient">
            <div class="gradient-bar"></div>
            <div class="gradient-labels">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Crop Types Matrix View -->
    <div v-if="selectedView === 'crops'" class="crops-section">
      <div class="section-title">
        <h3>🌾 Crop Types Participation</h3>
        <p>Female participation rates across different crop types and farming practices</p>
      </div>
      
      <div class="crops-grid">
        <div v-for="crop in cropTypes" :key="crop.name" class="crop-card">
          <div class="crop-header">
            <div class="crop-icon">{{ crop.icon }}</div>
            <h4>{{ crop.name }}</h4>
            <div class="participation-badge" :class="getParticipationClass(crop.femaleParticipation)">
              {{ crop.femaleParticipation }}%
            </div>
          </div>
          
          <div class="crop-details">
            <div class="detail-row">
              <span class="label">Production Role:</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: crop.production + '%' }"></div>
                <span class="progress-text">{{ crop.production }}%</span>
              </div>
            </div>
            
            <div class="detail-row">
              <span class="label">Decision Making:</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: crop.decisionMaking + '%' }"></div>
                <span class="progress-text">{{ crop.decisionMaking }}%</span>
              </div>
            </div>
            
            <div class="detail-row">
              <span class="label">Market Access:</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: crop.marketAccess + '%' }"></div>
                <span class="progress-text">{{ crop.marketAccess }}%</span>
              </div>
            </div>
          </div>
          
          <div class="crop-impact">
            <div class="impact-item">
              <i class="fa fa-leaf text-success"></i>
              <span>{{ crop.yield }} avg yield</span>
            </div>
            <div class="impact-item">
              <i class="fa fa-dollar text-primary"></i>
              <span>${{ crop.income }} avg income</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cross-Country Comparison View -->
    <div v-if="selectedView === 'comparison'" class="comparison-section">
      <div class="section-title">
        <h3>🌍 Cross-Country Comparison</h3>
        <p>Gender participation patterns across African countries</p>
      </div>
      
      <div class="comparison-container">
        <div class="comparison-chart">
          <canvas ref="comparisonChart" class="chart-canvas"></canvas>
        </div>
        
        <div class="comparison-insights">
          <div class="insight-card">
            <div class="insight-header">
              <i class="fa fa-trophy text-warning"></i>
              <h4>Highest Participation</h4>
            </div>
            <div class="insight-content">
              <div class="country-rank">
                <span class="country">Rwanda</span>
                <span class="score">87%</span>
              </div>
              <p>Leading in women's agricultural participation and decision-making roles.</p>
            </div>
          </div>
          
          <div class="insight-card">
            <div class="insight-header">
              <i class="fa fa-chart-line text-success"></i>
              <h4>Most Improved</h4>
            </div>
            <div class="insight-content">
              <div class="country-rank">
                <span class="country">Uganda</span>
                <span class="score">+15%</span>
              </div>
              <p>Significant improvement in gender parity over the past 5 years.</p>
            </div>
          </div>
          
          <div class="insight-card">
            <div class="insight-header">
              <i class="fa fa-exclamation-triangle text-danger"></i>
              <h4>Needs Attention</h4>
            </div>
            <div class="insight-content">
              <div class="country-rank">
                <span class="country">{{ country.charAt(0).toUpperCase() + country.slice(1) }}</span>
                <span class="score">{{ getCurrentCountryScore() }}%</span>
              </div>
              <p>Below regional average. Focus on policy interventions needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Cell Details Modal -->
    <div v-if="selectedCell" class="cell-modal-overlay" @click="closeModal">
      <div class="cell-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedCell.region }} - {{ selectedCell.activity }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-content">
          <div class="participation-score">
            <div class="score-circle" :style="{ background: `conic-gradient(#4CAF50 0deg ${selectedCell.value * 3.6}deg, #e5e7eb ${selectedCell.value * 3.6}deg 360deg)` }">
              <div class="score-inner">
                <span class="score-percentage">{{ selectedCell.value }}%</span>
                <span class="score-label">Female Participation</span>
              </div>
            </div>
          </div>
          
          <div class="detailed-metrics">
            <div class="metric-item">
              <span class="metric-label">Women Involved:</span>
              <span class="metric-value">{{ Math.round(selectedCell.value * 47) }} women</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Activity Type:</span>
              <span class="metric-value">{{ selectedCell.activity }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Impact Level:</span>
              <span class="metric-value" :class="getImpactClass(selectedCell.value)">
                {{ getImpactLevel(selectedCell.value) }}
              </span>
            </div>
          </div>
          
          <div class="recommendations">
            <h4>💡 Recommendations</h4>
            <ul>
              <li v-for="rec in getRecommendations(selectedCell.value)" :key="rec">{{ rec }}</li>
            </ul>
          </div>
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

const selectedView = ref('heatmap')
const selectedCell = ref<any>(null)
const comparisonChart = ref<HTMLCanvasElement>()
const comparisonChartInstance = ref<Chart | null>(null)

const views = [
  { key: 'heatmap', label: 'Heatmap', icon: '🔥' },
  { key: 'crops', label: 'Crop Types', icon: '🌾' },
  { key: 'comparison', label: 'Comparison', icon: '🌍' }
]

const activities = [
  'Land Preparation', 'Planting', 'Weeding', 'Harvesting', 
  'Processing', 'Marketing', 'Decision Making', 'Resource Access'
]

const countryName = computed(() => 
  props.country.charAt(0).toUpperCase() + props.country.slice(1)
)

// Sample data for regions and activities
const regions = ref([
  {
    name: 'Northern Region',
    activities: {
      'Land Preparation': 35, 'Planting': 65, 'Weeding': 85, 'Harvesting': 70,
      'Processing': 90, 'Marketing': 45, 'Decision Making': 25, 'Resource Access': 30
    }
  },
  {
    name: 'Central Region', 
    activities: {
      'Land Preparation': 42, 'Planting': 58, 'Weeding': 78, 'Harvesting': 68,
      'Processing': 85, 'Marketing': 52, 'Decision Making': 35, 'Resource Access': 38
    }
  },
  {
    name: 'Eastern Region',
    activities: {
      'Land Preparation': 38, 'Planting': 62, 'Weeding': 82, 'Harvesting': 75,
      'Processing': 88, 'Marketing': 48, 'Decision Making': 28, 'Resource Access': 33
    }
  },
  {
    name: 'Western Region',
    activities: {
      'Land Preparation': 45, 'Planting': 70, 'Weeding': 88, 'Harvesting': 72,
      'Processing': 92, 'Marketing': 55, 'Decision Making': 40, 'Resource Access': 42
    }
  },
  {
    name: 'Southern Region',
    activities: {
      'Land Preparation': 40, 'Planting': 60, 'Weeding': 80, 'Harvesting': 65,
      'Processing': 87, 'Marketing': 50, 'Decision Making': 32, 'Resource Access': 35
    }
  }
])

const cropTypes = ref([
  {
    name: 'Maize',
    icon: '🌽',
    femaleParticipation: 78,
    production: 75,
    decisionMaking: 45,
    marketAccess: 38,
    yield: '2.5 tons/ha',
    income: '850'
  },
  {
    name: 'Rice',
    icon: '🌾',
    femaleParticipation: 65,
    production: 60,
    decisionMaking: 35,
    marketAccess: 42,
    yield: '3.2 tons/ha',
    income: '1200'
  },
  {
    name: 'Cassava',
    icon: '🍠',
    femaleParticipation: 85,
    production: 88,
    decisionMaking: 52,
    marketAccess: 45,
    yield: '15 tons/ha',
    income: '650'
  },
  {
    name: 'Sweet Potato',
    icon: '🍠',
    femaleParticipation: 82,
    production: 85,
    decisionMaking: 48,
    marketAccess: 40,
    yield: '12 tons/ha',
    income: '580'
  },
  {
    name: 'Beans',
    icon: '🫘',
    femaleParticipation: 73,
    production: 70,
    decisionMaking: 42,
    marketAccess: 35,
    yield: '1.8 tons/ha',
    income: '720'
  },
  {
    name: 'Vegetables',
    icon: '🥬',
    femaleParticipation: 90,
    production: 92,
    decisionMaking: 65,
    marketAccess: 70,
    yield: '8 tons/ha',
    income: '1450'
  }
])

function getHeatmapColor(value: number): string {
  // Create gradient from light blue to dark red
  const ratio = value / 100
  const red = Math.round(255 * ratio)
  const green = Math.round(255 * (1 - ratio))
  const blue = Math.round(100 + 155 * (1 - ratio))
  return `rgba(${red}, ${green}, ${blue}, 0.8)`
}

function getParticipationClass(value: number): string {
  if (value >= 80) return 'high'
  if (value >= 60) return 'medium'
  return 'low'
}

function selectCell(region: string, activity: string, value: number) {
  selectedCell.value = { region, activity, value }
}

function closeModal() {
  selectedCell.value = null
}

function getCurrentCountryScore(): number {
  // Calculate average for current country
  const total = regions.value.reduce((sum, region) => {
    const regionAvg = Object.values(region.activities).reduce((a, b) => a + b, 0) / 8
    return sum + regionAvg
  }, 0)
  return Math.round(total / regions.value.length)
}

function getImpactClass(value: number): string {
  if (value >= 70) return 'text-success'
  if (value >= 50) return 'text-warning'
  return 'text-danger'
}

function getImpactLevel(value: number): string {
  if (value >= 70) return 'High Impact'
  if (value >= 50) return 'Medium Impact'
  return 'Low Impact'
}

function getRecommendations(value: number): string[] {
  if (value >= 70) {
    return [
      'Maintain current programs and scale successful practices',
      'Document best practices for replication',
      'Focus on leadership development opportunities'
    ]
  } else if (value >= 50) {
    return [
      'Increase training and capacity building programs',
      'Improve access to resources and technology',
      'Strengthen women\'s cooperatives and networks'
    ]
  } else {
    return [
      'Implement targeted gender equality interventions',
      'Address cultural and social barriers',
      'Provide financial literacy and business training',
      'Establish women-friendly service delivery points'
    ]
  }
}

function createComparisonChart() {
  if (!comparisonChart.value) return

  const countries = ['Ghana', 'Kenya', 'Uganda', 'Botswana', 'Rwanda']
  const participationData = [68, 72, 75, 58, 87]
  const decisionMakingData = [34, 38, 45, 28, 65]
  
  const config = {
    type: 'bar' as const,
    data: {
      labels: countries,
      datasets: [
        {
          label: 'Female Participation %',
          data: participationData,
          backgroundColor: 'rgba(76, 175, 80, 0.8)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 2
        },
        {
          label: 'Decision Making %',
          data: decisionMakingData,
          backgroundColor: 'rgba(33, 150, 243, 0.8)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Gender Participation Across Countries'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Percentage (%)'
          }
        }
      }
    }
  }

  if (comparisonChartInstance.value) {
    comparisonChartInstance.value.destroy()
  }

  comparisonChartInstance.value = new Chart(comparisonChart.value, config)
}

onMounted(() => {
  nextTick(() => {
    if (selectedView.value === 'comparison') {
      createComparisonChart()
    }
  })
})

// Watch for view changes to create chart
watch(selectedView, (newView) => {
  if (newView === 'comparison') {
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
  padding: 2rem;
  overflow-y: auto;
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

.matrix-header {
  margin-bottom: 2rem;
  text-align: center;
}

.matrix-header h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
}

.matrix-header p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  font-size: 1.1rem;
}

.view-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.view-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

.view-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.section-title {
  margin-bottom: 2rem;
  text-align: center;
}

.section-title h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.section-title p {
  margin: 0;
  color: #6b7280;
}

/* Heatmap Styles */
.heatmap-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: 150px repeat(8, 120px);
  gap: 2px;
  background: #e5e7eb;
  border-radius: 8px;
  padding: 2px;
  flex: 1;
}

.grid-header {
  background: #f3f4f6;
  padding: 0.75rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.activity-header {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.region-header {
  background: #e5e7eb;
  font-weight: 700;
}

.grid-cell {
  background: white;
  padding: 0.75rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.grid-cell:hover {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cell-value {
  font-weight: 600;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.heatmap-legend {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 200px;
}

.heatmap-legend h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.legend-gradient {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gradient-bar {
  height: 20px;
  background: linear-gradient(to right, rgba(100, 155, 255, 0.8), rgba(255, 100, 100, 0.8));
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Crops Grid Styles */
.crops-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.crop-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s;
}

.crop-card:hover {
  transform: translateY(-2px);
}

.crop-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.crop-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-radius: 12px;
}

.crop-header h4 {
  flex: 1;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.participation-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.875rem;
}

.participation-badge.high {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.participation-badge.medium {
  background: rgba(255, 193, 7, 0.2);
  color: #FFC107;
}

.participation-badge.low {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
}

.crop-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-row .label {
  font-size: 0.875rem;
  color: #6b7280;
  min-width: 120px;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background: #f3f4f6;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.crop-impact {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.text-success { color: #16a34a; }
.text-primary { color: #3b82f6; }

/* Comparison Chart Styles */
.comparison-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  height: 500px;
}

.comparison-chart {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}

.comparison-insights {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.insight-header i {
  font-size: 1.5rem;
}

.insight-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.country-rank {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.country-rank .country {
  font-weight: 600;
  color: #1f2937;
}

.country-rank .score {
  font-weight: 700;
  color: #4CAF50;
}

.insight-content p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.text-warning { color: #f59e0b; }
.text-danger { color: #dc2626; }

/* Modal Styles */
.cell-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.cell-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1));
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #6b7280;
}

.modal-content {
  padding: 2rem;
}

.participation-score {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-inner {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.score-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.score-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.detailed-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.metric-value {
  font-weight: 600;
  color: #1f2937;
}

.recommendations h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.recommendations ul {
  margin: 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.recommendations li {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .heatmap-container {
    flex-direction: column;
  }
  
  .heatmap-grid {
    grid-template-columns: 150px repeat(8, 100px);
  }
  
  .comparison-container {
    grid-template-columns: 1fr;
    height: auto;
  }
}

@media (max-width: 768px) {
  .gender-matrix {
    padding: 1rem;
  }
  
  .view-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .heatmap-grid {
    grid-template-columns: 120px repeat(8, 80px);
    font-size: 0.75rem;
  }
  
  .crops-grid {
    grid-template-columns: 1fr;
  }
}
</style>