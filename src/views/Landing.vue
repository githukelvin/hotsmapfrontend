<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <!-- Preloader -->
    <div v-show="loading" id="preloader" class="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div id="status" class="la-ball-triangle-path">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>

    <!-- Header/Banner Section -->
    <header id="banner" class="relative min-h-screen flex flex-col">

      <!-- Navigation -->
      <nav id="header" class="relative z-10" :class="{ 'nav-solid': isScrolled }">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="row clearfix">
            <div class="col-1">
              <!-- Logo -->
              <div id="logo" class="float-left h-[71px] leading-[66px] mr-4">
                <img src="/images/agnes.png" id="banner-logo" alt="AGNES" class="max-h-[22px] align-middle mr-4"/>
                <img src="/images/agnes.png" id="navigation-logo" alt="AGNES" class="max-h-[22px] align-middle mr-4 hidden"/>
              </div>

              <!-- Main Navigation -->
              <nav id="nav-main" class="hidden md:block">
                <ul class="text-center uppercase text-[13px]">
                  <li class="inline-block list-none m-0">
                    <a href="#banner" @click="scrollToSection('banner')" class="block h-[71px] leading-[71px] px-[10px] hover:opacity-60 transition-opacity">Home</a>
                  </li>
                  <li class="inline-block list-none m-0">
                    <a href="#about" @click="scrollToSection('about')" class="block h-[71px] leading-[71px] px-[10px] hover:opacity-60 transition-opacity">About</a>
                  </li>
                  <li class="inline-block list-none m-0">
                    <a href="#gallery" @click="scrollToSection('gallery')" class="block h-[71px] leading-[71px] px-[10px] hover:opacity-60 transition-opacity">Gallery</a>
                  </li>
                  <li class="inline-block list-none m-0">
                    <router-link to="/maps" class="block h-[71px] leading-[71px] px-[10px] hover:opacity-60 transition-opacity">View Maps</router-link>
                  </li>
                </ul>
              </nav>

              <!-- Mobile Navigation Trigger -->
              <div id="nav-trigger" class="md:hidden text-right">
                <span @click="mobileMenuOpen = !mobileMenuOpen"
                      :class="{ 'open': mobileMenuOpen }"
                      class="inline-block w-[38px] h-[71px] text-[#111] cursor-pointer uppercase text-[22px] text-center rounded-t-[5px] transition-all duration-300 hover:opacity-60">
                </span>
              </div>

              <!-- Mobile Navigation -->
              <nav id="nav-mobile" class="relative md:hidden" :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }">
                <ul v-show="mobileMenuOpen" class="list-none absolute left-0 right-0 -ml-5 -mr-5 pt-[10px] pb-[10px] text-center bg-white shadow-lg">
                  <li class="mx-5 float-none text-left border-b border-[#e1e1e1] last:border-b-0">
                    <a href="#banner" @click="scrollToSection('banner')" class="block py-3 text-[#333] w-full h-auto leading-normal border-b-0 transition-all duration-300 hover:bg-[#fafafa]">Home</a>
                  </li>
                  <li class="mx-5 float-none text-left border-b border-[#e1e1e1] last:border-b-0">
                    <a href="#about" @click="scrollToSection('about')" class="block py-3 text-[#333] w-full h-auto leading-normal border-b-0 transition-all duration-300 hover:bg-[#fafafa]">About</a>
                  </li>
                  <li class="mx-5 float-none text-left border-b border-[#e1e1e1] last:border-b-0">
                    <a href="#gallery" @click="scrollToSection('gallery')" class="block py-3 text-[#333] w-full h-auto leading-normal border-b-0 transition-all duration-300 hover:bg-[#fafafa]">Gallery</a>
                  </li>
                  <li class="mx-5 float-none text-left border-b border-[#e1e1e1] last:border-b-0">
                    <router-link to="/maps" class="block py-3 text-[#333] w-full h-auto leading-normal border-b-0 transition-all duration-300 hover:bg-[#fafafa]">View Maps</router-link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </nav>

      <!-- Banner Content -->
      <div id="banner-content" class="row flex-1 flex items-center pt-[170px] pb-[100px]">
        <div class="col-38 max-w-4xl">
          <div class="section-heading">
            <h1 class="text-4xl md:text-[62px] md:leading-[60px] font-[800] text-[#111] pt-[5%] pb-5">Gender Hotspot Maps</h1>
            <h2 class="text-lg md:text-[18px] font-[300] text-[#111] leading-relaxed">
              The gender and climate change vulnerability hotspot map are decision-support tools providing evidence-based tools are guide effective decision-making by providing critical sex-disaggregated data sex-disaggregated data that will enable gender responsive decision-making and policy development across the national priority sectors of the economy such as the Agriculture, Water and sanitation, and Energy sectors.
            </h2>
          </div>
        </div>
      </div>

      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
    </header>

    <!-- Main Content Area -->
    <main id="content">
      <!-- About Section -->
      <section id="about" class="introduction scrollto py-20 bg-white">
        <div class="row clearfix max-w-[1245px] mx-auto px-5">
          <div class="col-3 w-full lg:w-1/3 float-left p-5">
            <div class="section-heading pb-[15px]">
              <h3 class="text-[14px] font-bold text-[#ccc] tracking-[2px] pb-0">About</h3>
              <h2 class="section-title text-[34px] font-[700] text-[#111] py-[14px]">
                Mapping the Intersection of Gender and Climate Change: Identifying Hotspots for Action
              </h2>
              <p class="section-subtitle text-[16px] font-[300] text-[#9c9c9c] leading-[25px]">
                Climate change affects everyone, but its impacts are not felt equally. Women, girls, and marginalized groups often bear the brunt of environmental degradation, extreme weather events, and resource scarcity due to existing social, economic, and cultural inequalities. To address these disparities, the Granular Gender and Climate Change Hotspot Mapping Tool identifies and maps regions where gender inequalities and climate risks intersect exacerbating vulnerabilities across key sectors.
              </p>
            </div>
          </div>

          <div class="col-2-3 w-full lg:w-2/3 float-left p-5">
            <!-- Icon Blocks -->
            <div class="col-2 w-full md:w-1/2 float-left p-5 icon-block icon-top animated fadeInUp" data-wow-delay="0.1s">
              <div class="icon relative block">
                <i class="fa fa-html5 fa-2x text-[#0494fc]"></i>
              </div>
              <div class="icon-block-description pt-[25px]">
                <h4 class="text-[18px] font-[400] text-[#111] font-bold pt-0 pb-[7px]">Data Collection</h4>
                <p class="leading-[25px] mt-0">We gather data from satellite imagery, climate models, and national surveys, ensuring a comprehensive and up-to-date picture.</p>
              </div>
            </div>

            <div class="col-2 w-full md:w-1/2 float-left p-5 icon-block icon-top animated fadeInUp" data-wow-delay="0.3s">
              <div class="icon relative block">
                <i class="fa fa-bolt fa-2x text-[#0494fc]"></i>
              </div>
              <div class="icon-block-description pt-[25px]">
                <h4 class="text-[18px] font-[400] text-[#111] font-bold pt-0 pb-[7px]">Analysis</h4>
                <p class="leading-[25px] mt-0">Advanced algorithms analyze the intersection of climate risks and gender disparities. This is a very crucial part</p>
              </div>
            </div>

            <div class="col-2 w-full md:w-1/2 float-left p-5 icon-block icon-top animated fadeInUp" data-wow-delay="0.5s">
              <div class="icon relative block">
                <i class="fa fa-tablet fa-2x text-[#0494fc]"></i>
              </div>
              <div class="icon-block-description pt-[25px]">
                <h4 class="text-[18px] font-[400] text-[#111] font-bold pt-0 pb-[7px]">Visualization</h4>
                <p class="leading-[25px] mt-0">Interactive maps and dashboards make complex data easy to understand and use.</p>
              </div>
            </div>

            <div class="col-2 w-full md:w-1/2 float-left p-5 icon-block icon-top animated fadeInUp" data-wow-delay="0.5s">
              <div class="icon relative block">
                <i class="fa fa-rocket fa-2x text-[#0494fc]"></i>
              </div>
              <div class="icon-block-description pt-[25px]">
                <h4 class="text-[18px] font-[400] text-[#111] font-bold pt-0 pb-[7px]">Scaling</h4>
                <p class="leading-[25px] mt-0">Expanding into more countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Gallery Section -->
      <section id="gallery" class="row text-center scrollto clearfix py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h3 class="text-[#0494fc] font-semibold text-lg mb-2">Gallery</h3>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Work in Action
            </h2>
            <p class="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore visual insights from our climate vulnerability mapping projects across African countries.
            </p>
          </div>

          <!-- Enhanced Slideshow Gallery -->
          <div class="relative max-w-5xl mx-auto">
            <!-- Main Slideshow Container -->
            <div class="slideshow-container relative overflow-hidden rounded-2xl shadow-2xl bg-white"
                 @mouseenter="stopAutoSlide"
                 @mouseleave="startAutoSlide">
              <!-- Slides -->
              <div 
                v-for="(item, index) in galleryItems"
                :key="index"
                :class="['slide', { 'active': currentSlide === index }]"
                class="absolute inset-0 transition-all duration-700 ease-in-out"
              >
                <div class="grid md:grid-cols-2 h-full">
                  <!-- Image Side -->
                  <div class="relative overflow-hidden">
                    <img 
                      :src="item.image" 
                      :alt="item.title" 
                      class="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                  
                  <!-- Content Side -->
                  <div class="p-12 md:p-16 flex flex-col justify-center bg-white">
                    <div class="mb-6">
                      <span class="inline-block px-4 py-2 bg-[#0494fc]/10 text-[#0494fc] text-sm font-semibold rounded-full">
                        {{ item.category }}
                      </span>
                    </div>
                    <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                      {{ item.title }}
                    </h3>
                    <p class="text-gray-600 mb-8 leading-relaxed text-lg">
                      {{ item.description }}
                    </p>
                    <div class="flex items-center text-sm text-gray-500">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {{ item.location }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation Arrows -->
              <button 
                @click="previousSlide"
                class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              
              <button 
                @click="nextSlide"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <!-- Slide Indicators -->
            <div class="flex justify-center mt-8 space-x-3">
              <button
                v-for="(item, index) in galleryItems"
                :key="index"
                @click="goToSlide(index)"
                :class="['slide-indicator', { 'active': currentSlide === index }]"
                class="w-3 h-3 rounded-full transition-all duration-300"
              ></button>
            </div>

            <!-- Thumbnail Navigation -->
            <div class="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4">
              <button
                v-for="(item, index) in galleryItems"
                :key="index"
                @click="goToSlide(index)"
                :class="['thumbnail-btn', { 'active': currentSlide === index }]"
                class="relative overflow-hidden rounded-lg aspect-square transition-all duration-300 hover:scale-105"
              >
                <img 
                  :src="item.image" 
                  :alt="item.title" 
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-black/20 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer id="landing-footer" class="clear-both bg-gray-900 text-white py-12">
      <div class="row clearfix max-w-[1245px] mx-auto px-5 py-0">
        <p id="copyright" class="col-2 w-1/2 float-left text-[12px] font-normal text-[#999] m-0">
          Made by <a href="https://www.agnesafrica.org/" class="text-[#999] hover:text-[#0494fc] transition-colors">AGNES</a>
        </p>

        <ul class="col-2 social-icons w-1/2 float-right list-none text-right">
          <li class="inline-block">
            <a href="#" title="Facebook" class="inline-block w-8 text-center text-[#999] hover:opacity-70">
              <i class="fa fa-facebook fa-1x"></i><span class="hidden">Facebook</span>
            </a>
          </li>
          <li class="inline-block">
            <a href="#" title="Twitter" class="inline-block w-8 text-center text-[#999] hover:opacity-70">
              <i class="fa fa-twitter fa-1x"></i><span class="hidden">Twitter</span>
            </a>
          </li>
          <li class="inline-block">
            <a href="#" title="Instagram" class="inline-block w-8 text-center text-[#999] hover:opacity-70">
              <i class="fa fa-instagram fa-1x"></i><span class="hidden">Instagram</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const loading = ref(true)
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
const currentSlide = ref(0)

const galleryItems = ref([
  { 
    title: "Climate Data Visualization", 
    image: "/images/gallery-images/IMAGE 1.jpg",
    category: "Data Analysis",
    description: "Advanced visualization tools helping policymakers understand climate vulnerability patterns across different regions and communities.",
    location: "Ghana, Kenya, Uganda, Botswana"
  },
  { 
    title: "Gender Analysis Dashboard", 
    image: "/images/gallery-images/IMAGE 2.webp",
    category: "Gender Research",
    description: "Interactive dashboards revealing how climate change disproportionately affects women and marginalized communities in agricultural sectors.",
    location: "Rural Communities"
  },
  { 
    title: "Mapping Interface", 
    image: "/images/gallery-images/IMAGE 3.jpg",
    category: "Technology",
    description: "User-friendly mapping interfaces that make complex climate data accessible to local governments and development organizations.",
    location: "Sub-Saharan Africa"
  },
  { 
    title: "Field Research & Data Collection", 
    image: "/images/gallery-images/IMAGE 5.jpg",
    category: "Research",
    description: "On-ground data collection efforts working directly with communities to understand local climate impacts and adaptation needs.",
    location: "East Africa"
  },
  { 
    title: "Community Workshops", 
    image: "/images/gallery-images/IMAGE 2.webp",
    category: "Capacity Building",
    description: "Training sessions with local communities and government officials on using climate vulnerability data for informed decision-making.",
    location: "West Africa"
  },
  { 
    title: "Policy Integration", 
    image: "/images/gallery-images/IMAGE 1.jpg",
    category: "Policy Impact",
    description: "Supporting governments in integrating gender-responsive climate data into national adaptation and development policies.",
    location: "National Level"
  }
])

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

const scrollToSection = (sectionId: string) => {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  mobileMenuOpen.value = false
}

// Slideshow functions
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % galleryItems.value.length
}

const previousSlide = () => {
  currentSlide.value = currentSlide.value === 0 ? galleryItems.value.length - 1 : currentSlide.value - 1
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

// Auto-advance slideshow
let slideInterval: number | null = null

const startAutoSlide = () => {
  slideInterval = setInterval(nextSlide, 5000)
}

const stopAutoSlide = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

onMounted(() => {
  // Initialize animations
  const animatedElements = document.querySelectorAll('.animated')
  animatedElements.forEach(el => {
    el.classList.add('fadeInUp')
  })

  // Add scroll listener
  window.addEventListener('scroll', handleScroll)

  // Start slideshow auto-advance
  startAutoSlide()

  // Hide preloader after a short delay
  setTimeout(() => {
    loading.value = false
  }, 1500)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  stopAutoSlide()
})
</script>

<style>
/* Import original CSS files - using global scope since they contain global styles */
@import '/css/style.css';
@import '/css/color.css';
@import '/css/font-awesome.min.css';
@import '/css/animate.css';

/* Critical styles from your original CSS */
#banner {
  background: url("/images/banner-images/image.jpeg") no-repeat center top;
  background-size: cover;
}

.nav-solid {
  background: #fff !important;
  box-shadow: 2px 0px 3px rgba(0, 0, 0, 0.2);
  position: fixed !important;
  left: 0;
  width: 100%;
}

.nav-solid #logo #banner-logo {
  display: none;
}

.nav-solid #logo #navigation-logo {
  display: inline-block !important;
}

.nav-solid nav a {
  border-bottom: 3px solid;
  border-color: #fff;
  color: #333;
  transition: all 0.3s ease-out;
}

.nav-solid nav a:hover {
  opacity: 1;
  border-color: #0494fc;
}

/* Mobile nav trigger styling */
#nav-trigger span:after {
  font-family: "FontAwesome";
  display: inline-block;
  width: 38px;
  height: 71px;
  line-height: 75px;
  text-align: center;
  content: "\f0c9";
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
}

#nav-trigger span.open:after {
  content: "\f00d";
}

/* Section heading styling */
.section-heading h2:after {
  background: #0494fc;
  content: "";
  display: block;
  width: 30px;
  height: 5px;
  margin-top: 30px;
}

.text-center .section-heading h2:after {
  margin: 30px auto 25px auto;
}

/* Preloader Animation */
.la-ball-triangle-path,
.la-ball-triangle-path > div {
  position: relative;
  box-sizing: border-box;
}

.la-ball-triangle-path {
  display: block;
  font-size: 0;
  color: #0494fc;
  width: 32px;
  height: 32px;
}

.la-ball-triangle-path > div {
  display: inline-block;
  float: none;
  background-color: currentColor;
  border: 0 solid currentColor;
  position: absolute;
  top: 0;
  left: 0;
  width: 10px;
  height: 10px;
  border-radius: 100%;
}

.la-ball-triangle-path > div:nth-child(1) {
  animation: ball-triangle-path-ball-one 2s 0s ease-in-out infinite;
}

.la-ball-triangle-path > div:nth-child(2) {
  animation: ball-triangle-path-ball-two 2s 0s ease-in-out infinite;
}

.la-ball-triangle-path > div:nth-child(3) {
  animation: ball-triangle-path-ball-tree 2s 0s ease-in-out infinite;
}

@keyframes ball-triangle-path-ball-one {
  0% { transform: translate(0, 220%); }
  17% { opacity: .25; }
  33% { opacity: 1; transform: translate(110%, 0); }
  50% { opacity: .25; }
  66% { opacity: 1; transform: translate(220%, 220%); }
  83% { opacity: .25; }
  100% { opacity: 1; transform: translate(0, 220%); }
}

@keyframes ball-triangle-path-ball-two {
  0% { transform: translate(110%, 0); }
  17% { opacity: .25; }
  33% { opacity: 1; transform: translate(220%, 220%); }
  50% { opacity: .25; }
  66% { opacity: 1; transform: translate(0, 220%); }
  83% { opacity: .25; }
  100% { opacity: 1; transform: translate(110%, 0); }
}

@keyframes ball-triangle-path-ball-tree {
  0% { transform: translate(220%, 220%); }
  17% { opacity: .25; }
  33% { opacity: 1; transform: translate(0, 220%); }
  50% { opacity: .25; }
  66% { opacity: 1; transform: translate(110%, 0); }
  83% { opacity: .25; }
  100% { opacity: 1; transform: translate(220%, 220%); }
}

/* Gallery hover effects */
#gallery a:before {
  font-size: 2.2em;
  font-style: normal;
  font-weight: normal;
  text-align: center;
  content: "+";
  width: 70px;
  height: 70px;
  border-radius: 100em;
  display: block;
  position: absolute;
  top: 55%;
  left: 50%;
  line-height: 72px;
  margin: -35px 0 0 -35px;
  opacity: 0;
  transition: all .2s linear;
  vertical-align: middle;
  background: #0494fc;
  color: white;
}

#gallery a:hover:before {
  opacity: 1;
  top: 50%;
  left: 50%;
}

/* Gallery Slideshow Styles */
.slideshow-container {
  height: 500px;
  position: relative;
}

.slide {
  opacity: 0;
  visibility: hidden;
  transform: translateX(100%);
}

.slide.active {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.slide .grid > div:first-child {
  height: 100%;
}

.slide-indicator {
  background: rgba(4, 148, 252, 0.3);
  border: none;
  cursor: pointer;
}

.slide-indicator.active {
  background: #0494fc;
  transform: scale(1.2);
}

.thumbnail-btn {
  border: 3px solid transparent;
  opacity: 0.7;
}

.thumbnail-btn.active {
  border-color: #0494fc;
  opacity: 1;
  transform: scale(1.05);
}

.thumbnail-btn:hover {
  opacity: 1;
}

.thumbnail-btn .absolute {
  transition: opacity 0.3s;
}

.thumbnail-btn:hover .absolute {
  opacity: 0;
}

.thumbnail-btn.active .absolute {
  opacity: 0;
}

.thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Responsive Design */
@media (max-width: 1024px) {
  #nav-trigger {
    display: block;
  }

  #nav-main {
    display: none !important;
  }

  #nav-mobile {
    display: block;
  }

  .slideshow-container {
    height: 600px;
  }

  .slide .grid {
    grid-template-columns: 1fr;
  }

  .slide .grid > div:first-child {
    height: 250px;
  }

  .slide .p-12 {
    padding: 2.5rem !important;
  }

  .slide .md\\:p-16 {
    padding: 2.5rem !important;
  }
}

@media (max-width: 480px) {
  .row {
    padding: 15px !important;
  }

  .col-1, .col-2, .col-3, .col-2-3, .col-38 {
    width: 100% !important;
    padding-right: 0;
    padding-left: 0;
  }

  #banner-content {
    padding-top: 85px !important;
  }

  #banner h1 {
    font-size: 48px !important;
  }

  .slideshow-container {
    height: 550px;
  }

  .slide .p-12 {
    padding: 2rem !important;
  }

  .slide .md\\:p-16 {
    padding: 2rem !important;
  }

  .thumbnail-btn {
    aspect-ratio: 1;
  }
}
</style>
