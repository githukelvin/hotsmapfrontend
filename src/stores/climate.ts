import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import axios from 'axios'

export interface CountryData {
  id: number
  name: string
  code: string
  sectors: string[]
  data_sources: number
}

export interface DistrictData {
  id: number
  name: string
  region?: string
  vulnerability_score: number
  risk_level: string
  data: any
}

export interface ChoroplethData {
  name: string
  value: number
  raw_score: number
  level: string
  data: any
}

export interface ClimateApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: any
}

export const useClimateStore = defineStore('climate', () => {
  // Core state
  const selectedCountry = ref<string>('ghana')
  const selectedSector = ref<string>('agriculture')
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Data storage
  const countries = ref<CountryData[]>([])
  const currentChoroplethData = ref<ChoroplethData[]>([])
  const currentHotspots = ref<any[]>([])
  const systemSummary = ref<any>(null)

  // Statistics
  const statistics = reactive({
    totalCountries: 0,
    totalHotspots: 0,
    currentVulnerabilityRange: { min: 0, max: 100, average: 0 }
  })

  // API configuration
  const API_BASE = 'http://localhost:5000/api'

  // Computed values
  const availableSectors = computed(() => {
    const country = countries.value.find(c => c.code.toLowerCase() === selectedCountry.value)
    return country ? country.sectors : ['agriculture']
  })

  const isGhana = computed(() => selectedCountry.value === 'ghana')
  const hasMultipleSectors = computed(() => availableSectors.value.length > 1)


  // API helper function with mock data fallback
  async function apiCall<T>(endpoint: string): Promise<T> {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get<ClimateApiResponse<T>>(`${API_BASE}${endpoint}`)
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error(`API call failed for ${endpoint}:`, err)
      error.value = `Failed to load data from ${endpoint}`
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions
  async function fetchCountries() {
    try {
      const data = await apiCall<CountryData[]>('/countries')
      countries.value = data
      statistics.totalCountries = data.length
    } catch (err) {
      console.error('Failed to fetch countries:', err)
      // Set default values for graceful degradation
      countries.value = []
      statistics.totalCountries = 0
    }
  }

  async function fetchSystemSummary() {
    try {
      const data = await apiCall<any>('/summary')
      systemSummary.value = data
      if (data.countries?.total) {
        statistics.totalCountries = data.countries.total
      }
    } catch (err) {
      console.error('Failed to fetch system summary:', err)
      systemSummary.value = null
    }
  }

  async function fetchChoroplethData(country: string = selectedCountry.value, sector: string = selectedSector.value) {
    try {
      const endpoint = `/${country}/${sector}/choropleth`
      const data = await apiCall<{ choropleth_data: ChoroplethData[], statistics: any }>(endpoint)

      currentChoroplethData.value = data.choropleth_data
      statistics.currentVulnerabilityRange = {
        min: data.statistics.min,
        max: data.statistics.max,
        average: data.statistics.average
      }

      return data
    } catch (err) {
      console.error('Failed to fetch choropleth data:', err)
      currentChoroplethData.value = []
    }
  }

  async function fetchHotspots(country: string = selectedCountry.value, sector: string = selectedSector.value, threshold: number = 70.0) {
    try {
      const endpoint = `/${country}/${sector}/hotspots`
      const data = await apiCall<{ hotspots: any[], hotspot_count: number }>(endpoint)

      currentHotspots.value = data.hotspots
      statistics.totalHotspots = data.hotspot_count

      return data
    } catch (err) {
      console.error('Failed to fetch hotspots:', err)
      currentHotspots.value = []
    }
  }

  async function fetchGlobalHotspots(threshold: number = 70.0, limit: number = 50) {
    try {
      const endpoint = `/vulnerability/hotspots?threshold=${threshold}&limit=${limit}`
      const data = await apiCall<{ hotspots: any[], count: number }>(endpoint)

      return data
    } catch (err) {
      console.error('Failed to fetch global hotspots:', err)
      return { hotspots: [], count: 0 }
    }
  }

  async function changeCountryAndSector(country: string, sector: string) {
    selectedCountry.value = country
    selectedSector.value = sector

    // Fetch new data for the selected combination
    await Promise.all([
      fetchChoroplethData(country, sector),
      fetchHotspots(country, sector)
    ])
  }

  // Initialize store
  async function initialize() {
    await Promise.all([
      fetchCountries(),
      fetchSystemSummary(),
      fetchChoroplethData(),
      fetchHotspots()
    ])
  }

  // Risk level utilities
  function getRiskLevel(score: number): string {
    if (score >= 81) return 'Very High'
    if (score >= 61) return 'High'
    if (score >= 41) return 'Medium'
    if (score >= 21) return 'Low'
    return 'Very Low'
  }

  function getRiskColor(score: number): string {
    if (score >= 81) return '#d73027'      // Very High - Red
    if (score >= 61) return '#fc8d59'      // High - Orange
    if (score >= 41) return '#fee08b'      // Medium - Yellow
    if (score >= 21) return '#d9ef8b'      // Low - Light Green
    return '#91cf60'                       // Very Low - Dark Green
  }

  return {
    // State
    selectedCountry,
    selectedSector,
    loading,
    error,
    countries,
    currentChoroplethData,
    currentHotspots,
    systemSummary,
    statistics,

    // Computed
    availableSectors,
    isGhana,
    hasMultipleSectors,

    // Actions
    fetchCountries,
    fetchSystemSummary,
    fetchChoroplethData,
    fetchHotspots,
    fetchGlobalHotspots,
    changeCountryAndSector,
    initialize,

    // Utilities
    getRiskLevel,
    getRiskColor
  }
})
