<template>
    <div class="common-layout">
      <el-container class="common-layout">
        <el-header>
          <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            :ellipsis="false"
            @select="handleSelect"
          >
            <img cover :height="50" src="src/res/Simulation platform.png" alt="Simulation platform" />
            <div class="flex-grow" />
            <el-menu-item index="1">训练可视化</el-menu-item>
            <el-menu-item index="2">实时训练</el-menu-item>
            <el-menu-item index="3">数据统计</el-menu-item>
          </el-menu>
        </el-header>
  
        <el-container class="common-layout">
          <el-main class="common-layout ">
            <div class="canvas-wrapper">
              <div class="three-canvas common-layout" ref="threeRealTimeTarget"></div>
  
              <a-card class="card progress" hoverable style="width: 300px">
                <!-- <a-progress :percent="episode_progress.digit" :format="()=> episode_progress.up+'/'+episode_progress.down" status="active" /> -->
                <a-progress
                  :percent="step_progress.digit"
                  :format="() => step_progress.up + '/' + step_progress.down"
                  status="active"
                />
                <!-- <a-button  :loading="isLooping" @click="toggleLoop" type="buttonType">启动仿真</a-button> -->
  
                <div class="status-container">
                  <span>服务器连接状态:</span>
                  <div class="status-dot" :class="{ connected: isConnected }"></div>
                </div>
                <el-switch v-model="isSyncing" active-text="正在监听" inactive-text="停止监听" />
              </a-card>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </template>
  

  <script lang="ts" setup>
  import { defineComponent, reactive, ref } from 'vue';
  import { MoreFilled } from '@element-plus/icons-vue'
  
  
  const activeIndex = ref('2')
  
  </script>

  <script lang="ts">
    import { defineComponent, reactive, ref } from 'vue';
    import { MoreFilled } from '@element-plus/icons-vue'
    import * as THREE from 'three';
    import { ThreeRealTimeEngine } from '../js/ThreeEngine';
    import { allBaseObject,AirPlane } from '../js/TBaseObject'
    import {allLights} from'../js/TLights'
    import { allHelper } from '../js/THelper'
    import { getTrainingDataList,getTrainingDataById } from '../js/api'

    const episode_progress= reactive({
        digit: 0,
        up:0,
        down:0,
        reset: function(down) {
        this.digit = 0;
        this.up = 0;
        this.down = down;
        }
        })
    const step_progress= reactive({
        digit: 0,
        up:0,
        down:0,
        reset: function(down) {
        this.digit = 0;
        this.up = 0;
        this.down =down ;
        }
        })

    const isLooping = ref(false)
    const isSyncing = ref(false)
    const currentPage=ref('trainingVisualization');
    const receivetCount = ref(0)//计算ws收到episode的数量
    export default {
        data() {
      return {
        currentPage:currentPage,
        receivetCount:receivetCount,
        realTimeEpisodes:[],
        socket:  null,
        isSyncing:isSyncing,
        isConnected: false,
        tableData :[],
        isLooping : isLooping,
        list_total_count:0,
        trainList : [
        {
          content: 'Custom icon',
          timestamp: '2018-04-12 20:46',
          size: 'large',
          type: 'primary',
          icon: MoreFilled,
        },
      ],
        current_page: ref(1),//首页的列表页码
        episode_progress:episode_progress,
        step_progress:step_progress,
        ThreeEngine: null,
        ThreeRealTimeEngine:null,
        selectedTrainData:null,
      };
    },

    mounted() {
        this.ThreeRealTimeEngine = new ThreeRealTimeEngine(this.$refs.threeRealTimeTarget)
        this.ThreeRealTimeEngine.addObject(...allLights)
    },
    };
  </script>
  
  <style scoped>
  /* 在这里定义组件的样式 */
  </style>