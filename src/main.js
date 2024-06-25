import Vue from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import axios from "axios";
import router from "@/router/router";
import moment from "moment";

//axios config
axios.defaults.baseURL = '/api'
Vue.prototype.$http = axios
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
})

Vue.use(Antd)


Vue.config.productionTip = false

new Vue({
  moment,
  router,
  render: h => h(App),
}).$mount('#app')
