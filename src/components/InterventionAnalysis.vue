<template>
  <div class="intervention-analysis">
    <div class="analysis-header">
      <h3>📋 Intervention Analysis</h3>
      <div class="analysis-controls">
        <select v-model="selectedMetric" class="metric-select">
          <option value="effectiveness">Effectiveness</option>
          <option value="reach">Population Reach</option>
          <option value="cost">Cost Efficiency</option>
          <option value="gender">Gender Impact</option>
        </select>
      </div>
    </div>

    <!-- Effectiveness Analysis -->
    <div v-if="selectedMetric === 'effectiveness'" class="effectiveness-section">
      <h4>Intervention Effectiveness Analysis</h4>
      
      <div class="effectiveness-chart">
        <canvas ref="effectivenessCanvas" class="chart-canvas"></canvas>
      </div>
      
      <div class="effectiveness-insights">
        <div class="insight-cards">
          <div class="insight-card success">
            <div class="card-icon">🎯</div>
            <div class="card-content">
              <h5>Most Effective</h5>
              <p>{{ mostEffectiveIntervention.name }}</p>
              <span class="effectiveness-score">{{ mostEffectiveIntervention.score }}% success rate</span>
            </div>
          </div>
          
          <div class="insight-card improvement">
            <div class="card-icon">📈</div>
            <div class="card-content">
              <h5>Needs Improvement</h5>
              <p>{{ leastEffectiveIntervention.name }}</p>
              <span class="effectiveness-score">{{ leastEffectiveIntervention.score }}% success rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Population Reach Analysis -->
    <div v-if="selectedMetric === 'reach'" class="reach-section">
      <h4>Population Reach & Coverage</h4>
      
      <div class="reach-overview">
        <div class="reach-stats">
          <div class="stat-item">
            <span class="stat-number">{{ totalBeneficiaries.toLocaleString() }}</span>
            <span class="stat-label">Total Beneficiaries</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ womenBeneficiaries.toLocaleString() }}</span>
            <span class="stat-label">Women Beneficiaries</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ coveragePercentage }}%</span>
            <span class="stat-label">Population Coverage</span>
          </div>
        </div>
      </div>
      
      <div class="reach-breakdown">
        <h5>Reach by Intervention Type</h5>
        <div class="reach-bars">
          <div v-for="intervention in reachData" :key="intervention.id" class="reach-bar-item">
            <div class="bar-header">
              <span class="intervention-name">{{ intervention.name }}</span>
              <span class="beneficiary-count">{{ intervention.beneficiaries.toLocaleString() }}</span>
            </div>
            <div class="reach-bar">
              <div class="bar-fill" :style="{ 
                width: (intervention.beneficiaries / maxBeneficiaries * 100) + '%',
                backgroundColor: intervention.color 
              }"></div>
            </div>
            <div class="bar-details">
              <span class="women-percentage">{{ intervention.womenPercentage }}% women</span>
              <span class="geographic-coverage">{{ intervention.regions.length }} regions</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cost Efficiency Analysis -->
    <div v-if="selectedMetric === 'cost'" class="cost-section">
      <h4>Cost-Effectiveness Analysis</h4>
      
      <div class="cost-metrics">
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">💰</span>
              <h5>Cost per Beneficiary</h5>
            </div>
            <div class="metric-value">
              ${{ averageCostPerBeneficiary }}
            </div>
            <div class="metric-trend positive">
              <span class="trend-icon">↓</span>
              <span>15% reduction from last year</span>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">⚡</span>
              <h5>Impact per Dollar</h5>
            </div>
            <div class="metric-value">
              {{ impactPerDollar }}
            </div>
            <div class="metric-trend positive">
              <span class="trend-icon">↑</span>
              <span>22% improvement</span>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">🎯</span>
              <h5>ROI on Climate Adaptation</h5>
            </div>
            <div class="metric-value">
              {{ climateROI }}x
            </div>
            <div class="metric-trend positive">
              <span class="trend-icon">↑</span>
              <span>Every $1 saves ${{ climateROI }} in damages</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="cost-comparison">
        <h5>Cost Efficiency by Intervention</h5>
        <div class="comparison-table">
          <div class="table-header">
            <span>Intervention</span>
            <span>Total Cost</span>
            <span>Beneficiaries</span>
            <span>Cost/Person</span>
            <span>Efficiency</span>
          </div>
          <div v-for="item in costData" :key="item.id" class="table-row">
            <span class="intervention-name">{{ item.name }}</span>
            <span class="cost-amount">${{ item.totalCost }}</span>
            <span class="beneficiary-count">{{ item.beneficiaries.toLocaleString() }}</span>
            <span class="cost-per-person">${{ item.costPerPerson }}</span>
            <span class="efficiency-rating" :class="getEfficiencyClass(item.efficiency)">
              {{ item.efficiency }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Gender Impact Analysis -->
    <div v-if="selectedMetric === 'gender'" class="gender-section">
      <h4>Gender Impact Assessment</h4>
      
      <div class="gender-overview">
        <div class="gender-stats">
          <div class="stat-circle">
            <div class="circle-chart" :style="{ background: `conic-gradient(#ec4899 0deg ${womenParticipationAngle}deg, #e5e7eb ${womenParticipationAngle}deg 360deg)` }">
              <div class="circle-inner">
                <span class="circle-percentage">{{ womenParticipationRate }}%</span>
                <span class="circle-label">Women Participation</span>
              </div>
            </div>
          </div>
          
          <div class="gender-breakdown">
            <div class="breakdown-item">
              <span class="breakdown-label">Leadership Roles</span>
              <div class="breakdown-bar">
                <div class="bar-segment women" :style="{ width: '65%' }">65%</div>
                <div class="bar-segment men" :style="{ width: '35%' }">35%</div>
              </div>
            </div>
            
            <div class="breakdown-item">
              <span class="breakdown-label">Decision Making</span>
              <div class="breakdown-bar">
                <div class="bar-segment women" :style="{ width: '58%' }">58%</div>
                <div class="bar-segment men" :style="{ width: '42%' }">42%</div>
              </div>
            </div>
            
            <div class="breakdown-item">
              <span class="breakdown-label">Resource Access</span>
              <div class="breakdown-bar">
                <div class="bar-segment women" :style="{ width: '45%' }">45%</div>
                <div class="bar-segment men" :style="{ width: '55%' }">55%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="gender-interventions">
        <h5>Gender-Responsive Interventions</h5>
        <div class="intervention-cards">
          <div v-for="intervention in genderInterventions" :key="intervention.id" class="gender-card">
            <div class="card-header">
              <span class="card-icon">{{ intervention.icon }}</span>
              <h6>{{ intervention.name }}</h6>
              <span class="gender-score" :class="getGenderScoreClass(intervention.genderScore)">
                {{ intervention.genderScore }}/10
              </span>
            </div>
            
            <div class="card-metrics">
              <div class="metric">
                <span class="metric-label">Women Beneficiaries:</span>
                <span class="metric-value">{{ intervention.womenBeneficiaries }}%</span>
              </div>
              <div class="metric">
                <span class="metric-label">Gender Gap Reduction:</span>
                <span class="metric-value">{{ intervention.gapReduction }}%</span>
              </div>
              <div class="metric">
                <span class="metric-label">Empowerment Index:</span>
                <span class="metric-value">{{ intervention.empowermentIndex }}/100</span>
              </div>
            </div>
            
            <div class="card-impact">
              <p>{{ intervention.impact }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="recommendations-section">
      <h4>📌 Key Recommendations</h4>
      <div class="recommendations-list">
        <div v-for="rec in recommendations" :key="rec.id" class="recommendation-item">
          <div class="rec-priority" :class="getPriorityClass(rec.priority)">
            {{ rec.priority }}
          </div>
          <div class="rec-content">
            <h5>{{ rec.title }}</h5>
            <p>{{ rec.description }}</p>
            <div class="rec-actions">
              <span class="action-item" v-for="action in rec.actions" :key="action">
                • {{ action }}
              </span>
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

const selectedMetric = ref('effectiveness')
const effectivenessCanvas = ref<HTMLCanvasElement>()
const effectivenessChart = ref<Chart | null>(null)

// Sample data
const interventionData = ref([
  {
    id: 1,
    name: 'Climate-Smart Agriculture',
    effectiveness: 78,
    beneficiaries: 15000,
    womenBeneficiaries: 62,
    cost: 2500000,
    genderScore: 8.5,
    regions: ['Northern', 'Upper East', 'Brong Ahafo'],
    color: '#3b82f6'
  },
  {
    id: 2,
    name: 'Water Harvesting Systems',
    effectiveness: 85,
    beneficiaries: 8500,
    womenBeneficiaries: 72,
    cost: 1800000,
    genderScore: 9.2,
    regions: ['Central', 'Eastern', 'Ashanti'],
    color: '#10b981'
  },
  {
    id: 3,
    name: 'Early Warning Systems',
    effectiveness: 72,
    beneficiaries: 25000,
    womenBeneficiaries: 55,
    cost: 850000,
    genderScore: 7.8,
    regions: ['All Regions'],
    color: '#f59e0b'
  },
  {
    id: 4,
    name: 'Crop Diversification',
    effectiveness: 68,
    beneficiaries: 12000,
    womenBeneficiaries: 68,
    cost: 1200000,
    genderScore: 8.0,
    regions: ['Volta', 'Western', 'Greater Accra'],
    color: '#8b5cf6'
  }
])

const genderInterventions = ref([
  {
    id: 1,
    name: 'Women\'s Climate Leadership Program',
    icon: '👩‍💼',
    genderScore: 9.5,
    womenBeneficiaries: 85,
    gapReduction: 35,
    empowermentIndex: 78,
    impact: 'Significantly increased women\'s participation in climate decision-making at community level.'
  },
  {
    id: 2,
    name: 'Gender-Responsive Early Warning',
    icon: '📢',
    genderScore: 8.2,
    womenBeneficiaries: 58,
    gapReduction: 28,
    empowermentIndex: 65,
    impact: 'Improved access to climate information for women farmers through culturally appropriate channels.'
  },
  {
    id: 3,
    name: 'Women\'s Cooperative Strengthening',
    icon: '🤝',
    genderScore: 8.8,
    womenBeneficiaries: 92,
    gapReduction: 42,
    empowermentIndex: 82,
    impact: 'Enhanced collective bargaining power and market access for women farmers.'
  }
])

const recommendations = ref([
  {
    id: 1,
    priority: 'High',
    title: 'Scale Up Water Harvesting Systems',
    description: 'Expand the most cost-effective intervention to additional vulnerable regions.',
    actions: ['Identify 5 additional districts', 'Secure $3M additional funding', 'Train 50 technicians']
  },
  {
    id: 2,
    priority: 'Medium',
    title: 'Improve Crop Diversification Effectiveness',
    description: 'Address implementation challenges in the crop diversification program.',
    actions: ['Conduct effectiveness review', 'Enhance farmer training', 'Improve seed distribution']
  },
  {
    id: 3,
    priority: 'High',
    title: 'Strengthen Gender Integration',
    description: 'Enhance gender-responsive elements across all interventions.',
    actions: ['Mandatory gender training', 'Gender-disaggregated M&E', 'Women leadership quotas']
  }
])

// Computed properties
const mostEffectiveIntervention = computed(() => {
  const most = interventionData.value.reduce((max, item) => 
    item.effectiveness > max.effectiveness ? item : max
  )
  return { name: most.name, score: most.effectiveness }
})

const leastEffectiveIntervention = computed(() => {
  const least = interventionData.value.reduce((min, item) => 
    item.effectiveness < min.effectiveness ? item : min
  )
  return { name: least.name, score: least.effectiveness }
})

const totalBeneficiaries = computed(() => 
  interventionData.value.reduce((sum, item) => sum + item.beneficiaries, 0)
)

const womenBeneficiaries = computed(() => 
  Math.round(interventionData.value.reduce((sum, item) => 
    sum + (item.beneficiaries * item.womenBeneficiaries / 100), 0
  ))
)

const coveragePercentage = computed(() => 45) // Sample calculation

const reachData = computed(() => interventionData.value.map(item => ({
  ...item,
  womenPercentage: item.womenBeneficiaries
})))

const maxBeneficiaries = computed(() => 
  Math.max(...interventionData.value.map(item => item.beneficiaries))
)

const averageCostPerBeneficiary = computed(() => {
  const totalCost = interventionData.value.reduce((sum, item) => sum + item.cost, 0)
  return Math.round(totalCost / totalBeneficiaries.value)
})

const impactPerDollar = computed(() => '2.4x')
const climateROI = computed(() => 4.2)

const costData = computed(() => 
  interventionData.value.map(item => ({
    id: item.id,
    name: item.name,
    totalCost: (item.cost / 1000).toFixed(0) + 'K',
    beneficiaries: item.beneficiaries,
    costPerPerson: Math.round(item.cost / item.beneficiaries),
    efficiency: item.effectiveness > 75 ? 'High' : item.effectiveness > 60 ? 'Medium' : 'Low'
  }))
)

const womenParticipationRate = computed(() => 
  Math.round(womenBeneficiaries.value / totalBeneficiaries.value * 100)
)

const womenParticipationAngle = computed(() => 
  womenParticipationRate.value * 3.6
)

// Helper functions
function getEfficiencyClass(efficiency: string): string {
  switch (efficiency) {
    case 'High': return 'efficiency-high'
    case 'Medium': return 'efficiency-medium'
    case 'Low': return 'efficiency-low'
    default: return ''
  }
}

function getGenderScoreClass(score: number): string {
  if (score >= 8.5) return 'score-excellent'
  if (score >= 7.5) return 'score-good'
  return 'score-needs-improvement'
}

function getPriorityClass(priority: string): string {
  switch (priority) {
    case 'High': return 'priority-high'
    case 'Medium': return 'priority-medium'
    case 'Low': return 'priority-low'
    default: return ''
  }
}

// Chart creation
function createEffectivenessChart() {
  if (!effectivenessCanvas.value) return

  const data = interventionData.value.map(item => ({
    x: item.beneficiaries,
    y: item.effectiveness,
    label: item.name,
    backgroundColor: item.color
  }))

  const config = {
    type: 'scatter' as const,
    data: {
      datasets: [{
        label: 'Interventions',
        data: data,
        backgroundColor: data.map(d => d.backgroundColor),
        borderColor: data.map(d => d.backgroundColor),
        borderWidth: 2,
        pointRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function(context: any) {
              return data[context[0].dataIndex].label
            },
            label: function(context: any) {
              return [
                `Effectiveness: ${context.parsed.y}%`,
                `Beneficiaries: ${context.parsed.x.toLocaleString()}`
              ]
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Beneficiaries'
          },
          beginAtZero: true
        },
        y: {
          title: {
            display: true,
            text: 'Effectiveness (%)'
          },
          beginAtZero: true,
          max: 100
        }
      }
    }
  }

  if (effectivenessChart.value) {
    effectivenessChart.value.destroy()
  }

  effectivenessChart.value = new Chart(effectivenessCanvas.value, config)
}

// Watchers
watch(selectedMetric, (newMetric) => {
  if (newMetric === 'effectiveness') {
    nextTick(() => {
      createEffectivenessChart()
    })
  }
})

// Lifecycle
onMounted(() => {
  if (selectedMetric.value === 'effectiveness') {
    nextTick(() => {
      createEffectivenessChart()
    })
  }
})
</script>

<style scoped>
.intervention-analysis {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.analysis-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.metric-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
}

/* Effectiveness Styles */
.effectiveness-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-weight: 600;
}

.effectiveness-chart {
  height: 300px;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}

.effectiveness-insights .insight-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.insight-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.insight-card.success {
  border-left: 4px solid #10b981;
}

.insight-card.improvement {
  border-left: 4px solid #f59e0b;
}

.card-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.card-content h5 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #1f2937;
}

.card-content p {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
}

.effectiveness-score {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
}

/* Reach Styles */
.reach-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-weight: 600;
}

.reach-stats {
  display: flex;
  justify-content: space-around;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.1));
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.reach-breakdown h5 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-weight: 600;
}

.reach-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reach-bar-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.intervention-name {
  font-weight: 600;
  color: #1f2937;
}

.beneficiary-count {
  font-weight: 600;
  color: #3b82f6;
}

.reach-bar {
  height: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.bar-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.bar-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6b7280;
}

/* Cost Styles */
.cost-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-weight: 600;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.metric-icon {
  font-size: 1.5rem;
}

.metric-header h5 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
}

.metric-trend.positive {
  color: #10b981;
}

.cost-comparison h5 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-weight: 600;
}

.comparison-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
}

.table-header {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.table-row {
  border-top: 1px solid #f3f4f6;
}

.efficiency-rating.efficiency-high {
  color: #10b981;
  font-weight: 600;
}

.efficiency-rating.efficiency-medium {
  color: #f59e0b;
  font-weight: 600;
}

.efficiency-rating.efficiency-low {
  color: #ef4444;
  font-weight: 600;
}

/* Gender Styles */
.gender-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-weight: 600;
}

.gender-stats {
  display: flex;
  gap: 2rem;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.stat-circle {
  flex-shrink: 0;
}

.circle-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle-inner {
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

.circle-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.circle-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.gender-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.breakdown-label {
  min-width: 120px;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.breakdown-bar {
  flex: 1;
  height: 20px;
  background: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
}

.bar-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.bar-segment.women {
  background: #ec4899;
}

.bar-segment.men {
  background: #3b82f6;
}

.gender-interventions h5 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-weight: 600;
}

.intervention-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.gender-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.gender-card .card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.gender-card .card-icon {
  font-size: 1.5rem;
}

.gender-card h6 {
  flex: 1;
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

.gender-score {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.gender-score.score-excellent {
  background: rgba(16, 185, 129, 0.2);
  color: #059669;
}

.gender-score.score-good {
  background: rgba(245, 158, 11, 0.2);
  color: #d97706;
}

.gender-score.score-needs-improvement {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.card-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.card-metrics .metric {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.metric-label {
  color: #6b7280;
}

.metric-value {
  font-weight: 600;
  color: #1f2937;
}

.card-impact p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Recommendations Styles */
.recommendations-section h4 {
  margin: 2rem 0 1rem 0;
  color: #1f2937;
  font-weight: 600;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  gap: 1rem;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.rec-priority {
  flex-shrink: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  height: fit-content;
}

.rec-priority.priority-high {
  background: #dc2626;
  color: white;
}

.rec-priority.priority-medium {
  background: #d97706;
  color: white;
}

.rec-priority.priority-low {
  background: #65a30d;
  color: white;
}

.rec-content h5 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #1f2937;
}

.rec-content p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  line-height: 1.4;
}

.rec-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-item {
  font-size: 0.8rem;
  color: #374151;
}

@media (max-width: 768px) {
  .analysis-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .gender-stats {
    flex-direction: column;
    text-align: center;
  }
  
  .breakdown-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .breakdown-label {
    min-width: auto;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .recommendation-item {
    flex-direction: column;
  }
}
</style>