<template>
  <div class="climate-vulnerability-app">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <img src="/images/agnes.png" alt="AGNES" class="logo-img"/>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <a href="/#about" class="nav-link">About</a>
          <a href="/#gallery" class="nav-link">Gallery</a>
          <router-link to="/maps" class="nav-link active">View Maps</router-link>
        </div>
      </div>
    </nav>
    <!-- Header -->
    <div class="app-header">
      <h1>🌍 Climate Vulnerability Dashboard</h1>
      <div class="header-stats">
        <span v-if="currentData.length" class="stat-badge success">
          ✅ {{ currentData.length }} {{ getAdminUnit() }} loaded
        </span>
        <span v-if="dataStats.min !== dataStats.max" class="stat-badge info">
          📊 {{ selectedDataField === 'vulnerability' ? 'Vulnerability' : formatFieldName(selectedDataField) }}:
          Range {{ dataStats.min }}-{{ dataStats.max }} (scaled)
        </span>
        <span v-if="dataStats.avg" class="stat-badge primary">
          📈 Average: {{ dataStats.avg }} (scaled)
        </span>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-panel">
      <div class="control-group">
        <label>Country:</label>
        <select v-model="selectedCountry" @change="loadData" :disabled="loading">
          <option value="ghana">🇬🇭 Ghana</option>
          <option value="kenya">🇰🇪 Kenya</option>
          <option value="botswana">🇧🇼 Botswana</option>
          <option value="uganda">🇺🇬 Uganda</option>
        </select>
      </div>

      <div class="control-group">
        <label>Sector:</label>
        <select v-model="selectedSector" @change="loadData" :disabled="loading">
          <option v-for="sector in availableSectors" :key="sector" :value="sector">
            {{ sector.charAt(0).toUpperCase() + sector.slice(1) }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label>Map Data:</label>
        <select v-model="selectedDataField" @change="updateMapColors">
          <option value="vulnerability">Vulnerability Score</option>
          <option v-for="field in availableDataFields.slice(0, 15)" :key="field" :value="field">
            {{ formatFieldName(field) }}
          </option>
        </select>
      </div>

      <button @click="loadData" :disabled="loading" class="refresh-btn">
        {{ loading ? '⏳ Loading...' : '🔄 Refresh' }}
      </button>
    </div>

    <!-- Status Bar -->
    <div class="status-bar" :class="{ error: hasError, loading: loading }">
      <div v-if="loading" class="status-loading">
        <div class="spinner"></div>
        <span>Loading {{ selectedCountry }} {{ selectedSector }} data and boundaries...</span>
      </div>
      <div v-else-if="hasError" class="status-error">
        <span>❌ {{ errorMessage }}</span>
        <button @click="clearError" class="retry-btn">Clear</button>
        <button @click="loadData" class="retry-btn">Retry</button>
      </div>
      <div v-else-if="currentData.length" class="status-success">
        <span>✅ {{ currentData.length }} {{ getAdminUnit() }} with geographic boundaries</span>
        <span>🗺️ Using real GeoJSON data</span>
        <span v-if="availableDataFields.length">📊 {{ availableDataFields.length }} data fields available</span>
      </div>
    </div>

    <!-- Main Map Container -->
    <div class="map-container">
      <!-- Map Display -->
      <div ref="mapContainer" class="leaflet-map"></div>

      <!-- Map Title -->
      <div class="map-title">
        <h2>{{ selectedCountry.toUpperCase() }} - {{ selectedSector.toUpperCase() }}</h2>
        <p>{{ infoPanelContent }}</p>
      </div>

      <!-- Map Legend -->
      <div class="map-legend">
        <h4>{{ formatFieldName(selectedDataField) }}</h4>
        <div class="legend-items">
          <div class="legend-item">
            <i style="background: #d73027"></i>
            <span>Very High Risk</span>
          </div>
          <div class="legend-item">
            <i style="background: #fc8d59"></i>
            <span>High Risk</span>
          </div>
          <div class="legend-item">
            <i style="background: #fee08b"></i>
            <span>Medium Risk</span>
          </div>
          <div class="legend-item">
            <i style="background: #d9ef8b"></i>
            <span>Low Risk</span>
          </div>
          <div class="legend-item">
            <i style="background: #91cf60"></i>
            <span>Very Low Risk</span>
          </div>
        </div>
        <div class="legend-stats">
          <small>
            <strong>Scaled:</strong> {{ dataStats.min }} - {{ dataStats.max }}<br/>
            <span v-if="currentDataCategory">
              <strong>Raw:</strong> {{ formatValue(dataStats.rawMin, currentDataCategory) }} - {{ formatValue(dataStats.rawMax, currentDataCategory) }}
            </span>
          </small>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="loading" class="map-loading-overlay">
        <div class="loading-content">
          <div class="spinner-large"></div>
          <h3>Loading Map Data</h3>
          <p>Fetching {{ selectedCountry }} {{ selectedSector }} data...</p>
          <p v-if="loadingStatus">{{ loadingStatus }}</p>
        </div>
      </div>

      <!-- Error Overlay -->
      <div v-if="hasError" class="map-error-overlay">
        <div class="error-content">
          <h3>⚠️ Map Loading Error</h3>
          <p>{{ errorMessage }}</p>
          <button @click="clearError" class="error-retry-btn">Try Again</button>
        </div>
      </div>
    </div>

    <!-- Data Panel -->
    <div class="data-panel">
      <div class="data-header">
        <h3>📊 District Data ({{ filteredAndSortedData.length }} shown)</h3>
        <div class="data-controls">
          <input
            v-model="searchTerm"
            placeholder="Search districts..."
            class="search-input"
          >
          <select v-model="sortBy" class="sort-select">
            <option value="name">Sort by Name</option>
            <option value="vulnerability">Sort by Vulnerability</option>
            <option value="selected">Sort by {{ formatFieldName(selectedDataField) }}</option>
          </select>
        </div>
      </div>

      <div class="data-content">
        <div class="data-grid">
          <div
            v-for="item in filteredAndSortedData.slice(0, 20)"
            :key="item.name"
            class="data-card"
            :class="getVulnerabilityClass(getCurrentValue(item))"
            @click="highlightOnMap(item)"
          >
            <div class="card-header">
              <h4>{{ item.name }}</h4>
              <div
                class="vulnerability-badge"
                :style="{ backgroundColor: getColor(getCurrentValue(item)) }"
              >
                {{ getScaledValue(item)?.toFixed(1) || 'N/A' }}
              </div>
            </div>

            <div class="card-content">
              <div class="main-stats">
                <div class="stat">
                  <span class="label">Scaled Score:</span>
                  <span class="value" :style="{ color: getColor(getCurrentValue(item)) }">
                    {{ getScaledValue(item)?.toFixed(1) || 'N/A' }}
                  </span>
                </div>
                <div class="stat">
                  <span class="label">Raw Value:</span>
                  <span class="value">
                    {{ formatValue(getCurrentValue(item), currentDataCategory) }}
                  </span>
                </div>
                <div class="stat">
                  <span class="label">Risk Level:</span>
                  <span class="value" :style="{ color: getRiskColor(getCurrentValue(item)) }">
                    {{ getRiskLevel(getCurrentValue(item)) }}
                  </span>
                </div>
                <div class="stat" v-if="item.data?.Region || item.data?.Sub_regions">
                  <span class="label">Region:</span>
                  <span class="value">{{ item.data.Region || item.data.Sub_regions }}</span>
                </div>
              </div>

              <!-- Rich Data Display -->
              <div class="rich-data">
                <div v-if="item.data?.Poverty_Level" class="data-item">
                  <span class="data-label">Poverty:</span>
                  <span class="data-value">{{ item.data.Poverty_Level }}%</span>
                </div>
                <div v-if="item.data?.Percent_Agriculture || item.data?.Per_GDP_AG" class="data-item">
                  <span class="data-label">Agriculture:</span>
                  <span class="data-value">{{ (item.data.Percent_Agriculture || item.data.Per_GDP_AG) }}%</span>
                </div>
                <div v-if="item.data?.Per_Women_Employed" class="data-item">
                  <span class="data-label">Women Employed:</span>
                  <span class="data-value">{{ item.data.Per_Women_Employed }}%</span>
                </div>
                <div v-if="item.data?.Per_Foretst_Savana" class="data-item">
                  <span class="data-label">Forest/Savana:</span>
                  <span class="data-value">{{ item.data.Per_Foretst_Savana }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Reactive state
const mapContainer = ref()
const selectedCountry = ref('ghana')
const selectedSector = ref('agriculture')
const selectedDataField = ref('vulnerability')
const searchTerm = ref('')
const sortBy = ref('name')
const loading = ref(false)
const loadingStatus = ref('')
const errorMessage = ref('')
const currentData = ref([])
const currentGeoJSON = ref(null)
const currentDataCategory = ref(null)
const infoPanelContent = ref('Hover over a district to see details')

// Map state
let map = null
let choroplethLayer = null

// API Configuration
const apiBaseUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = apiBaseUrl

// GeoJSON files mapping
const geoJsonFiles = {
  ghana: '/geojson/ghana_districts.geojson',
  kenya: '/geojson/kenya_counties.geojson',
  botswana: '/geojson/botswana_districts.geojson',
  uganda: '/geojson/uganda_districts.geojson'
}

// Property name mapping for GeoJSON
const propertyMapping = {
  ghana: 'NAME_2',    // GADM district names
  kenya: 'NAME_1',    // GADM county names
  botswana: 'NAME_2', // GADM district names
  uganda: 'NAME_1'    // GADM district names
}

// Country-Sector mapping
const countrySectors = {
  ghana: ['agriculture', 'energy', 'water'],
  kenya: ['agriculture'],
  botswana: ['agriculture'],
  uganda: ['agriculture']
}

// Admin unit names
const adminUnits = {
  ghana: 'districts',
  kenya: 'counties',
  botswana: 'districts',
  uganda: 'districts'
}

// Computed properties
const availableSectors = computed(() => {
  return countrySectors[selectedCountry.value] || ['agriculture']
})

const hasError = computed(() => !!errorMessage.value)

const getAdminUnit = () => adminUnits[selectedCountry.value] || 'units'

const availableDataFields = computed(() => {
  if (!currentData.value.length) return []

  const sampleData = currentData.value[0]?.data || {}
  const fields = Object.keys(sampleData)
    .filter(key => {
      // Exclude ID and FID columns more comprehensively
      const keyLower = key.toLowerCase()
      if (keyLower.includes('id') || keyLower.includes('fid') ||
        keyLower === 'objectid') return false

      const value = sampleData[key]
      return typeof value === 'number' && value !== null && !isNaN(value)
    })

  console.log(`📋 Available data fields for ${selectedCountry.value}-${selectedSector.value}:`, fields)
  return fields
})

const getCurrentValue = (item) => {
  if (selectedDataField.value === 'vulnerability') {
    return item.value
  }
  return item.data[selectedDataField.value]
}

const getScaledValue = (item) => {
  const rawValue = getCurrentValue(item)
  if (rawValue === null || rawValue === undefined || !currentDataCategory.value) return 0
  return scaleValue(rawValue, currentDataCategory.value)
}

// COMPREHENSIVE DATA CATEGORIZATION SYSTEM
const analyzeDataField = (fieldName, values) => {
  if (!values || values.length === 0) return null

  const fieldLower = fieldName.toLowerCase()
  const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v))

  if (validValues.length === 0) return null

  const min = Math.min(...validValues)
  const max = Math.max(...validValues)
  const range = max - min
  const avg = validValues.reduce((a, b) => a + b, 0) / validValues.length

  console.log(`📊 Analyzing field: ${fieldName}`, { min, max, range, avg, count: validValues.length })

  // Debug rainfall specifically
  if (fieldLower.includes('rainfall') || fieldLower.includes('rain')) {
    console.log(`🌧️ Rainfall field detected: ${fieldName}`, {
      sampleValues: validValues.slice(0, 5),
      min, max, avg,
      willInvert: true
    })
  }

  // 1. VULNERABILITY/HOTSPOT SCORES (0-1 range, display as 0-100)
  if (fieldLower.includes('hotspot') || fieldLower.includes('vulnerability') ||
    fieldLower.includes('average_hotspot') || fieldLower.includes('weighted_hotspot') ||
    fieldLower.includes('ave_hotspot') || fieldLower.includes('weight_hotspot')) {
    return {
      type: 'vulnerability',
      scale: [min, max],
      displayScale: [0, 100],
      unit: '%',
      invert: false,
      description: 'Vulnerability Score'
    }
  }

  // 2. ALREADY NORMALIZED VALUES (0-1 range with Nor/Norm prefix)
  if ((fieldLower.startsWith('nor_') || fieldLower.startsWith('norm_') ||
    fieldLower.includes('normal_')) && max <= 1.2 && min >= -0.2) {
    return {
      type: 'normalized',
      scale: [0, 1],
      displayScale: [0, 100],
      unit: '',
      invert: false,
      description: 'Normalized Value'
    }
  }

  // 3. PERCENTAGES (0-100+ range)
  if (fieldLower.includes('percent') || fieldLower.includes('per_') ||
    fieldLower.includes('poverty_level') || fieldLower.includes('%') ||
    fieldLower.includes('_pct') || fieldLower.includes('pct_')) {
    return {
      type: 'percentage',
      scale: [0, Math.max(100, max)],
      displayScale: [0, 100],
      unit: '%',
      invert: false,
      description: 'Percentage'
    }
  }

  // 4. RAINFALL (high values in mm, more is better in drought context)
  if (fieldLower.includes('rainfall') || fieldLower.includes('rain') ||
    fieldLower.includes('precipitation')) {
    return {
      type: 'rainfall',
      scale: [min, max],
      displayScale: [0, 100],
      unit: 'mm',
      invert: true, // Higher rainfall = lower vulnerability
      description: 'Rainfall Amount'
    }
  }

  // 5. TEMPERATURE CHANGES (can be negative)
  if (fieldLower.includes('temp') && fieldLower.includes('change')) {
    return {
      type: 'temperature_change',
      scale: [min, max],
      displayScale: [0, 100],
      unit: '°C',
      invert: false, // Higher temp change = higher vulnerability
      description: 'Temperature Change'
    }
  }

  // 6. DRY DAYS (0-365, more is worse)
  if (fieldLower.includes('dry') && fieldLower.includes('day')) {
    return {
      type: 'dry_days',
      scale: [0, Math.max(365, max)],
      displayScale: [0, 100],
      unit: ' days',
      invert: false,
      description: 'Dry Days'
    }
  }

  // 7. COEFFICIENTS OF VARIATION (0-1 typically)
  if (fieldLower.includes('cv_') || fieldLower.includes('cv') ||
    fieldLower.includes('coeff')) {
    return {
      type: 'coefficient',
      scale: [0, Math.max(1, max)],
      displayScale: [0, 100],
      unit: '',
      invert: false,
      description: 'Variation Coefficient'
    }
  }

  // 8. RISK VALUES (typically 0-1)
  if (fieldLower.includes('risk') && max <= 1.2) {
    return {
      type: 'risk',
      scale: [0, 1],
      displayScale: [0, 100],
      unit: '',
      invert: false,
      description: 'Risk Level'
    }
  }

  // 9. EXPOSURE/SENSITIVITY/ADAPTIVE CAPACITY (typically 0-1)
  if ((fieldLower.includes('exposure') || fieldLower.includes('sensitivity') ||
    fieldLower.includes('adaptive') || fieldLower.includes('capacity')) && max <= 1.5) {
    const isAdaptive = fieldLower.includes('adaptive') || fieldLower.includes('capacity')
    return {
      type: 'capacity',
      scale: [0, Math.max(1, max)],
      displayScale: [0, 100],
      unit: '',
      invert: isAdaptive, // Higher adaptive capacity = lower vulnerability
      description: isAdaptive ? 'Adaptive Capacity' : 'Exposure/Sensitivity'
    }
  }

  // 10. LARGE NUMBERS (population, area, etc.)
  if (max > 10000) {
    return {
      type: 'large_number',
      scale: [min, max],
      displayScale: [0, 100],
      unit: '',
      invert: false,
      description: 'Count/Area'
    }
  }

  // 11. SMALL DECIMALS (0-10 range)
  if (max <= 10 && min >= 0) {
    return {
      type: 'small_range',
      scale: [min, max],
      displayScale: [0, 100],
      unit: '',
      invert: false,
      description: 'Index Value'
    }
  }

  // 12. DEFAULT: Min-max normalization
  return {
    type: 'generic',
    scale: [min, max],
    displayScale: [0, 100],
    unit: '',
    invert: false,
    description: 'Raw Value'
  }
}

const analyzeCurrentDataField = () => {
  if (!currentData.value.length) {
    currentDataCategory.value = null
    return
  }

  let values = []
  if (selectedDataField.value === 'vulnerability') {
    values = currentData.value.map(d => d.value).filter(v => v !== null && v !== undefined && !isNaN(v))
  } else {
    values = currentData.value.map(d => d.data[selectedDataField.value]).filter(v => v !== null && v !== undefined && !isNaN(v))
    console.log(`📊 Extracting values for field: ${selectedDataField.value}`)
    console.log(`📊 Sample values:`, values.slice(0, 10))
    console.log(`📊 Sample data structure:`, currentData.value[0]?.data)
  }

  currentDataCategory.value = analyzeDataField(selectedDataField.value, values)

  console.log(`📊 Field "${selectedDataField.value}" categorized as:`, currentDataCategory.value)
  console.log(`📊 Values count: ${values.length} / ${currentData.value.length}`)
}

// IMPROVED SCALING FUNCTION
const scaleValue = (value, category) => {
  if (value === null || value === undefined || !category) return 0

  const [sourceMin, sourceMax] = category.scale
  const [targetMin, targetMax] = category.displayScale

  // Handle edge case where min = max
  if (sourceMax === sourceMin) return targetMin + (targetMax - targetMin) / 2

  // Scale to target range
  let scaled = ((value - sourceMin) / (sourceMax - sourceMin)) * (targetMax - targetMin) + targetMin

  // Invert if needed (e.g., higher rainfall = lower vulnerability)
  if (category.invert) {
    scaled = targetMax - scaled + targetMin
  }

  const result = Math.max(0, Math.min(100, scaled))

  // Debug for specific high values that might be confusing
  if (result > 90 || (category.type === 'large_number' && value > 100000)) {
    const riskValue = category.invert ? 100 - result : result
    console.log(`🔍 High scaled value debug:`)
    console.log(`  Raw value: ${value} (${category.type})`)
    console.log(`  Scale: [${sourceMin}, ${sourceMax}]`)
    console.log(`  Scaled: ${result.toFixed(1)}`)
    console.log(`  Risk value: ${riskValue.toFixed(1)}`)
    console.log(`  Inverted: ${category.invert}`)
    console.log(`  Risk level: ${riskValue > 80 ? 'Very High Risk' : riskValue > 60 ? 'High Risk' : riskValue > 40 ? 'Medium Risk' : riskValue > 20 ? 'Low Risk' : 'Very Low Risk'}`)
    console.log(`  Color should be: ${riskValue > 80 ? 'RED' : riskValue > 60 ? 'ORANGE' : riskValue > 40 ? 'YELLOW' : riskValue > 20 ? 'LIGHT GREEN' : 'GREEN'}`)
  }

  return result
}

// IMPROVED VALUE FORMATTING
const formatValue = (value, category) => {
  if (value === null || value === undefined || !category) return 'N/A'

  switch (category.type) {
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'rainfall':
      return `${value.toFixed(0)}mm`
    case 'temperature_change':
      return `${value > 0 ? '+' : ''}${value.toFixed(2)}°C`
    case 'dry_days':
      return `${value.toFixed(0)} days`
    case 'large_number':
      return value.toLocaleString()
    case 'normalized':
    case 'vulnerability':
    case 'risk':
    case 'capacity':
      return `${value.toFixed(3)}`
    case 'coefficient':
      return `${value.toFixed(3)}`
    default:
      return `${value.toFixed(2)}${category.unit}`
  }
}

const dataStats = computed(() => {
  if (!currentData.value.length || !currentDataCategory.value) {
    return { min: 0, max: 100, avg: 0, rawMin: 0, rawMax: 100, rawAvg: 0 }
  }

  let rawValues = []
  let scaledValues = []

  currentData.value.forEach(item => {
    const rawValue = getCurrentValue(item)
    if (rawValue !== null && rawValue !== undefined && !isNaN(rawValue)) {
      rawValues.push(rawValue)
      scaledValues.push(scaleValue(rawValue, currentDataCategory.value))
    }
  })

  if (rawValues.length === 0) {
    return { min: 0, max: 100, avg: 0, rawMin: 0, rawMax: 100, rawAvg: 0 }
  }

  const rawMin = Math.min(...rawValues)
  const rawMax = Math.max(...rawValues)
  const rawAvg = rawValues.reduce((a, b) => a + b, 0) / rawValues.length

  const scaledMin = Math.min(...scaledValues)
  const scaledMax = Math.max(...scaledValues)
  const scaledAvg = scaledValues.reduce((a, b) => a + b, 0) / scaledValues.length

  return {
    min: scaledMin.toFixed(1),
    max: scaledMax.toFixed(1),
    avg: scaledAvg.toFixed(1),
    rawMin: rawMin,
    rawMax: rawMax,
    rawAvg: rawAvg
  }
})

const filteredAndSortedData = computed(() => {
  let filtered = currentData.value

  // Filter by search term
  if (searchTerm.value) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy.value === 'vulnerability') {
      return (b.value || 0) - (a.value || 0)
    } else if (sortBy.value === 'selected') {
      // Sort by scaled values for consistency
      const aVal = currentDataCategory.value ? scaleValue(getCurrentValue(a), currentDataCategory.value) : (getCurrentValue(a) || 0)
      const bVal = currentDataCategory.value ? scaleValue(getCurrentValue(b), currentDataCategory.value) : (getCurrentValue(b) || 0)
      return bVal - aVal
    }
    return 0
  })

  return filtered
})

// Utility functions
const formatFieldName = (field) => {
  if (field === 'vulnerability') return 'Vulnerability Score'
  return field
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
}

const clearError = () => {
  errorMessage.value = ''
}

// FIXED COLOR FUNCTION - Considers inversion for risk-based coloring
const getColor = (rawValue) => {
  if (rawValue === null || rawValue === undefined || !currentDataCategory.value) return '#cccccc'

  const scaledValue = scaleValue(rawValue, currentDataCategory.value)

  // For inverted data (like rainfall), high scaled values = low risk = green
  // For normal data, high scaled values = high risk = red
  let riskValue = scaledValue
  if (currentDataCategory.value.invert) {
    riskValue = 100 - scaledValue // Flip for inverted data
  }

  return riskValue > 80 ? '#d73027' :   // High Risk = RED
    riskValue > 60 ? '#fc8d59' :   // Medium-High Risk = ORANGE
      riskValue > 40 ? '#fee08b' :   // Medium Risk = YELLOW
        riskValue > 20 ? '#d9ef8b' :   // Low Risk = LIGHT GREEN
          '#91cf60'     // Very Low Risk = GREEN
}

const getVulnerabilityClass = (rawValue) => {
  if (rawValue === null || rawValue === undefined || !currentDataCategory.value) return 'no-data'

  const scaledValue = scaleValue(rawValue, currentDataCategory.value)

  // For inverted data, high scaled values = low risk
  let riskValue = scaledValue
  if (currentDataCategory.value.invert) {
    riskValue = 100 - scaledValue
  }

  if (riskValue > 80) return 'very-high'
  if (riskValue > 60) return 'high'
  if (riskValue > 40) return 'medium'
  if (riskValue > 20) return 'low'
  return 'very-low'
}

// RISK LEVEL CALCULATION based on RISK not scaled values
const getRiskLevel = (rawValue) => {
  if (rawValue === null || rawValue === undefined || !currentDataCategory.value) return 'No Data'

  const scaledValue = scaleValue(rawValue, currentDataCategory.value)

  // For inverted data, high scaled values = low risk
  let riskValue = scaledValue
  if (currentDataCategory.value.invert) {
    riskValue = 100 - scaledValue
  }

  if (riskValue > 80) return 'Very High Risk'
  if (riskValue > 60) return 'High Risk'
  if (riskValue > 40) return 'Medium Risk'
  if (riskValue > 20) return 'Low Risk'
  return 'Very Low Risk'
}

const getRiskColor = (rawValue) => {
  if (rawValue === null || rawValue === undefined || !currentDataCategory.value) return '#6b7280'

  const scaledValue = scaleValue(rawValue, currentDataCategory.value)

  // For inverted data, high scaled values = low risk = green
  let riskValue = scaledValue
  if (currentDataCategory.value.invert) {
    riskValue = 100 - scaledValue
  }

  if (riskValue > 80) return '#dc2626'  // High Risk = Red
  if (riskValue > 60) return '#ea580c'  // Medium-High Risk = Orange
  if (riskValue > 40) return '#ca8a04'  // Medium Risk = Yellow
  if (riskValue > 20) return '#65a30d'  // Low Risk = Light Green
  return '#16a34a'  // Very Low Risk = Green
}

// Map functions
const initializeMap = () => {
  if (map) {
    map.remove()
  }

  console.log('🗺️ Initializing Leaflet map...')

  map = L.map(mapContainer.value, {
    center: [0, 20], // Africa center
    zoom: 4,
    maxZoom: 10,
    minZoom: 2
  })

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  console.log('✅ Map initialized')
}

// Load real GeoJSON boundaries
const loadGeoJSON = async (country) => {
  try {
    console.log(`🗺️ Loading GeoJSON boundaries for ${country}...`)
    loadingStatus.value = `Loading ${country} boundaries...`

    const geoJsonFile = geoJsonFiles[country]
    if (!geoJsonFile) {
      throw new Error(`No GeoJSON file configured for ${country}`)
    }

    const response = await fetch(geoJsonFile)
    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON: ${response.status} ${response.statusText}`)
    }

    const geoJsonData = await response.json()
    currentGeoJSON.value = geoJsonData

    console.log(`✅ Loaded GeoJSON with ${geoJsonData.features.length} features`)

    // Debug: Show sample feature properties for Kenya
    if (country === 'kenya' && geoJsonData.features.length > 0) {
      console.log(`🇰🇪 Kenya GeoJSON sample properties:`, geoJsonData.features[0].properties)
      console.log(`🇰🇪 Available property keys:`, Object.keys(geoJsonData.features[0].properties))
    }

    return geoJsonData

  } catch (error) {
    console.error('❌ Failed to load GeoJSON:', error)
    throw new Error(`Could not load geographic boundaries: ${error.message}`)
  }
}

// COMPREHENSIVE FUZZY MATCHING SYSTEM
const fuzzyMatchDistrict = (featureName, choroplethData) => {
  if (!featureName) return null

  console.log(`🔍 Fuzzy matching: "${featureName}"`)

  // Strategy 1: Exact match (case-insensitive)
  let match = choroplethData.find(d =>
    d.name.toLowerCase().trim() === featureName.toLowerCase().trim()
  )
  if (match) {
    console.log(`  ✅ Strategy 1 - Exact match: "${match.name}"`)
    return match
  }

  // Strategy 2: Normalized match (remove spaces and common suffixes)
  const normalizeText = (text) => {
    return text.toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/(district|municipality|metropolitan|municipal|county|region|division)$/i, '')
      .trim()
  }

  const normalizedFeature = normalizeText(featureName)
  match = choroplethData.find(d => {
    const normalizedData = normalizeText(d.name)
    return normalizedData === normalizedFeature
  })
  if (match) {
    console.log(`  ✅ Strategy 2 - Normalized match: "${match.name}" (normalized: "${normalizeText(match.name)}")`)
    return match
  }

  // Strategy 3: Core word matching (extract main words, ignore order)
  const extractCoreWords = (text) => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace non-word chars with spaces
      .split(/\s+/)
      .filter(word => word.length > 2) // Keep words longer than 2 chars
      .filter(word => !['the', 'and', 'of', 'municipal', 'district', 'metropolitan', 'county', 'region', 'division'].includes(word))
      .sort() // Sort for order-independent comparison
  }

  const featureCoreWords = extractCoreWords(featureName)
  match = choroplethData.find(d => {
    const dataCoreWords = extractCoreWords(d.name)

    // Check if all core words from feature are present in data
    const featureWordsInData = featureCoreWords.every(word =>
      dataCoreWords.some(dataWord =>
        dataWord.includes(word) || word.includes(dataWord)
      )
    )

    // Check if all core words from data are present in feature
    const dataWordsInFeature = dataCoreWords.every(word =>
      featureCoreWords.some(featureWord =>
        featureWord.includes(word) || word.includes(featureWord)
      )
    )

    return featureWordsInData && dataWordsInFeature && dataCoreWords.length > 0
  })
  if (match) {
    console.log(`  ✅ Strategy 3 - Core words match: "${match.name}"`)
    console.log(`    Feature words: [${featureCoreWords.join(', ')}]`)
    console.log(`    Data words: [${extractCoreWords(match.name).join(', ')}]`)
    return match
  }

  // Strategy 4: Levenshtein distance similarity (for typos/minor variations)
  const levenshteinDistance = (a, b) => {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        )
      }
    }

    return matrix[b.length][a.length]
  }

  const calculateSimilarity = (str1, str2) => {
    const maxLength = Math.max(str1.length, str2.length)
    if (maxLength === 0) return 1
    return (maxLength - levenshteinDistance(str1, str2)) / maxLength
  }

  const normalizedFeatureForSim = normalizeText(featureName)
  let bestMatch = null
  let bestSimilarity = 0

  choroplethData.forEach(d => {
    const normalizedData = normalizeText(d.name)
    const similarity = calculateSimilarity(normalizedFeatureForSim, normalizedData)

    if (similarity > bestSimilarity && similarity > 0.7) { // 70% similarity threshold
      bestSimilarity = similarity
      bestMatch = d
    }
  })

  if (bestMatch) {
    console.log(`  ✅ Strategy 4 - Similarity match: "${bestMatch.name}" (${(bestSimilarity * 100).toFixed(1)}% similar)`)
    return bestMatch
  }

  // Strategy 5: Partial matching with regex patterns
  const createRegexPattern = (text) => {
    // Create flexible regex pattern from text
    const cleanText = text.replace(/[^\w\s]/g, '').trim()
    const words = cleanText.split(/\s+/).filter(w => w.length > 2)

    if (words.length === 0) return null

    // Create pattern that matches words in any order with optional separators
    const wordPatterns = words.map(word => `(?=.*\\b${word})`).join('')
    return new RegExp(wordPatterns, 'i')
  }

  const featurePattern = createRegexPattern(featureName)
  if (featurePattern) {
    match = choroplethData.find(d => {
      const dataForRegex = d.name.replace(/[^\w\s]/g, ' ')
      return featurePattern.test(dataForRegex)
    })

    if (match) {
      console.log(`  ✅ Strategy 5 - Regex pattern match: "${match.name}"`)
      return match
    }
  }

  // Strategy 6: Last resort - check if any word from feature appears in data
  const featureWords = featureName.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  if (featureWords.length > 0) {
    match = choroplethData.find(d => {
      const dataName = d.name.toLowerCase()
      return featureWords.some(word => dataName.includes(word)) &&
        dataName.split(/\s+/).some(dataWord =>
          featureWords.some(featureWord =>
            (dataWord.length > 3 && featureWord.includes(dataWord)) ||
            (featureWord.length > 3 && dataWord.includes(featureWord))
          )
        )
    })

    if (match) {
      console.log(`  ✅ Strategy 6 - Word intersection match: "${match.name}"`)
      return match
    }
  }

  // No match found
  console.log(`  ❌ No match found for "${featureName}"`)
  console.log(`  📋 Available options (first 10):`, choroplethData.slice(0, 10).map(d => `"${d.name}"`))

  return null
}

// IMPROVED DISTRICT MATCHING - Now uses fuzzy matching
const findMatchingDistrict = (feature, choroplethData) => {
  if (!feature?.properties) return null

  const propertyName = propertyMapping[selectedCountry.value]
  const featureName = feature.properties[propertyName] ||
    feature.properties.name ||
    feature.properties.Name ||
    feature.properties.NAME

  if (!featureName) return null

  return fuzzyMatchDistrict(featureName, choroplethData)
}

const updateMapColors = () => {
  if (!choroplethLayer || !currentData.value.length) return

  console.log(`🎨 Updating map colors for field: ${selectedDataField.value}`)

  // Analyze the current data field
  analyzeCurrentDataField()

  choroplethLayer.eachLayer(layer => {
    const feature = layer.feature
    const districtData = findMatchingDistrict(feature, currentData.value)

    let color = '#cccccc'
    if (districtData) {
      const rawValue = getCurrentValue(districtData)
      color = getColor(rawValue)
    }

    layer.setStyle({
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    })
  })
}

const renderChoropleth = async () => {
  if (!map || !currentData.value.length || !currentGeoJSON.value) return

  console.log(`🎨 Rendering choropleth with real GeoJSON boundaries`)

  // Analyze current data field
  analyzeCurrentDataField()

  // Remove existing layer
  if (choroplethLayer) {
    map.removeLayer(choroplethLayer)
  }

  // Style function
  const style = (feature) => {
    const districtData = findMatchingDistrict(feature, currentData.value)
    let color = '#cccccc'

    if (districtData) {
      const rawValue = getCurrentValue(districtData)
      color = getColor(rawValue)
    }

    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    }
  }

  // FIXED INTERACTION HANDLERS
  const highlightFeature = (e) => {
    const layer = e.target
    const feature = layer.feature
    const districtData = findMatchingDistrict(feature, currentData.value)

    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    })

    layer.bringToFront()

    // FIXED tooltip content - consistent risk levels based on RISK not raw scaled values
    if (districtData) {
      const rawValue = getCurrentValue(districtData)
      const scaledValue = getScaledValue(districtData)
      const formattedValue = formatValue(rawValue, currentDataCategory.value)
      const riskLevel = getRiskLevel(rawValue)

      // Show both scaled value and what it means for risk
      let scaleInfo = `Scaled: ${scaledValue.toFixed(1)}`
      if (currentDataCategory.value?.invert) {
        const riskValue = 100 - scaledValue
        scaleInfo += ` (Risk: ${riskValue.toFixed(1)})`
      }

      infoPanelContent.value = `${districtData.name} | ${formatFieldName(selectedDataField.value)}: ${formattedValue} | ${scaleInfo} | ${riskLevel}`

      if (districtData.data.Region || districtData.data.Sub_regions) {
        infoPanelContent.value += ` | Region: ${districtData.data.Region || districtData.data.Sub_regions}`
      }
    } else {
      const propertyName = propertyMapping[selectedCountry.value]
      const featureName = feature.properties[propertyName] || feature.properties.name
      infoPanelContent.value = `${featureName} | No data available`
    }
  }

  const resetHighlight = (e) => {
    choroplethLayer.resetStyle(e.target)
    infoPanelContent.value = 'Hover over a district to see details'
  }

  const clickFeature = (e) => {
    map.fitBounds(e.target.getBounds())
  }

  // Add layer with interactions
  choroplethLayer = L.geoJSON(currentGeoJSON.value, {
    style: style,
    onEachFeature: (feature, layer) => {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickFeature
      })
    }
  }).addTo(map)

  // Fit map to data
  map.fitBounds(choroplethLayer.getBounds())

  console.log('✅ Choropleth rendered with advanced data categorization and scaling')
}

const highlightOnMap = (item) => {
  if (!choroplethLayer) return

  console.log(`🎯 Highlighting ${item.name} on map`)

  choroplethLayer.eachLayer(layer => {
    const districtData = findMatchingDistrict(layer.feature, currentData.value)
    if (districtData && districtData.name === item.name) {
      // Temporarily highlight
      layer.setStyle({
        weight: 5,
        color: '#ff0000',
        dashArray: '',
        fillOpacity: 0.9
      })

      // Reset after 2 seconds
      setTimeout(() => {
        choroplethLayer.resetStyle(layer)
      }, 2000)

      // Pan to feature and show info
      map.fitBounds(layer.getBounds())

      // Update info panel with detailed info
      const rawValue = getCurrentValue(item)
      const scaledValue = getScaledValue(item)
      const formattedValue = formatValue(rawValue, currentDataCategory.value)
      const riskLevel = getRiskLevel(rawValue)

      // Show both scaled value and what it means for risk
      let scaleInfo = `Scaled: ${scaledValue.toFixed(1)}`
      if (currentDataCategory.value?.invert) {
        const riskValue = 100 - scaledValue
        scaleInfo += ` (Risk: ${riskValue.toFixed(1)})`
      }

      infoPanelContent.value = `${item.name} | ${formatFieldName(selectedDataField.value)}: ${formattedValue} | ${scaleInfo} | ${riskLevel}`

      if (item.data.Region || item.data.Sub_regions) {
        infoPanelContent.value += ` | Region: ${item.data.Region || item.data.Sub_regions}`
      }
    }
  })
}

// API functions with better error handling
const loadData = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    loadingStatus.value = 'Connecting to API...'

    console.log(`📡 Loading data for ${selectedCountry.value} ${selectedSector.value}`)
    console.log(`🔗 API URL: ${API_BASE_URL}/${selectedCountry.value}/${selectedSector.value}/choropleth`)

    // Load GeoJSON and API data in parallel
    const [geoJsonData, apiResponse] = await Promise.all([
      loadGeoJSON(selectedCountry.value),
      fetch(`${API_BASE_URL}/${selectedCountry.value}/${selectedSector.value}/choropleth`).then(async r => {
        loadingStatus.value = 'Loading district data...'
        console.log(`📡 API Response status: ${r.status}`)

        if (!r.ok) {
          const errorText = await r.text()
          console.error(`❌ API Error: ${r.status} ${r.statusText}`, errorText)
          throw new Error(`HTTP ${r.status}: ${r.statusText} - ${errorText}`)
        }

        const json = await r.json()
        console.log(`📡 API Response:`, json)
        return json
      })
    ])

    if (apiResponse.success) {
      currentData.value = apiResponse.data.choropleth_data || []

      console.log(`✅ Loaded ${currentData.value.length} records`)
      console.log(`✅ Sample data:`, currentData.value.slice(0, 2))
      console.log(`✅ Loaded GeoJSON with ${geoJsonData.features.length} features`)

      // Special handling for Kenya data with leading spaces
      if (selectedCountry.value === 'kenya') {
        console.log(`🇰🇪 Kenya data - checking for space issues...`)
        currentData.value.forEach((item, index) => {
          if (item.name.startsWith(' ') || item.name.endsWith(' ')) {
            console.log(`  Trimming spaces from: "${item.name}" → "${item.name.trim()}"`)
            item.name = item.name.trim()
          }
        })
      }

      // Analyze data field after loading data
      analyzeCurrentDataField()

      loadingStatus.value = 'Rendering map...'
      await nextTick()
      await renderChoropleth()

    } else {
      console.error(`❌ API returned error:`, apiResponse)
      throw new Error(apiResponse.message || 'Failed to load data from API')
    }
  } catch (error) {
    console.error('❌ Failed to load data:', error)
    errorMessage.value = `Failed to load ${selectedCountry.value} ${selectedSector.value} data: ${error.message}`
    currentData.value = []
  } finally {
    loading.value = false
    loadingStatus.value = ''
  }
}

// Watchers with better handling
watch(() => selectedCountry.value, async () => {
  console.log(`🏳️ Country changed to: ${selectedCountry.value}`)

  // Update available sectors
  if (!availableSectors.value.includes(selectedSector.value)) {
    console.log(`🔄 Changing sector from ${selectedSector.value} to ${availableSectors.value[0]}`)
    selectedSector.value = availableSectors.value[0]
  }

  // Reset data field to vulnerability when changing countries
  selectedDataField.value = 'vulnerability'

  await loadData()
})

watch(() => selectedSector.value, async () => {
  console.log(`🏭 Sector changed to: ${selectedSector.value}`)

  // Reset data field to vulnerability when changing sectors
  selectedDataField.value = 'vulnerability'

  await loadData()
})

watch(() => selectedDataField.value, () => {
  console.log(`📊 Data field changed to: ${selectedDataField.value}`)
  analyzeCurrentDataField()
  updateMapColors()
})

// Lifecycle
onMounted(async () => {
  console.log('🎬 Climate Vulnerability Map mounted')

  await nextTick()
  initializeMap()

  // Test API health and load initial data
  try {
    console.log('🏥 Testing API health...')
    const healthResponse = await fetch(`${API_BASE_URL}/health`)

    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ API connected:', healthData)
      await loadData()
    } else {
      throw new Error(`API health check failed: ${healthResponse.status} ${healthResponse.statusText}`)
    }
  } catch (error) {
    console.error('❌ API connection failed:', error)
    errorMessage.value = `Cannot connect to API at ${API_BASE_URL}. Please ensure Flask server is running. Error: ${error.message}`
  }
})
</script>

<style scoped>
.climate-vulnerability-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Navigation Bar Styles */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.75rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 32px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-link:hover {
  color: #0494fc;
  background: rgba(4, 148, 252, 0.1);
}

.nav-link.active {
  color: #0494fc;
  background: rgba(4, 148, 252, 0.15);
  font-weight: 600;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
}

.app-header h1 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 2.5rem;
}

.header-stats {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-badge.success {
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.stat-badge.info {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.stat-badge.primary {
  background: rgba(139, 92, 246, 0.1);
  color: #6b21a8;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.controls-panel {
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.control-group select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  min-width: 180px;
  transition: border-color 0.2s;
}

.control-group select:focus {
  outline: none;
  border-color: #667eea;
}

.refresh-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 1.5rem;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.status-bar {
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  transition: all 0.3s;
}

.status-bar.loading {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
}

.status-bar.error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-bar:not(.loading):not(.error) {
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
}

.status-loading, .status-error, .status-success {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(102, 126, 234, 0.3);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  padding: 0.25rem 0.75rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.retry-btn:hover {
  background: #b91c1c;
}

.map-container {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin: 2rem;
  height: 700px;
}

.leaflet-map {
  height: 100%;
  width: 100%;
}

.map-title {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 1000;
  min-width: 300px;
  max-width: 500px;
}

.map-title h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.3rem;
}

.map-title p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.map-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 1000;
  min-width: 200px;
}

.map-legend h4 {
  margin: 0 0 0.75rem 0;
  color: #1f2937;
  font-size: 1rem;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.legend-item i {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-stats {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
  color: #6b7280;
}

.map-loading-overlay, .map-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.loading-content, .error-content {
  text-align: center;
  padding: 2rem;
}

.loading-content h3, .error-content h3 {
  margin: 1rem 0 0.5rem 0;
  color: #1f2937;
}

.loading-content p {
  color: #6b7280;
  margin: 0.5rem 0;
}

.error-retry-btn {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
}

.data-panel {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin: 2rem;
  display: flex;
  flex-direction: column;
}

.data-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.data-header h3 {
  margin: 0 0 1rem 0;
}

.data-controls {
  display: flex;
  gap: 1rem;
}

.search-input, .sort-select {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.data-content {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.data-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.data-card.very-high {
  border-left: 4px solid #d73027;
}

.data-card.high {
  border-left: 4px solid #fc8d59;
}

.data-card.medium {
  border-left: 4px solid #fee08b;
}

.data-card.low {
  border-left: 4px solid #d9ef8b;
}

.data-card.very-low {
  border-left: 4px solid #91cf60;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 1rem;
}

.vulnerability-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat .label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.stat .value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
}

.rich-data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.data-label {
  color: #6b7280;
}

.data-value {
  font-weight: 600;
  color: #374151;
}

/* Responsive */
@media (max-width: 1200px) {
  .data-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .controls-panel {
    flex-direction: column;
    gap: 1rem;
  }

  .control-group select {
    min-width: 250px;
  }

  .main-stats {
    grid-template-columns: 1fr;
  }

  .rich-data {
    grid-template-columns: 1fr;
  }

  .data-controls {
    flex-direction: column;
  }

  .map-container {
    margin: 1rem;
    height: 500px;
  }

  .map-title {
    max-width: calc(100vw - 40px);
  }
}
</style>
