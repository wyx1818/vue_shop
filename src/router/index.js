import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "group-login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "group-login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "group-login_home_welcome" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "group-user_rights_roles" */ '../components/User/Users.vue')
const Rights = () => import(/* webpackChunkName: "group-user_rights_roles" */ '../components/Power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "group-user_rights_roles" */ '../components/Power/Roles.vue')

const Cate = () => import(/* webpackChunkName: "group-cate_params" */ '../components/Goods/Cate')
const Params = () => import(/* webpackChunkName: "group-cate_params" */ '../components/Goods/Params')

const GoodList = () => import(/* webpackChunkName: "group-GoodList_Add" */ '../components/Goods/List')
const Add = () => import(/* webpackChunkName: "group-GoodList_Add" */ '../components/Goods/Add')

const Order = () => import(/* webpackChunkName: "group-Order_Report" */ '../components/Order/Order')
const Report = () => import(/* webpackChunkName: "group-Order_Report" */ '../components/Report/Report')

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
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
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
