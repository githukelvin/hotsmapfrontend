<template>
  <div class="ai-insights">
    <div class="insights-header">
      <h3>🤖 AI-Powered Climate Insights</h3>
      <div class="analysis-status">
        <span class="status-indicator" :class="{ active: isAnalyzing }"></span>
        <span class="status-text">{{ isAnalyzing ? 'Analyzing...' : 'Analysis Complete' }}</span>
      </div>
    </div>

    <!-- Clustering Results -->
    <div class="insight-section">
      <h4>🔗 Regional Clustering</h4>
      <div class="clustering-results">
        <div v-for="cluster in clusteringData" :key="cluster.id" class="cluster-card">
          <div class="cluster-header">
            <span class="cluster-icon">{{ cluster.icon }}</span>
            <h5>{{ cluster.name }}</h5>
            <span class="cluster-count">{{ cluster.regions.length }} regions</span>
          </div>
          <div class="cluster-regions">
            <span v-for="region in cluster.regions" :key="region" class="region-tag">
              {{ region }}
            </span>
          </div>
          <div class="cluster-characteristics">
            <p>{{ cluster.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Correlation Analysis -->
    <div class="insight-section">
      <h4>📊 Climate-Gender Correlations</h4>
      <div class="correlations-grid">
        <div v-for="correlation in correlationData" :key="correlation.id" class="correlation-card">
          <div class="correlation-strength" :class="getStrengthClass(correlation.strength)">
            {{ Math.abs(correlation.strength).toFixed(2) }}
          </div>
          <div class="correlation-content">
            <h5>{{ correlation.title }}</h5>
            <p>{{ correlation.description }}</p>
            <div class="correlation-direction">
              <span class="direction-icon">{{ correlation.strength > 0 ? '↗️' : '↘️' }}</span>
              <span>{{ correlation.strength > 0 ? 'Positive' : 'Negative' }} Correlation</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Predictive Insights -->
    <div class="insight-section">
      <h4>🔮 Vulnerability Predictions</h4>
      <div class="predictions-container">
        <div class="prediction-timeline">
          <div class="timeline-header">
            <h5>Next 5 Years Outlook</h5>
            <span class="confidence">85% Confidence</span>
          </div>
          <div class="timeline-items">
            <div v-for="prediction in predictionData" :key="prediction.year" class="timeline-item">
              <div class="timeline-year">{{ prediction.year }}</div>
              <div class="timeline-content">
                <div class="prediction-bar">
                  <div class="bar-fill" :style="{ width: prediction.vulnerability + '%', backgroundColor: getPredictionColor(prediction.vulnerability) }"></div>
                </div>
                <span class="prediction-value">{{ prediction.vulnerability }}% vulnerability</span>
              </div>
              <div class="timeline-events" v-if="prediction.events.length">
                <div v-for="event in prediction.events" :key="event" class="event-tag">
                  {{ event }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="prediction-factors">
          <h5>Key Risk Factors</h5>
          <div class="factors-list">
            <div v-for="factor in riskFactors" :key="factor.name" class="factor-item">
              <div class="factor-name">{{ factor.icon }} {{ factor.name }}</div>
              <div class="factor-impact" :class="getImpactClass(factor.impact)">
                {{ factor.impact > 0 ? '+' : '' }}{{ factor.impact }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ML Recommendations -->
    <div class="insight-section">
      <h4>💡 AI Recommendations</h4>
      <div class="recommendations-list">
        <div v-for="recommendation in recommendationData" :key="recommendation.id" class="recommendation-card">
          <div class="recommendation-priority" :class="getPriorityClass(recommendation.priority)">
            {{ recommendation.priority }}
          </div>
          <div class="recommendation-content">
            <h5>{{ recommendation.title }}</h5>
            <p>{{ recommendation.description }}</p>
            <div class="recommendation-metrics">
              <div class="metric">
                <span class="metric-label">Expected Impact:</span>
                <span class="metric-value">{{ recommendation.expectedImpact }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Time Frame:</span>
                <span class="metric-value">{{ recommendation.timeFrame }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Cost:</span>
                <span class="metric-value">{{ recommendation.cost }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time Updates -->
    <div class="updates-footer">
      <div class="update-info">
        <span class="update-icon">🔄</span>
        <span>Last updated: {{ lastUpdated }}</span>
      </div>
      <button @click="refreshAnalysis" class="refresh-btn" :disabled="isAnalyzing">
        {{ isAnalyzing ? 'Analyzing...' : 'Refresh Analysis' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  country: string
  sector: string
  choroplethData: any[]
  hotspots: any[]
}

const props = defineProps<Props>()

// Reactive data
const isAnalyzing = ref(false)
const lastUpdated = ref(new Date().toLocaleTimeString())

// Sample AI analysis data
const clusteringData = ref([
  {
    id: 1,
    name: 'High-Risk Coastal',
    icon: '🌊',
    regions: ['Greater Accra', 'Central', 'Western'],
    description: 'Coastal regions with high climate exposure and significant gender gaps in agricultural participation.'
  },
  {
    id: 2,
    name: 'Northern Drought-Prone',
    icon: '🏜️',
    regions: ['Northern', 'Upper East', 'Upper West'],
    description: 'Arid regions with extreme vulnerability to drought and traditional gender role disparities.'
  },
  {
    id: 3,
    name: 'Forest Transition',
    icon: '🌳',
    regions: ['Ashanti', 'Eastern', 'Brong Ahafo'],
    description: 'Forest-savanna transition zones with moderate vulnerability and improving gender equity.'
  }
])

const correlationData = ref([
  {
    id: 1,
    title: 'Climate Risk vs Women\'s Land Access',
    description: 'Higher climate vulnerability correlates with reduced women\'s access to land ownership.',
    strength: -0.73
  },
  {
    id: 2,
    title: 'Drought Frequency vs Gender Participation Gap',
    description: 'Increased drought frequency widens the gap in agricultural decision-making roles.',
    strength: 0.68
  },
  {
    id: 3,
    title: 'Temperature Rise vs Women\'s Economic Burden',
    description: 'Rising temperatures increase women\'s unpaid care work and resource collection time.',
    strength: 0.81
  }
])

const predictionData = ref([
  {
    year: 2025,
    vulnerability: 72,
    events: ['Increased drought risk']
  },
  {
    year: 2026,
    vulnerability: 75,
    events: ['Water stress intensifies']
  },
  {
    year: 2027,
    vulnerability: 78,
    events: ['Crop yield decline', 'Migration increase']
  },
  {
    year: 2028,
    vulnerability: 82,
    events: ['Extreme weather events']
  },
  {
    year: 2029,
    vulnerability: 79,
    events: ['Adaptation measures impact']
  }
])

const riskFactors = ref([
  { name: 'Temperature Rise', icon: '🌡️', impact: 15 },
  { name: 'Rainfall Variability', icon: '🌧️', impact: 23 },
  { name: 'Gender Inequality', icon: '⚖️', impact: 18 },
  { name: 'Land Degradation', icon: '🏞️', impact: 12 },
  { name: 'Water Scarcity', icon: '💧', impact: 28 },
  { name: 'Market Access', icon: '🏪', impact: -8 }
])

const recommendationData = ref([
  {
    id: 1,
    title: 'Gender-Responsive Climate Adaptation',
    description: 'Implement climate adaptation programs that specifically address women\'s needs and include them in decision-making processes.',
    priority: 'High',
    expectedImpact: 'Reduce vulnerability by 15-20%',
    timeFrame: '2-3 years',
    cost: 'Medium'
  },
  {
    id: 2,
    title: 'Women\'s Land Rights Initiative',
    description: 'Strengthen legal frameworks and support systems to improve women\'s access to land ownership and tenure security.',
    priority: 'High',
    expectedImpact: 'Improve adaptive capacity by 25%',
    timeFrame: '3-5 years',
    cost: 'High'
  },
  {
    id: 3,
    title: 'Climate-Smart Agriculture Training',
    description: 'Provide gender-inclusive training on climate-resilient farming techniques and drought-resistant crop varieties.',
    priority: 'Medium',
    expectedImpact: 'Increase resilience by 10-15%',
    timeFrame: '1-2 years',
    cost: 'Low'
  }
])

// Computed properties
const countryName = computed(() => props.country.charAt(0).toUpperCase() + props.country.slice(1))

// Helper functions
function getStrengthClass(strength: number): string {
  const abs = Math.abs(strength)
  if (abs >= 0.7) return 'strength-high'
  if (abs >= 0.5) return 'strength-medium'
  return 'strength-low'
}

function getPredictionColor(vulnerability: number): string {
  if (vulnerability >= 80) return '#dc2626'
  if (vulnerability >= 70) return '#ea580c'
  if (vulnerability >= 60) return '#d97706'
  return '#65a30d'
}

function getImpactClass(impact: number): string {
  if (impact > 20) return 'impact-high-positive'
  if (impact > 0) return 'impact-positive'
  if (impact < -10) return 'impact-high-negative'
  return 'impact-negative'
}

function getPriorityClass(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high': return 'priority-high'
    case 'medium': return 'priority-medium'
    case 'low': return 'priority-low'
    default: return 'priority-medium'
  }
}

// Actions
async function refreshAnalysis() {
  isAnalyzing.value = true
  
  // Simulate AI processing
  setTimeout(() => {
    isAnalyzing.value = false
    lastUpdated.value = new Date().toLocaleTimeString()
  }, 3000)
}

// Lifecycle
onMounted(() => {
  // Initial analysis simulation
  setTimeout(() => {
    refreshAnalysis()
  }, 1000)
})
</script>

<style scoped>
.ai-insights {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.insights-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.analysis-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
}

.status-indicator.active {
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.insight-section {
  margin-bottom: 2rem;
}

.insight-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

/* Clustering Styles */
.clustering-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cluster-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(29, 78, 216, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.cluster-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.cluster-icon {
  font-size: 1.5rem;
}

.cluster-header h5 {
  margin: 0;
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.cluster-count {
  font-size: 0.8rem;
  color: #6b7280;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.cluster-regions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.region-tag {
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.cluster-characteristics p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Correlations Styles */
.correlations-grid {
  display: grid;
  gap: 1rem;
}

.correlation-card {
  display: flex;
  gap: 1rem;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.correlation-strength {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: white;
}

.correlation-strength.strength-high {
  background: linear-gradient(135deg, #dc2626, #991b1b);
}

.correlation-strength.strength-medium {
  background: linear-gradient(135deg, #d97706, #92400e);
}

.correlation-strength.strength-low {
  background: linear-gradient(135deg, #65a30d, #3f6212);
}

.correlation-content h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.correlation-content p {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
}

.correlation-direction {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #374151;
  font-weight: 500;
}

/* Predictions Styles */
.predictions-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.prediction-timeline {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.timeline-header h5 {
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

.confidence {
  font-size: 0.8rem;
  color: #059669;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 1rem;
  align-items: center;
}

.timeline-year {
  font-weight: 600;
  color: #374151;
  text-align: center;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.prediction-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.prediction-value {
  font-size: 0.8rem;
  color: #6b7280;
}

.timeline-events {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.event-tag {
  font-size: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.prediction-factors {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.prediction-factors h5 {
  margin: 0 0 1rem 0;
  font-weight: 600;
  color: #1f2937;
}

.factors-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.factor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.factor-name {
  font-size: 0.875rem;
  color: #374151;
}

.factor-impact {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.factor-impact.impact-high-positive {
  background: rgba(16, 185, 129, 0.2);
  color: #059669;
}

.factor-impact.impact-positive {
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.factor-impact.impact-negative {
  background: rgba(245, 158, 11, 0.2);
  color: #d97706;
}

.factor-impact.impact-high-negative {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

/* Recommendations Styles */
.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-card {
  display: flex;
  gap: 1rem;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recommendation-priority {
  flex-shrink: 0;
  width: 60px;
  height: 30px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.recommendation-priority.priority-high {
  background: #dc2626;
  color: white;
}

.recommendation-priority.priority-medium {
  background: #d97706;
  color: white;
}

.recommendation-priority.priority-low {
  background: #65a30d;
  color: white;
}

.recommendation-content h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.recommendation-content p {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.recommendation-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.metric-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 500;
}

.metric-value {
  font-size: 0.8rem;
  color: #374151;
  font-weight: 500;
}

/* Footer Styles */
.updates-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.refresh-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .predictions-container {
    grid-template-columns: 1fr;
  }
  
  .correlation-card {
    flex-direction: column;
    text-align: center;
  }
  
  .recommendation-card {
    flex-direction: column;
  }
  
  .updates-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>