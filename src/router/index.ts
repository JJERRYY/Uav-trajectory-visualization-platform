import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RealTimeTraining from '../views/RealTimeTraining.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/real-time-training',
      name: 'real-time-training',
      component: RealTimeTraining,
    },
  ],
});
export default router
