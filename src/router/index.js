import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CameraSetupView from '../views/CameraSetupView.vue';
import TutorialView from '../views/TutorialView.vue';
import GameView from '../views/GameView.vue';
import ResultView from '../views/ResultView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/camera',
    name: 'camera',
    component: CameraSetupView
  },
  {
    path: '/tutorial',
    name: 'tutorial',
    component: TutorialView
  },
  {
    path: '/game',
    name: 'game',
    component: GameView
  },
  {
    path: '/result',
    name: 'result',
    component: ResultView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
