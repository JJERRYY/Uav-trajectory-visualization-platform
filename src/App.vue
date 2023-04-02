<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

</script>

<template>
  <div id="app">
    <RouterView />
    <a-config-provider :locale="zhCN">
    </a-config-provider>
  </div>

</template>


<style >

body,html,#app{ 
  height: 100%; 

} 

</style>
