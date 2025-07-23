<template>
  <div class="africa-map">
    <!-- Country & Sector Selection -->
    <div class="country-selector">
      <div class="selector-group">
        <label>Country:</label>
        <select v-model="selectedCountry" @change="onCountryChange" :disabled="loading">
          <option value="ghana">🇬🇭 Ghana</option>
          <option value="kenya">🇰🇪 Kenya</option>
          <option value="botswana">🇧🇼 Botswana</option>
          <option value="uganda">🇺🇬 Uganda</option>
        </select>
      </div>

      <div class="selector-group">
        <label>Sector:</label>
        <select v-model="selectedSector" @change="onSectorChange" :disabled="loading">
          <option v-for="sector in availableSectors" :key="sector" :value="sector">
            {{ sector.charAt(0).toUpperCase() + sector.slice(1) }}
          </option>
        </select>
      </div>

      <button @click="loadMapData" :disabled="loading" class="load-data-btn">
        {{ loading ? '⏳ Loading...' : '📊 Load Data' }}
      </button>
    </div>

    <!-- Map Container -->
    <div id="map" ref="mapContainer" class="map-container"></div>

    <!-- Map Legend -->
    <div class="map-legend" v-if="choroplethData.length && !loading">
      <h4>{{ selectedCountry.toUpperCase() }} - {{ selectedSector.toUpperCase() }}</h4>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color" style="background-color: #d73027"></div>
          <span>Very High (81-100)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #fc8d59"></div>
          <span>High (61-80)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #fee08b"></div>
          <span>Medium (41-60)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #d9ef8b"></div>
          <span>Low (21-40)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #91cf60"></div>
          <span>Very Low (0-20)</span>
        </div>
      </div>

      <div class="legend-stats">
        <div class="stat-item">
          <span class="label">Administrative Units:</span>
          <span class="value">{{ choroplethData.length }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Score Range:</span>
          <span class="value">{{ dataRange.min.toFixed(1) }} - {{ dataRange.max.toFixed(1) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Average:</span>
          <span class="value">{{ dataRange.average.toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <!-- Map Controls -->
    <div class="map-controls">
      <button @click="resetView" class="control-btn" title="Reset View">
        🏠
      </button>
      <button @click="toggleHeatmap" class="control-btn" :class="{ active: showHeatmap }" title="Toggle Hotspots">
        🔥
      </button>
      <button @click="toggleLabels" class="control-btn" :class="{ active: showLabels }" title="Toggle Labels">
        🏷️
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <h3>⚠️ Error Loading Data</h3>
        <p>{{ error }}</p>
        <button @click="clearError" class="retry-btn">Try Again</button>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading {{ selectedCountry }} {{ selectedSector }} data...</p>
      </div>
    </div>

    <!-- District Info Popup -->
    <div v-if="selectedDistrict" class="district-info" :style="popupStyle">
      <div class="info-header">
        <h4>{{ selectedDistrict.name }}</h4>
        <button @click="closePopup" class="close-btn">&times;</button>
      </div>
      <div class="info-content">
        <div class="info-item">
          <span class="label">Vulnerability Score:</span>
          <span class="value" :class="getRiskClass(selectedDistrict.value)">
            {{ selectedDistrict.value?.toFixed(1) || 'N/A' }}
          </span>
        </div>
        <div class="info-item">
          <span class="label">Risk Level:</span>
          <span class="value" :style="{ color: getVulnerabilityColor(selectedDistrict.value) }">
            {{ selectedDistrict.level }}
          </span>
        </div>
        <div v-if="selectedDistrict.data?.Region" class="info-item">
          <span class="label">Region:</span>
          <span class="value">{{ selectedDistrict.data.Region }}</span>
        </div>
        <div v-if="selectedDistrict.data?.Poverty_Level" class="info-item">
          <span class="label">Poverty Level:</span>
          <span class="value">{{ selectedDistrict.data.Poverty_Level }}%</span>
        </div>
        <div v-if="selectedDistrict.data?.Percent_Agriculture" class="info-item">
          <span class="label">Agriculture:</span>
          <span class="value">{{ selectedDistrict.data.Percent_Agriculture }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Reactive state
const mapContainer = ref()
const selectedCountry = ref('ghana')
const selectedSector = ref('agriculture')
const loading = ref(false)
const error = ref(null)
const choroplethData = ref([])
const hotspotsData = ref([])
const selectedDistrict = ref(null)
const popupStyle = ref({})
const showHeatmap = ref(true)
const showLabels = ref(false)

// Map instances
let map = null
let geoJsonLayer = null
let heatmapLayer = null
let labelsLayer = null

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'

// Country-Sector mapping from documentation
const countrySectors = {
  ghana: ['agriculture', 'energy', 'water'],
  kenya: ['agriculture'],
  botswana: ['agriculture'],
  uganda: ['agriculture']
}

// Africa bounds for map focus
const AFRICA_BOUNDS = [
  [-35, -20], // Southwest coordinates
  [38, 55]    // Northeast coordinates
]

// Country center coordinates for Africa
const COUNTRY_CENTERS = {
  ghana: [7.9465, -1.0232],
  kenya: [-0.0236, 37.9062],
  botswana: [-22.3285, 24.6849],
  uganda: [1.3733, 32.2903]
}

// Country bounds for proper zoom
const COUNTRY_BOUNDS = {
  ghana: [[-3.2557, 4.7388], [1.1995, 11.1733]],
  kenya: [[33.9089, -4.7677], [41.9062, 5.5196]],
  uganda: [[29.5794, -1.4821], [35.0361, 4.2340]],
  botswana: [[19.9995, -26.9075], [29.3682, -17.7808]]
}

// Computed properties
const availableSectors = computed(() => {
  return countrySectors[selectedCountry.value] || ['agriculture']
})

const dataRange = computed(() => {
  if (!choroplethData.value.length) {
    return { min: 0, max: 100, average: 0 }
  }

  const values = choroplethData.value.map(d => d.value)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((a, b) => a + b, 0) / values.length
  }
})

// API Functions
const fetchChoroplethData = async (country, sector) => {
  try {
    console.log(`Fetching choropleth data for ${country} ${sector}`)
    const response = await fetch(`${API_BASE_URL}/${country}/${sector}/choropleth`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch choropleth data')
    }

    console.log(`✅ Fetched ${result.data.choropleth_data.length} choropleth units`)
    return result.data.choropleth_data || []
  } catch (err) {
    throw new Error(`API Error: ${err.message}`)
  }
}

const fetchHotspotsData = async (country, sector, threshold = 70.0) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${country}/${sector}/hotspots?threshold=${threshold}`)

    if (!response.ok) {
      console.warn('Hotspots data not available')
      return []
    }

    const result = await response.json()

    if (result.success) {
      console.log(`✅ Fetched ${result.data.hotspots.length} hotspots`)
      return result.data.hotspots || []
    }

    return []
  } catch (err) {
    console.warn('Failed to fetch hotspots:', err.message)
    return []
  }
}

// Load data from API
const loadMapData = async () => {
  try {
    loading.value = true
    error.value = null

    console.log(`Loading data for ${selectedCountry.value} ${selectedSector.value}`)

    // Fetch data in parallel
    const [choroplethResponse, hotspotsResponse] = await Promise.all([
      fetchChoroplethData(selectedCountry.value, selectedSector.value),
      fetchHotspotsData(selectedCountry.value, selectedSector.value)
    ])

    // Update data
    choroplethData.value = choroplethResponse
    hotspotsData.value = hotspotsResponse

    console.log(`✅ Loaded ${choroplethData.value.length} units and ${hotspotsData.value.length} hotspots`)

    // Initialize map if needed
    if (!map) {
      await nextTick()
      initializeMap()
    }

    // Update map layers
    await nextTick()
    updateChoroplethLayer()
    updateHeatmap()
    focusOnCountry()

  } catch (err) {
    console.error('Failed to load map data:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Map initialization
const initializeMap = async () => {
  if (!mapContainer.value) return

  console.log('Initializing map...')

  // Create map centered on Africa
  map = L.map(mapContainer.value, {
    center: [0, 20], // Center of Africa
    zoom: 4,
    maxBounds: AFRICA_BOUNDS,
    maxBoundsViscosity: 1.0
  })

  // Add base layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map)

  // Initialize layer groups
  heatmapLayer = L.layerGroup().addTo(map)
  labelsLayer = L.layerGroup().addTo(map)

  // Focus on selected country
  focusOnCountry()
}

const focusOnCountry = () => {
  if (!map) return

  const bounds = COUNTRY_BOUNDS[selectedCountry.value]
  if (bounds) {
    map.fitBounds(bounds, {
      padding: [20, 20],
      animate: true,
      duration: 1.5
    })
  } else if (COUNTRY_CENTERS[selectedCountry.value]) {
    const center = COUNTRY_CENTERS[selectedCountry.value]
    map.setView(center, 7)
  }
}

// Generate mock GeoJSON since real boundaries might not be available
const generateMockGeoJSON = () => {
  if (!choroplethData.value.length) return null

  const bounds = COUNTRY_BOUNDS[selectedCountry.value]
  if (!bounds) return null

  const features = []
  const latRange = bounds[1][1] - bounds[0][1]
  const lngRange = bounds[1][0] - bounds[0][0]

  // Create a grid layout for districts
  const gridSize = Math.ceil(Math.sqrt(choroplethData.value.length))

  choroplethData.value.forEach((dataItem, index) => {
    const row = Math.floor(index / gridSize)
    const col = index % gridSize

    const centerLat = bounds[0][1] + (latRange * (row + 0.5) / gridSize)
    const centerLng = bounds[0][0] + (lngRange * (col + 0.5) / gridSize)

    const size = Math.min(latRange, lngRange) * 0.8 / gridSize

    features.push({
      type: "Feature",
      properties: {
        name: dataItem.name,
        district: dataItem.name,
        vulnerability: dataItem.value
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [centerLng - size/2, centerLat - size/2],
          [centerLng + size/2, centerLat - size/2],
          [centerLng + size/2, centerLat + size/2],
          [centerLng - size/2, centerLat + size/2],
          [centerLng - size/2, centerLat - size/2]
        ]]
      }
    })
  })

  return {
    type: 'FeatureCollection',
    features: features
  }
}

// Update choropleth layer with actual API data
const updateChoroplethLayer = async () => {
  if (!map || !choroplethData.value.length) return

  // Clear existing layers
  if (geoJsonLayer) {
    map.removeLayer(geoJsonLayer)
  }

  console.log(`Rendering ${choroplethData.value.length} districts`)

  // Try to load real GeoJSON, fallback to generated polygons
  let countryGeoJSON = null

  try {
    // Try to load real GeoJSON files (if available)
    const geoJsonFiles = {
      ghana: '/geojson/ghana_districts.geojson',
      kenya: '/geojson/kenya_counties.geojson',
      botswana: '/geojson/botswana_districts.geojson',
      uganda: '/geojson/uganda_districts.geojson'
    }

    if (geoJsonFiles[selectedCountry.value]) {
      const response = await fetch(geoJsonFiles[selectedCountry.value])
      if (response.ok) {
        countryGeoJSON = await response.json()
        console.log('✅ Loaded real GeoJSON boundaries')
      }
    }
  } catch (error) {
    console.warn('Real GeoJSON not available, using generated boundaries')
  }

  // Fallback to generated polygons if no real GeoJSON
  if (!countryGeoJSON) {
    countryGeoJSON = generateMockGeoJSON()
    console.log('✅ Generated mock boundaries')
  }

  if (!countryGeoJSON) {
    console.warn('No boundary data available')
    return
  }

  geoJsonLayer = L.geoJSON(countryGeoJSON, {
    style: (feature) => {
      const districtData = findMatchingDistrict(feature, choroplethData.value)
      const value = districtData ? districtData.value : 0

      return {
        fillColor: getVulnerabilityColor(value),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      }
    },
    onEachFeature: (feature, layer) => {
      const districtData = findMatchingDistrict(feature, choroplethData.value)

      if (districtData) {
        layer.on({
          mouseover: (e) => highlightFeature(e, districtData),
          mouseout: resetHighlight,
          click: (e) => selectDistrict(e, districtData)
        })

        // Add tooltip
        layer.bindTooltip(`
          <strong>${districtData.name}</strong><br/>
          Score: ${districtData.value?.toFixed(1) || 'N/A'}<br/>
          Level: ${districtData.level}
        `, {
          permanent: false,
          direction: 'center',
          className: 'district-tooltip'
        })
      }
    }
  }).addTo(map)

  // Update labels if enabled
  updateLabels()
}

// Find matching district between GeoJSON and API data
const findMatchingDistrict = (feature, choroplethData) => {
  if (!feature?.properties) return null

  // Try different property names that might contain the district name
  const possibleNames = [
    feature.properties.name,
    feature.properties.Name,
    feature.properties.NAME,
    feature.properties.district,
    feature.properties.District,
    feature.properties.DISTRICT,
    feature.properties.admin_name,
    feature.properties.shapeName,
    feature.properties.ADM2_EN,
    feature.properties.ADM1_EN
  ].filter(Boolean)

  for (const featureName of possibleNames) {
    const match = choroplethData.find(d => {
      const dataName = d.name.toLowerCase().trim()
      const propName = featureName.toLowerCase().trim()

      // Exact match
      if (dataName === propName) return true

      // Partial match (either direction)
      if (dataName.includes(propName) || propName.includes(dataName)) return true

      // Remove common suffixes and try again
      const cleanDataName = dataName.replace(/(district|municipality|metropolitan|municipal)$/i, '').trim()
      const cleanPropName = propName.replace(/(district|municipality|metropolitan|municipal)$/i, '').trim()

      return cleanDataName === cleanPropName ||
             cleanDataName.includes(cleanPropName) ||
             cleanPropName.includes(cleanDataName)
    })

    if (match) return match
  }

  return null
}

// Update heatmap layer with hotspots
const updateHeatmap = () => {
  if (!map || !heatmapLayer) return

  heatmapLayer.clearLayers()

  if (showHeatmap.value && hotspotsData.value.length) {
    console.log(`Rendering ${hotspotsData.value.length} hotspots`)

    hotspotsData.value.forEach((hotspot, index) => {
      // Generate sample coordinates within country bounds
      const bounds = COUNTRY_BOUNDS[selectedCountry.value]
      if (!bounds) return

      const lat = bounds[0][1] + Math.random() * (bounds[1][1] - bounds[0][1])
      const lng = bounds[0][0] + Math.random() * (bounds[1][0] - bounds[0][0])

      const hotspotLocation = [lat, lng]

      // Add hotspot marker
      const marker = L.marker(hotspotLocation, {
        icon: L.divIcon({
          className: 'hotspot-marker',
          html: '🔥',
          iconSize: [20, 20]
        })
      }).bindPopup(`
        <div style="font-family: Inter, sans-serif;">
          <h4 style="margin: 0 0 8px 0; color: #dc2626;">🔥 HOTSPOT</h4>
          <strong>${hotspot.location}</strong><br/>
          <span style="color: #dc2626;">Vulnerability: ${hotspot.score?.toFixed(1) || 'N/A'}</span><br/>
          Risk Level: ${hotspot.risk_level || 'High'}
        </div>
      `).addTo(heatmapLayer)

      // Add circle overlay
      L.circle(hotspotLocation, {
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.3,
        radius: 5000
      }).addTo(heatmapLayer)
    })
  }
}

// Update labels layer
const updateLabels = () => {
  if (!map || !labelsLayer) return

  labelsLayer.clearLayers()

  if (showLabels.value && geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      const center = layer.getBounds().getCenter()
      const feature = layer.feature
      const districtData = findMatchingDistrict(feature, choroplethData.value)

      if (districtData) {
        L.marker(center, {
          icon: L.divIcon({
            className: 'district-label',
            html: `<div class="label-content">${districtData.name}<br/><strong>${districtData.value?.toFixed(1) || 'N/A'}</strong></div>`,
            iconSize: [100, 40]
          })
        }).addTo(labelsLayer)
      }
    })
  }
}

// Utility functions
const getVulnerabilityColor = (value) => {
  if (!value) return '#cccccc'
  if (value >= 81) return '#d73027'      // Very High - Red
  if (value >= 61) return '#fc8d59'      // High - Orange
  if (value >= 41) return '#fee08b'      // Medium - Yellow
  if (value >= 21) return '#d9ef8b'      // Low - Light Green
  return '#91cf60'                       // Very Low - Dark Green
}

const highlightFeature = (e, districtData) => {
  const layer = e.target
  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.9
  })
  layer.bringToFront()
}

const resetHighlight = (e) => {
  if (geoJsonLayer) {
    geoJsonLayer.resetStyle(e.target)
  }
}

const selectDistrict = (e, districtData) => {
  selectedDistrict.value = districtData

  // Position popup near click
  const containerPoint = map.mouseEventToContainerPoint(e.originalEvent)
  popupStyle.value = {
    position: 'absolute',
    left: `${containerPoint.x + 10}px`,
    top: `${containerPoint.y - 10}px`,
    zIndex: 1000
  }

  console.log('District selected:', districtData.name)
}

const closePopup = () => {
  selectedDistrict.value = null
}

const resetView = () => {
  focusOnCountry()
}

const toggleHeatmap = () => {
  showHeatmap.value = !showHeatmap.value
  updateHeatmap()
}

const toggleLabels = () => {
  showLabels.value = !showLabels.value
  updateLabels()
}

const getRiskClass = (score) => {
  if (!score) return 'default'
  if (score >= 80) return 'danger'
  if (score >= 60) return 'warning'
  return 'success'
}

const clearError = () => {
  error.value = null
}

// Event handlers
const onCountryChange = () => {
  // Reset sector to first available for new country
  const availableForCountry = countrySectors[selectedCountry.value]
  if (!availableForCountry.includes(selectedSector.value)) {
    selectedSector.value = availableForCountry[0]
  }
  loadMapData()
}

const onSectorChange = () => {
  loadMapData()
}

// Lifecycle
onMounted(async () => {
  await nextTick()

  // Test API connectivity first
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    if (response.ok) {
      console.log('✅ Connected to Climate Data API')
      initializeMap()
      // Load initial data after a short delay
      setTimeout(() => loadMapData(), 500)
    } else {
      error.value = 'API connection failed - check if Flask server is running on port 5000'
    }
  } catch (err) {
    error.value = 'Cannot connect to API - ensure Flask server is running on http://localhost:5000'
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
.africa-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  font-family: Inter, sans-serif;
}

/* Country Selector */
.country-selector {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-wrap: wrap;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.selector-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.selector-group select {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  color: #333;
  min-width: 140px;
}

.load-data-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.load-data-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.load-data-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.map-container {
  width: 100%;
  height: 500px;
  position: relative;
}

/* Map Legend */
.map-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 220px;
}

.map-legend h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.legend-color {
  width: 20px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-stats {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.stat-item .label {
  color: #6b7280;
}

.stat-item .value {
  font-weight: 600;
  color: #374151;
}

/* Map Controls */
.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}

.control-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  transition: all 0.2s;
  font-size: 16px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #667eea;
  transform: translateY(-1px);
}

.control-btn.active {
  background: #667eea;
  color: white;
}

/* District Info Popup */
.district-info {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  min-width: 280px;
  z-index: 1001;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.info-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #6b7280;
}

.info-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-size: 0.875rem;
  color: #6b7280;
}

.info-item .value {
  font-weight: 600;
  font-size: 0.875rem;
}

.info-item .value.danger {
  color: #dc2626;
}

.info-item .value.warning {
  color: #d97706;
}

.info-item .value.success {
  color: #16a34a;
}

/* Error and Loading Overlays */
.error-overlay, .loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.error-content, .loading-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.error-content h3 {
  margin: 0 0 1rem 0;
  color: #dc2626;
}

.error-content p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .country-selector {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .selector-group {
    width: 100%;
  }

  .map-legend {
    position: relative;
    bottom: auto;
    left: auto;
    margin: 1rem;
  }

  .map-controls {
    flex-direction: row;
    top: auto;
    bottom: 80px;
    right: 20px;
  }
}
</style>

<style>
/* Global styles for Leaflet elements */
.district-label {
  background: none !important;
  border: none !important;
}

.label-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  font-family: Inter, sans-serif;
}

.hotspot-marker {
  background: none !important;
  border: none !important;
  text-align: center;
  font-size: 16px;
}

.district-tooltip {
  background: rgba(0, 0, 0, 0.8) !important;
  color: white !important;
  border: none !important;
  border-radius: 4px !important;
  font-family: Inter, sans-serif !important;
  font-size: 12px !important;
}

.leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.leaflet-popup-content {
  margin: 12px;
  font-size: 13px;
  font-family: Inter, sans-serif;
}
</style>
