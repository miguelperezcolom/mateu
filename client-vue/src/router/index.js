import Vue from 'vue'
import Router from 'vue-router'
import MDDApp from '@/components/MDDApp'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'app',
      component: MDDApp
    }
  ]
})
