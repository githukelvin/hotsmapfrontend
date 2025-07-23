import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import MapVisualization from '../views/MapVisualization.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing
    },
    {
      path: '/maps',
      name: 'MapVisualization', 
      component: MapVisualization
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0 }
  }
})

export default router
