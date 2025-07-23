<template>
  <div class="climate-map-container">
    <!-- Country & Sector Controls -->
    <div class="country-controls">
      <div class="control-group">
        <label>Country:</label>
        <select v-model="selectedCountry" @change="onCountryChange" :disabled="loading">
          <option value="ghana">🇬🇭 Ghana</option>
          <option value="kenya">🇰🇪 Kenya</option>
          <option value="botswana">🇧🇼 Botswana</option>
          <option value="uganda">🇺🇬 Uganda</option>
        </select>
      </div>

      <div class="control-group">
        <label>Sector:</label>
        <select v-model="selectedSector" @change="onSectorChange" :disabled="loading">
          <option v-for="sector in availableSectors" :key="sector" :value="sector">
            {{ sector.charAt(0).toUpperCase() + sector.slice(1) }}
          </option>
        </select>
      </div>

      <button @click="loadMapData" :disabled="loading" class="load-btn">
        {{ loading ? '⏳ Loading...' : '🗺️ Load Map' }}
      </button>
    </div>

    <!-- Map Controls -->
    <div class="map-controls">
      <div class="control-group">
        <label>Map Style:</label>
        <select v-model="selectedMapStyle" @change="switchBaseLayer" class="style-select">
          <option value="openstreetmap">🗺️ OpenStreetMap</option>
          <option value="satellite">🛰️ Satellite</option>
          <option value="terrain">🏔️ Terrain</option>
          <option value="cartodb">📋 CartoDB Light</option>
        </select>
      </div>

      <div class="control-buttons">
        <button @click="animateHotspots" class="animate-btn" :disabled="!hasHotspots">
          ✨ Animate Hotspots
        </button>
        <button @click="resetView" class="reset-btn">
          🔄 Reset View
        </button>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="error" class="error-message">
      <h3>⚠️ Error Loading Data</h3>
      <p>{{ error }}</p>
      <button @click="clearError" class="retry-btn">Try Again</button>
    </div>

    <!-- Map Container -->
    <div ref="mapContainer" class="map-display" :style="{ height: mapHeight }"></div>

    <!-- Map Legend -->
    <div class="map-legend" v-if="!loading && choroplethData.length">
      <h4>{{ selectedCountry.toUpperCase() }} - {{ selectedSector.toUpperCase() }}</h4>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-color" :style="{ background: '#d73027' }"></span>
          Very High (81-100)
        </div>
        <div class="legend-item">
          <span class="legend-color" :style="{ background: '#fc8d59' }"></span>
          High (61-80)
        </div>
        <div class="legend-item">
          <span class="legend-color" :style="{ background: '#fee08b' }"></span>
          Medium (41-60)
        </div>
        <div class="legend-item">
          <span class="legend-color" :style="{ background: '#d9ef8b' }"></span>
          Low (21-40)
        </div>
        <div class="legend-item">
          <span class="legend-color" :style="{ background: '#91cf60' }"></span>
          Very Low (0-20)
        </div>
      </div>

      <div class="statistics" v-if="statistics">
        <p><strong>Current Data:</strong></p>
        <p>Units: {{ statistics.count }} | Min: {{ statistics.min?.toFixed(1) || 0 }} | Max: {{ statistics.max?.toFixed(1) || 0 }}</p>
        <p>Average: {{ statistics.average?.toFixed(1) || 0 }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="map-loading">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading {{ selectedCountry }} {{ selectedSector }} data...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Reactive variables
const mapContainer = ref()
const map = ref(null)
const selectedMapStyle = ref('openstreetmap')
const selectedCountry = ref('ghana')
const selectedSector = ref('agriculture')
const mapHeight = ref('500px')
const loading = ref(false)
const error = ref(null)

// Data
const choroplethData = ref([])
const hotspotsData = ref([])

// Leaflet layers
const baseLayers = ref({})
const choroplethLayer = ref(null)
const hotspotsLayer = ref(null)
const animationLayer = ref(null)

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'

// Country-Sector mapping from your documentation
const countrySectors = {
  ghana: ['agriculture', 'energy', 'water'],
  kenya: ['agriculture'],
  botswana: ['agriculture'],
  uganda: ['agriculture']
}

// Map configuration
const MAP_LAYERS = {
  openstreetmap: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors'
  },
  cartodb: {
    name: 'CartoDB Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
}

// Country bounds for zoom
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

const hasHotspots = computed(() => hotspotsData.value && hotspotsData.value.length > 0)

const statistics = computed(() => {
  if (!choroplethData.value.length) return null

  const values = choroplethData.value.map(d => d.value)
  return {
    count: choroplethData.value.length,
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((sum, val) => sum + val, 0) / values.length
  }
})

// API Functions
const fetchChoroplethData = async (country, sector) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${country}/${sector}/choropleth`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch choropleth data')
    }

    return result.data
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
      return result.data.hotspots || []
    }

    return []
  } catch (err) {
    console.warn('Failed to fetch hotspots:', err.message)
    return []
  }
}

// Load map data from API
const loadMapData = async () => {
  try {
    loading.value = true
    error.value = null

    console.log(`Fetching data for ${selectedCountry.value} ${selectedSector.value}`)

    // Fetch both choropleth and hotspots data in parallel
    const [choroplethResponse, hotspotsResponse] = await Promise.all([
      fetchChoroplethData(selectedCountry.value, selectedSector.value),
      fetchHotspotsData(selectedCountry.value, selectedSector.value)
    ])

    // Update data
    choroplethData.value = choroplethResponse.choropleth_data || []
    hotspotsData.value = hotspotsResponse || []

    console.log(`✅ Loaded ${choroplethData.value.length} choropleth units and ${hotspotsData.value.length} hotspots`)

    // Initialize map if needed
    if (!map.value) {
      await nextTick()
      initializeMap()
    }

    // Render data
    await nextTick()
    zoomToCountry(selectedCountry.value)
    renderChoropleth()
    renderHotspots()

  } catch (err) {
    console.error('Failed to load map data:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Map initialization
const initializeMap = () => {
  if (!mapContainer.value || map.value) return

  console.log('Initializing map...')

  // Create map instance
  map.value = L.map(mapContainer.value, {
    center: [0, 0],
    zoom: 2,
    zoomControl: false,
    attributionControl: true,
    maxBounds: [[-60, -180], [85, 180]],
    maxBoundsViscosity: 0.8
  })

  // Add zoom control
  L.control.zoom({ position: 'topright' }).addTo(map.value)

  // Setup base layers
  setupBaseLayers()

  // Initialize layer groups
  choroplethLayer.value = new L.LayerGroup().addTo(map.value)
  hotspotsLayer.value = new L.LayerGroup().addTo(map.value)
  animationLayer.value = new L.LayerGroup().addTo(map.value)

  // Initial zoom to current country
  zoomToCountry(selectedCountry.value)
}

const setupBaseLayers = () => {
  if (!map.value) return

  // Create all base layers
  Object.entries(MAP_LAYERS).forEach(([key, config]) => {
    baseLayers.value[key] = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 18,
      tileSize: 256
    })
  })

  // Set default layer
  baseLayers.value.openstreetmap.addTo(map.value)
}

const switchBaseLayer = () => {
  if (!map.value) return

  // Remove current base layer
  map.value.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map.value.removeLayer(layer)
    }
  })

  // Add new base layer
  if (baseLayers.value[selectedMapStyle.value]) {
    baseLayers.value[selectedMapStyle.value].addTo(map.value)
  }
}

const zoomToCountry = (country) => {
  if (!map.value || !COUNTRY_BOUNDS[country]) return

  const bounds = COUNTRY_BOUNDS[country]
  map.value.fitBounds(bounds, {
    padding: [20, 20],
    animate: true,
    duration: 1.5
  })
}

// Choropleth rendering with ACTUAL API DATA
const renderChoropleth = () => {
  if (!map.value || !choroplethLayer.value || !choroplethData.value.length) return

  console.log(`Rendering ${choroplethData.value.length} choropleth units`)

  // Clear existing choropleth
  choroplethLayer.value.clearLayers()

  // For each district/county in the API data, create a polygon
  choroplethData.value.forEach((dataItem, index) => {
    // Generate sample polygon (in production, use actual GeoJSON boundaries)
    const samplePolygon = generateSamplePolygon(selectedCountry.value, index, dataItem.name)

    const layer = L.geoJSON(samplePolygon, {
      style: {
        fillColor: getVulnerabilityColor(dataItem.value),
        weight: 1,
        opacity: 1,
        color: '#374151',
        fillOpacity: 0.8
      },
      onEachFeature: (feature, layer) => {
        // Hover effects
        layer.on({
          mouseover: (e) => {
            const target = e.target
            target.setStyle({
              weight: 3,
              fillOpacity: 1,
              color: '#111827'
            })
          },
          mouseout: (e) => {
            const target = e.target
            target.setStyle({
              weight: 1,
              fillOpacity: 0.8,
              color: '#374151'
            })
          },
          click: (e) => {
            // Emit district selected event
            console.log('District selected:', dataItem.name)
          }
        })

        // Create detailed popup with actual API data
        const popupContent = createPopupContent(dataItem)
        layer.bindPopup(popupContent)
      }
    })

    choroplethLayer.value.addLayer(layer)
  })

  console.log('✅ Choropleth rendering complete')
}

// Create popup content from API data
const createPopupContent = (dataItem) => {
  return `
    <div style="min-width: 250px; font-family: Inter, sans-serif;">
      <h3 style="margin: 0 0 8px 0; color: #1f2937; border-bottom: 2px solid ${getVulnerabilityColor(dataItem.value)}; padding-bottom: 4px;">
        ${dataItem.name}
      </h3>

      <div style="display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${getVulnerabilityColor(dataItem.value)}20; color: ${getVulnerabilityColor(dataItem.value)}; margin-bottom: 12px;">
        ${dataItem.level} Risk
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; margin-bottom: 12px;">
        <div>
          <strong>Vulnerability Score:</strong><br>
          <span style="font-size: 18px; font-weight: 700; color: ${getVulnerabilityColor(dataItem.value)}">${dataItem.value.toFixed(1)}</span>/100
        </div>
        <div>
          <strong>Risk Level:</strong><br>
          ${dataItem.level}
        </div>
      </div>

      ${dataItem.data.Region ? `<p><strong>Region:</strong> ${dataItem.data.Region}</p>` : ''}
      ${dataItem.data.Poverty_Level ? `<p><strong>Poverty Level:</strong> ${dataItem.data.Poverty_Level}%</p>` : ''}
      ${dataItem.data.Percent_Agriculture ? `<p><strong>Agriculture %:</strong> ${dataItem.data.Percent_Agriculture}%</p>` : ''}

      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        Click for more details
      </div>
    </div>
  `
}

// Hotspots rendering with ACTUAL API DATA
const renderHotspots = () => {
  if (!map.value || !hotspotsLayer.value || !hotspotsData.value.length) return

  console.log(`Rendering ${hotspotsData.value.length} hotspots`)

  // Clear existing hotspots
  hotspotsLayer.value.clearLayers()

  hotspotsData.value.forEach((hotspot, index) => {
    // Generate sample coordinates (in production, use actual coordinates)
    const bounds = COUNTRY_BOUNDS[selectedCountry.value]
    if (!bounds) return

    const lat = bounds[0][1] + Math.random() * (bounds[1][1] - bounds[0][1])
    const lng = bounds[0][0] + Math.random() * (bounds[1][0] - bounds[0][0])

    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#ef4444',
      color: '#dc2626',
      weight: 2,
      fillOpacity: 0.8
    })

    marker.bindPopup(`
      <div style="min-width: 180px; font-family: Inter, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #dc2626;">🔥 HOTSPOT</h3>
        <h4 style="margin: 0 0 8px 0; color: #1f2937;">${hotspot.location}</h4>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          <strong>Score:</strong> ${hotspot.score?.toFixed(1) || 'N/A'}<br>
          <strong>Risk:</strong> ${hotspot.risk_level || 'High'}
        </p>
      </div>
    `)

    hotspotsLayer.value.addLayer(marker)
  })
}

// Animations
const animateHotspots = () => {
  if (!map.value || !animationLayer.value || !hotspotsData.value.length) return

  // Clear existing animations
  animationLayer.value.clearLayers()

  hotspotsData.value.forEach((hotspot, index) => {
    // Generate sample coordinates
    const bounds = COUNTRY_BOUNDS[selectedCountry.value]
    if (!bounds) return

    const lat = bounds[0][1] + Math.random() * (bounds[1][1] - bounds[0][1])
    const lng = bounds[0][0] + Math.random() * (bounds[1][0] - bounds[0][0])

    const pulseMarker = L.circleMarker([lat, lng], {
      radius: 20,
      fillColor: '#ef4444',
      color: '#dc2626',
      weight: 2,
      fillOpacity: 0.3
    })

    animationLayer.value.addLayer(pulseMarker)

    // Animate pulse effect
    let scale = 1
    const animate = () => {
      scale = scale === 1 ? 1.5 : 1
      pulseMarker.setRadius(20 * scale)
      setTimeout(animate, 1000)
    }
    animate()
  })

  // Auto-remove animations after 10 seconds
  setTimeout(() => {
    animationLayer.value?.clearLayers()
  }, 10000)
}

const resetView = () => {
  zoomToCountry(selectedCountry.value)
  animationLayer.value?.clearLayers()
}

// Utility functions
const getVulnerabilityColor = (score) => {
  if (score >= 81) return '#d73027'      // Very High - Red
  if (score >= 61) return '#fc8d59'      // High - Orange
  if (score >= 41) return '#fee08b'      // Medium - Yellow
  if (score >= 21) return '#d9ef8b'      // Low - Light Green
  return '#91cf60'                       // Very Low - Dark Green
}

// Generate sample polygon for demonstration (replace with actual GeoJSON)
const generateSamplePolygon = (country, index, districtName) => {
  const bounds = COUNTRY_BOUNDS[country]
  if (!bounds) return null

  const latRange = bounds[1][1] - bounds[0][1]
  const lngRange = bounds[1][0] - bounds[0][0]

  // Create a grid layout for districts
  const gridSize = Math.ceil(Math.sqrt(choroplethData.value.length))
  const row = Math.floor(index / gridSize)
  const col = index % gridSize

  const centerLat = bounds[0][1] + (latRange * (row + 0.5) / gridSize)
  const centerLng = bounds[0][0] + (lngRange * (col + 0.5) / gridSize)

  const size = Math.min(latRange, lngRange) * 0.8 / gridSize

  return {
    type: "Feature",
    properties: { name: districtName },
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
  }
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

const clearError = () => {
  error.value = null
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
      // Load initial data
      setTimeout(() => loadMapData(), 500)
    } else {
      error.value = 'API connection failed - check if Flask server is running on port 5000'
    }
  } catch (err) {
    error.value = 'Cannot connect to API - ensure Flask server is running on http://localhost:5000'
  }
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
.climate-map-container {
  position: relative;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  font-family: Inter, sans-serif;
}

.country-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.country-controls .control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.country-controls label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.country-controls select {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  color: #333;
}

.load-btn {
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

.load-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.map-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.style-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
}

.control-buttons {
  display: flex;
  gap: 0.5rem;
}

.animate-btn, .reset-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.animate-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.animate-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.animate-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.reset-btn {
  background: linear-gradient(135deg, #6b7280, #374151);
  color: white;
}

.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
}

.error-message {
  padding: 1rem;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  margin: 1rem;
  border-radius: 6px;
}

.error-message h3 {
  margin: 0 0 0.5rem 0;
  color: #dc2626;
}

.error-message p {
  margin: 0 0 1rem 0;
  color: #7f1d1d;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.map-display {
  width: 100%;
  min-height: 400px;
  position: relative;
}

.map-legend {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
}

.map-legend h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
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
  font-size: 0.875rem;
  color: #374151;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.statistics {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.statistics p {
  margin: 0.25rem 0;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
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
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .country-controls, .map-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .control-buttons {
    width: 100%;
    justify-content: center;
  }

  .map-legend {
    position: relative;
    bottom: auto;
    right: auto;
    margin: 1rem;
  }
}
</style>
