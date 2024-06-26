import Vue from 'vue'
import Router from 'vue-router'
import Login from '../views/login/Common'
import Home from '../views/HomePage'
import Profile from "@/views/personal/Profile";
import PasswordChange from "@/views/personal/PasswordChange.vue"
import Welcome from "@/views/index/Welcome";
import CarReserve from '../views/reservation/CarReserve'
import RoomReserve from "@/views/reservation/RoomReserve";
import AllReserve from "@/views/reservation/AllReserve";
import CarManage from "@/views/resource/Car";
import RoomManage from "@/views/resource/Room";
import ReserveManage from "@/views/reservation/ReserveManage";
import UserManage from "@/views/userManage/UserManage";

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import check from "@/views/reservation/check.vue";
NProgress.configure({
  easing: 'ease',  // 动画方式
  speed: 500,  // 递增进度条的速度
  showSpinner: false, // 是否显示加载ico
  trickleSpeed: 200, // 自动递增间隔
  minimum: 0.3 // 初始化时的最小百分比
})

Vue.use(Router)

const router = new Router({
  routes: [


    //  login page
    {path: '/login', component: Login},

    // home page
    {path: '/', redirect: '/welcome'},
    {path:'/home',redirect:'/welcome'},
    {
      path: '/home', component: Home, children: [
        {path: '/profile', component: Profile, meta: {title: "个人信息",module:"账号设置"}},
        {path: '/passwordChange', component: PasswordChange, meta: {title: "密码管理",module:"账号设置"}},
        {path: '/welcome', component: Welcome, meta: {title: "首页"}},
        {path: '/car', component: CarReserve, meta: {title: "车辆预约",module: "预约管理"}},
        {path: '/room', component: RoomReserve, meta: {title: "会议室预约",module: "预约管理"}},
        {path: '/carManage', component: CarManage, meta: {title: "车辆管理",module: "资源管理"}},
        {path: '/roomManage', component: RoomManage, meta: {title: "会议室管理",module: "资源管理"}},
        {path: '/reserveManage', component: ReserveManage, meta: {title: "预约管理",module: "预约管理"}},
        {path: '/allReserve', component: AllReserve, meta: {title: "我的预约",module: "我的预约"}},
        {path: '/userManage', component: UserManage, meta: {title: "用户管理",module: "用户管理"}},
      ]
    },
  ]
})


//为路由对象添加beforeEach导航守卫
router.beforeEach((to, from, next) => {
  NProgress.start();
  //如果访问的是登录页，直接放行
  if (to.path === "/login") return next();
  //从sessionStorage 中获取到保存的 token值
  let token = window.sessionStorage.getItem("TOKEN");
  //如果没有token，强制跳转到登录页
  if (!token) return next('/login');
    next();
})

router.afterEach(()=>{
  NProgress.done();
})
export default router
