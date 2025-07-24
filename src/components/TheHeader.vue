<template>
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 lg:h-20">

        <!-- Logo Section -->
        <div class="flex-shrink-0 flex items-center">
          <router-link :to="config.logoLink" class="flex items-center space-x-3 group">
            <div class="relative">
              <img
                :src="config.logoSrc"
                :alt="config.logoAlt"
                class="h-8 w-auto sm:h-10 lg:h-12 transition-transform duration-300 group-hover:scale-105"
                @error="handleImageError"
              />
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
            <span v-if="config.showTitle" class="hidden sm:block text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {{ config.title }}
            </span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-1 lg:space-x-2">
          <template v-for="item in navigationItems" :key="item.name">
            <router-link
              v-if="item.type === 'router'"
              :to="item.to"
              class="relative px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-xl group overflow-hidden"
              :class="getNavLinkClasses(item)"
              @click="handleNavClick(item)"
            >
              <span class="relative z-10 flex items-center space-x-2">
                <i v-if="item.icon" :class="item.icon" class="text-sm"></i>
                <span>{{ item.name }}</span>
                <span v-if="item.badge" class="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {{ item.badge }}
                </span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
              <div v-if="isActiveRoute(item)" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </router-link>

            <a
              v-else
              :href="item.href"
              class="relative px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-xl group overflow-hidden"
              :class="getNavLinkClasses(item)"
              @click="handleNavClick(item)"
            >
              <span class="relative z-10 flex items-center space-x-2">
                <i v-if="item.icon" :class="item.icon" class="text-sm"></i>
                <span>{{ item.name }}</span>
                <span v-if="item.badge" class="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {{ item.badge }}
                </span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
              <div v-if="isActiveLink(item)" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </a>
          </template>
        </div>

        <!-- CTA Button (Desktop) -->
        <div v-if="config.showCTA" class="hidden md:flex items-center">
          <button
            @click="handleCTAClick"
            class="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
          >
            <span class="relative z-10 flex items-center space-x-2">
              <i v-if="config.ctaIcon" :class="config.ctaIcon" class="text-sm"></i>
              <span>{{ config.ctaText }}</span>
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right"></div>
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center">
          <button
            @click="toggleMobileMenu"
            class="relative p-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{ 'text-blue-600 bg-blue-50': isMobileMenuOpen }"
            aria-label="Toggle navigation menu"
          >
            <div class="relative w-6 h-6">
              <!-- Hamburger Icon -->
              <span
                class="absolute block h-0.5 w-6 bg-current transform transition-all duration-300"
                :class="isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : 'translate-y-1'"
              ></span>
              <span
                class="absolute block h-0.5 w-6 bg-current transform transition-all duration-300"
                :class="isMobileMenuOpen ? 'opacity-0' : 'translate-y-2.5'"
              ></span>
              <span
                class="absolute block h-0.5 w-6 bg-current transform transition-all duration-300"
                :class="isMobileMenuOpen ? '-rotate-45 translate-y-2.5' : 'translate-y-4'"
              ></span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform -translate-y-4"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform -translate-y-4"
    >
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg z-40"
      >
        <div class="px-4 py-6 space-y-2">
          <!-- Mobile Navigation Items -->
          <template v-for="item in navigationItems" :key="`mobile-${item.name}`">
            <router-link
              v-if="item.type === 'router'"
              :to="item.to"
              @click="handleMobileNavClick(item)"
              class="flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300"
              :class="getMobileNavLinkClasses(item)"
            >
              <span class="flex items-center space-x-3">
                <i v-if="item.icon" :class="item.icon" class="text-lg"></i>
                <span>{{ item.name }}</span>
              </span>
              <span v-if="item.badge" class="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {{ item.badge }}
              </span>
            </router-link>

            <a
              v-else
              :href="item.href"
              @click="handleMobileNavClick(item)"
              class="flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300"
              :class="getMobileNavLinkClasses(item)"
            >
              <span class="flex items-center space-x-3">
                <i v-if="item.icon" :class="item.icon" class="text-lg"></i>
                <span>{{ item.name }}</span>
              </span>
              <span v-if="item.badge" class="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {{ item.badge }}
              </span>
            </a>
          </template>

          <!-- Mobile CTA Button -->
          <div v-if="config.showCTA" class="pt-4 border-t border-gray-200/50">
            <button
              @click="handleMobileCTA"
              class="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <i v-if="config.ctaIcon" :class="config.ctaIcon" class="text-sm"></i>
              <span>{{ config.ctaText }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Mobile Menu Backdrop -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        @click="closeMobileMenu"
        class="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
      ></div>
    </transition>

    <!-- Toast Notifications -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform translate-y-2"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform translate-y-2"
    >
      <div
        v-if="showToast"
        class="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
      >
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <i class="fas fa-check-circle text-green-500"></i>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ toastMessage }}</p>
          </div>
          <button @click="hideToast" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

// Types
interface NavigationItem {
  name: string
  type: 'router' | 'link'
  to?: string
  href?: string
  icon?: string
  badge?: string | number
  external?: boolean
}

interface NavbarConfig {
  logoSrc: string
  logoAlt: string
  logoLink: string
  title: string
  showTitle: boolean
  showCTA: boolean
  ctaText: string
  ctaIcon?: string
  ctaAction?: string
  variant: 'default' | 'dark' | 'transparent'
  sticky: boolean
}

// Internal state
const isMobileMenuOpen = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const currentRoute = useRoute()

// Default configuration - completely self-contained
const config = ref<NavbarConfig>({
  logoSrc: '/images/agnes.png',
  logoAlt: 'AGNES',
  logoLink: '/',
  title: 'AGNES',
  showTitle: false,
  showCTA: false,
  ctaText: 'Get Started',
  ctaIcon: 'fas fa-rocket',
  ctaAction: 'https://example.com/signup',
  variant: 'default',
  sticky: true
})

// Navigation items - automatically detects current route
const navigationItems = ref<NavigationItem[]>([
  {
    name: 'Home',
    type: 'router',
    to: '/',
    // icon: 'fas fa-home'
  },
  {
    name: 'About',
    type: 'link',
    href: '/#about',
    // icon: 'fas fa-info-circle'
  },
  {
    name: 'Gallery',
    type: 'link',
    href: '/#gallery',
    // icon: 'fas fa-images'
  },
  {
    name: 'View Maps',
    type: 'router',
    to: '/maps',
    // icon: 'fas fa-map',
    // badge: 'New'
  }
])

// Auto-detect environment and adjust config
onMounted(() => {
  detectEnvironment()
  loadUserPreferences()
})

// Environment detection
const detectEnvironment = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    console.log('🧭 ResponsiveNavbar: Development mode detected')
  }

  // Check if AGNES logo exists, fallback to default
  const img = new Image()
  img.onload = () => {
    console.log('✅ Logo loaded successfully')
  }
  img.onerror = () => {
    console.warn('⚠️ Logo not found, using fallback')
    config.value.logoSrc = 'https://via.placeholder.com/100x40/667eea/white?text=AGNES'
  }
  img.src = config.value.logoSrc
}

// Load user preferences from localStorage
const loadUserPreferences = () => {
  try {
    const savedPrefs = localStorage.getItem('navbar-preferences')
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs)
      Object.assign(config.value, prefs)
    }
  } catch (error) {
    console.warn('Could not load navbar preferences:', error)
  }
}

// Save user preferences
const saveUserPreferences = () => {
  try {
    localStorage.setItem('navbar-preferences', JSON.stringify(config.value))
  } catch (error) {
    console.warn('Could not save navbar preferences:', error)
  }
}

// Computed properties for active states
const isActiveRoute = (item: NavigationItem) => {
  if (item.type !== 'router' || !item.to) return false
  return currentRoute.path === item.to ||
    (item.to === '/maps' && currentRoute.path.startsWith('/maps'))
}

const isActiveLink = (item: NavigationItem) => {
  if (item.type !== 'link' || !item.href) return false
  // Check if current hash matches the href
  return window.location.hash === item.href.split('#')[1]
}

// Navigation link classes
const getNavLinkClasses = (item: NavigationItem) => {
  const isActive = item.type === 'router' ? isActiveRoute(item) : isActiveLink(item)
  return {
    'text-blue-600 bg-blue-50': isActive,
    'hover:scale-105': !isActive
  }
}

const getMobileNavLinkClasses = (item: NavigationItem) => {
  const isActive = item.type === 'router' ? isActiveRoute(item) : isActiveLink(item)
  return {
    'text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600': isActive
  }
}

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value

  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const handleNavClick = (item: NavigationItem) => {
  showToast.value = true
  toastMessage.value = `Navigating to ${item.name}`

  setTimeout(() => {
    showToast.value = false
  }, 2000)

  // Analytics tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', 'navigation_click', {
      'link_text': item.name,
      'link_url': item.to || item.href
    })
  }
}

const handleMobileNavClick = (item: NavigationItem) => {
  closeMobileMenu()
  handleNavClick(item)
}

const handleCTAClick = () => {
  if (config.value.ctaAction) {
    if (config.value.ctaAction.startsWith('http')) {
      // External link
      window.open(config.value.ctaAction, '_blank')
    } else {
      // Internal navigation
      window.location.href = config.value.ctaAction
    }
  }

  showToast.value = true
  toastMessage.value = 'Opening signup page...'

  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const handleMobileCTA = () => {
  closeMobileMenu()
  handleCTAClick()
}

const handleImageError = () => {
  config.value.logoSrc = 'https://via.placeholder.com/100x40/667eea/white?text=AGNES'
}

const hideToast = () => {
  showToast.value = false
}

// Click outside to close
const handleClickOutside = (event: Event) => {
  const navbar = document.querySelector('nav')
  if (navbar && !navbar.contains(event.target as Node)) {
    closeMobileMenu()
  }
}

// Escape key to close
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMobileMenu()
  }
}

// Route change handler
watch(() => currentRoute.path, () => {
  closeMobileMenu()
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = '' // Clean up body overflow
})

// Watch for config changes and save preferences
watch(config, () => {
  saveUserPreferences()
}, { deep: true })

// Public API for customization (optional)
const updateConfig = (newConfig: Partial<NavbarConfig>) => {
  Object.assign(config.value, newConfig)
}

const updateNavigation = (newItems: NavigationItem[]) => {
  navigationItems.value = newItems
}

const showNotification = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Expose methods for parent components (optional)
defineExpose({
  updateConfig,
  updateNavigation,
  showNotification,
  closeMobileMenu
})
</script>
