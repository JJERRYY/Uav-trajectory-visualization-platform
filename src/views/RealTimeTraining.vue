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
              <a-progress :percent="episode_progress.digit" :format="()=> episode_progress.up+'/'+episode_progress.down" status="active" />
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
export {isSyncing};
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
      this.realTimeEpisodes = []
  },
  methods:{
    createWebSocket(url) {
    this.socket = new WebSocket(url);

    this.socket.onopen = (event) => {
      this.isConnected = true;
      console.log('WebSocket is open now.');
      // receivetCount.value = 0;
    };

    this.socket.onmessage = (event) => {
      if (event.data != 'ping') {
        var episode = JSON.parse(event.data);
        this.realTimeEpisodes.push(episode);
        // receivetCount.value+=1
        console.log(episode);
        if(this.realTimeEpisodes.length==1){
        this.ThreeRealTimeEngine.resetUAVUser(this.realTimeEpisodes[0])
        this.ThreeRealTimeEngine.startSimulate(this.realTimeEpisodes,episode_progress,step_progress)
      }
        
      }
      // console.log('Message from server:', JSON.parse(event.data));
    };

    this.socket.onclose = (event) => {
    if (event.code === 1000) {
      // 正常关闭
      this.realTimeEpisodes=[]
      console.log("正常关闭，清空realTimeEpisodes");
      
    } else {
      // 非正常关闭
      setTimeout(this.createWebSocket('ws://127.0.0.1:8765'), 1000);
    }
    };
  },
    handleSelect (key: string, keyPath: string[]){
      //处理顶部菜单栏点击
      // console.log(key, keyPath)
      console.log("点击"+key);
      if (key === '1') {
        this.$router.push('/');
      } else if (key === '2') {
        this.$router.push('/real-time-training');
        // currentPage.value = 'realTimeTraining';
      } else if (key.startsWith('3')) {
        currentPage.value = 'dataStatistics';
      }
    },
  },
  watch:{
    isSyncing(newVal,oldVal){
      if(isSyncing.value){
        //当点击开始同步按钮时
        this.createWebSocket('ws://127.0.0.1:8765')
        console.log("开始同步");
        
      }else{
        this.socket.close(1000);
        ///停止运动
      }
    },
  },
};
</script>

<style scoped>
.status-container {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: black;
  margin-left: 5px;
}

.status-dot.connected {
  background-color: green;
}


.el-timeline-item {
  cursor: pointer;
  /* 增加点击 */
}
.el-timeline-item:hover {
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); */
  background-color: #f5f5f5;
  height: 100%;
  width: 100%;
  padding:8px;
  color: #1890ff;

}



.three-canvas {
  /* background-color: #d6eaff; */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(#e4e0ba, #f7d9aa);

  z-index: 1;
}


.common-layout {
  height: 100%;
  width: 100%;
}
.canvas-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

.flex-grow {
  flex-grow: 1;
}
.scrollbar{
  margin: 0px;
}
.list-card{
  margin-left: 20px;
  margin-top: 10px;
}

.list-card .component {
    padding-left: 10px;
  }

  .progress {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

.config-wrapper{
  position: absolute;
  top: 100;
  left: 0;
  z-index: 2;
  
}


.card {
  opacity: .5;
  transition: opacity 1s ease-in-out;
}

.card:hover {
  opacity: 1;
}
</style>