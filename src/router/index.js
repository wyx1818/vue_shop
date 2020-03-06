import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/User/Users.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/home',
    name: 'Home',
    redirect: '/welcome',
    component: Home,
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // 登录页面放行
  if (to.path === '/login') return next()
  // 其他页面检测登录情况
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  // 已登录放行
  next()
})

export default router
