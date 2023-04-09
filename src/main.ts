import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import 'element-plus/dist/index.css'
import Antd from 'ant-design-vue';

import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/antd.css';
// import './assets/main.css'
import axios from 'axios';

const app = createApp(App)


app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
    locale: zhCn,
  })
app.use(Antd)

app.mount('#app')
