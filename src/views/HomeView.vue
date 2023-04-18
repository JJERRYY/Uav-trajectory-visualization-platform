<template>
  <div class="common-layout">
    <el-container class="common-layout">
      <el-header >
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
        <el-container v-show="currentPage === 'trainingVisualization'">
          <el-aside width="250px">
          <el-card shadow="always" class="list-card">
              <el-timeline class="component">
                <!-- <el-scrollbar class="scrollbar"> -->

                <el-timeline-item
                v-for="(activity, index) in trainList"
                :key="index"
                :type="activity.type"
                :color="activity.color"
                :size="activity.size"
                :hollow="activity.hollow"
                :timestamp="activity.timestamp"
                @click="handleClick(activity,index)"
                @change="onPageChange"
                >
                {{ activity.content }}
                </el-timeline-item>
              <!-- </el-scrollbar> -->

              </el-timeline>
            <div id="components-pagination-demo-mini">
              <a-pagination size="small" v-model:current="current_page" :total="list_total_count" show-size-changer />
            </div>
          </el-card>
        </el-aside>
        <el-main class="common-layout ">
          <div class="canvas-wrapper">
            <div class="three-canvas common-layout" ref="threeTarget"></div>

            <a-card class="card progress" hoverable  style="width: 300px">
              <a-progress :percent="episode_progress.digit" :format="()=> episode_progress.up+'/'+episode_progress.down" status="active" />
              <a-progress :percent="step_progress.digit" :format="()=> step_progress.up+'/'+step_progress.down" status="active" />
              <!-- <a-button  :loading="isLooping" @click="toggleLoop" type="buttonType">启动仿真</a-button> -->
              <el-switch
              v-model="isLooping"
              active-text="正在仿真"
              inactive-text="停止仿真"
            />
            </a-card>

            <div class="config-wrapper card" hoverable  style="width: 300px">
              <el-table :data="tableData" fit border style="width: 100%"  max-height="200">
                <el-table-column width="120"   prop="parameter" label="超参数" />
                <el-table-column prop="value"  label="数值" width="180" />
                <!-- <el-table-column prop="address" label="Address" /> -->
              </el-table>
            </div>
          </div>
        </el-main>
        </el-container>

      </el-container>

    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, reactive, ref } from 'vue';
import { MoreFilled } from '@element-plus/icons-vue'
const activeIndex = ref('1')

</script>

<script lang="ts">
import * as THREE from 'three';
import { ThreeEngine,ThreeRealTimeEngine } from '../js/ThreeEngine';
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


export { isLooping };
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
      getTrainingDataList(this.current_page.value, 10).then(response => {
        console.log(response);
        this.list_total_count =  response.data.total_count
        this.trainList = []
        response.data.data.forEach(item => {
          item.content = '训练id'+item.id
          item.timestamp = item.datetime
          item.size = 'large'
          // 并存入 trainList 中
          this.trainList.push(item)
          // this.selectedTrainData = item
          // console.log(item);
        })
        this.handleClick(response.data.data[0],0)
      // console.log(this.selectedTrainData.data[0]);
      // console.dir(this.selectedTrainData);
      // console.log(JSON.stringify(this.selectedTrainData));
      
      
      this.ThreeEngine = new ThreeEngine(this.$refs.threeTarget,this.selectedTrainData.config,this.selectedTrainData.data,
                                              this.episode_progress,
                                              this.step_progress)
      // this.ThreeEngine = new ThreeRealTimeEngine(this.$refs.threeRealTimeTarget)
      this.ThreeEngine.addObject(...allLights)  // 添加光线
      // console.log(this.ThreeEngine);
      

      // this.ThreeEngine.addObject(...allHelper)   // 添加辅助
    })

    // this.ThreeRealTimeEngine = new ThreeRealTimeEngine(this.$refs.threeRealTimeTarget)
    // this.ThreeRealTimeEngine.addObject(...allLights)


    },
  methods: {
    createWebSocket(url) {
    this.socket = new WebSocket(url);

    this.socket.onopen = (event) => {
      this.isConnected = true;
      console.log('WebSocket is open now.');
      receivetCount.value = 0;
    };

    this.socket.onmessage = (event) => {
      if (event.data != 'ping') {
        var episode = JSON.parse(event.data);
        this.realTimeEpisodes.push(episode);
        receivetCount.value+=1
        console.log(episode);
        var uav_num = episode.step_data[0].state['uav_position'].length
        var user_num = episode.step_data[0].state['user_position'].length
        console.log("无人机"+uav_num+"user"+user_num);
        
      }
      // console.log('Message from server:', JSON.parse(event.data));
    };

    this.socket.onclose = (event) => {
    if (event.code === 1000) {
      // 正常关闭
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
      currentPage.value = 'trainingVisualization';
    } else if (key === '2') {
      this.$router.push('/real-time-training');


      // currentPage.value = 'realTimeTraining';
    } else if (key.startsWith('3')) {
      currentPage.value = 'dataStatistics';
    }
  },
  handleClick(activity,index) {
    //处理首页列表点击
    // console.log('Clicked on activity:', activity);
    // 把this.trainList中当前index的item.hollow设成true 其他设成false
    this.selectedTrainData = activity
    this.trainList.forEach((item, i) => {
    if (i === index) {
      item.hollow = true;
      item.type= 'primary'
      // console.log(item);
    } else {
      item.hollow = false;
      item.type = null 
    }
  });
  isLooping.value=false
  },
  onPageChange(page,pageSize){
    //第一页左侧翻页时
    getTrainingDataList(page, pageSize).then(response => {
        // console.log(response);
        this.list_total_count =  response.data.total_count
        this.trainList = []
        response.data.data.forEach(item => {
          // let obj = {
          //   content: '训练id'+item.id,
          //   timestamp: item.datetime,
          //   size: 'large',
          // }
          item.content = '训练id'+item.id
          item.timestamp = item.datetime
          item.size = 'large'
          item.hollow = false
          // 并存入 trainList 中
          this.trainList.push(item)
        })
    })
  },
},
  watch: {
    receivetCount(newVal,oldVal){
      console.log("receivetCount"+receivetCount.value);
      
      if(receivetCount.value ===1){
        this.ThreeRealTimeEngine.resetUAVUser(this.realTimeEpisodes[0])
        console.log("第一次接收");

        
      }
    },
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
    currentPage(newVal,oldVal){
      //翻页到仿真时
      if(currentPage.value ==='realTimeTraining'){

        

        // console.log(this.ThreeRealTimeEngine);

        console.log("realTimeTraining");
        
      }else{
        isSyncing.value = false;
        this.isConnected = false;
      }


    },
    selectedTrainData(newVal, oldVal) {
      // 在这里调用 ThreeEngine 类的方法来处理属性变化
      // this.threeEngine.handlePropChange(newVal, oldVal);
      console.log(`myProp changed from ${oldVal} to ${newVal}`);
      this.ThreeEngine.resetUAVUser(this.selectedTrainData.config,this.selectedTrainData.data[0])
      episode_progress.reset(this.selectedTrainData.data.length)
      step_progress.reset(this.selectedTrainData.data[0].num_step)

    // console.log(this.selectedTrainData.config);
    
    // 遍历config，将config的属性名作为 parameter，属性值做为value，构造一个字典，依次压入this.tableData中
    this.tableData=[]
    for (let key in this.selectedTrainData.config) {
      let parameter = key;
      let value = this.selectedTrainData.config[key];
      this.tableData.push({parameter: parameter, value: value});
    }
    console.log(this.tableData.values);
      
    },
    isLooping(newVal,oldVal){
      //首页按钮状态
      // console.log(isLooping.value);
      // console.log(`myProp changed from ${oldVal} to ${newVal}`);

      if (isLooping.value) {
        this.ThreeEngine.startSimulate(this.selectedTrainData.data, episode_progress, step_progress);
    }

    }
  },
  }



</script>


<style>
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