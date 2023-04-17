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
// import VueSocketIO from 'vue-socket.io'
// import VueSocketIOExt from 'vue-socket.io-extended';

// import SocketIO from "socket.io-client"
// import Socket from "./src/js/websocket.js"

const app = createApp(App)
// app.use(VueSocketIOExt, SocketIO('http://127.0.0.1:8765', { autoConnect: false }))


// main.js引入新建的js
// 配置
// const socketOptions = {
//   autoConnect: true,  // 自动连接
//   transports: ['websocket'], // 指定为websocket连接
//   reconnect: true,
//   reconnectionAttempts: 5 // 重连次数
// }
// app.use(socket, {
//   connection: 'ws://127.0.0.1:8765',
//   options: socketOptions
// })



app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
    locale: zhCn,
  })
app.use(Antd)

// app.use(new VueSocketIO({
//   debug: true,
//   connection: SocketIO('http://127.0.0.1:8765', { autoConnect: false }),
// }))

app.mount('#app')
