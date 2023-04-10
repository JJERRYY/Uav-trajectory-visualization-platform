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
    <!-- <el-menu-item index="0"> -->
    <img cover :height="50" 
    src="src/res/Simulation platform.png" alt="Simulation platform">

    <!-- </el-menu-item> -->
    <div class="flex-grow" />
    <el-menu-item index="1">训练可视化</el-menu-item>
    <el-menu-item index="2">实时训练</el-menu-item>
    <el-sub-menu index="3">
      <template #title>数据统计</template>
      <el-menu-item index="3-1">item one</el-menu-item>
      <el-menu-item index="3-2">item two</el-menu-item>
      <el-menu-item index="3-3">item three</el-menu-item>
    </el-sub-menu>

        </el-menu>
      </el-header>
      <el-container class="common-layout">
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

          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, reactive, ref } from 'vue';
import { MoreFilled } from '@element-plus/icons-vue'


const activeIndex = ref('1')

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}


</script>

<script lang="ts">
import * as THREE from 'three';
import { ThreeEngine } from '../js/ThreeEngine';
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
export { isLooping };
export default {
    data() {
      return {
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
        current_page: ref(1),
        episode_progress:episode_progress,
        step_progress:step_progress,
        ThreeEngine: null,
        selectedTrainData:null,
        
      //   train_config: {
      //       actor_lr: 0,
      //       critic_lr: 0,
      //       num_episodes: 0,
      //       num_steps: 0,
      //       gamma: 0,
      //       hidden_dim: 0,
      //       tau: 0,
      //       buffer_size: 0,
      //       minimal_size: 0,
      //       batch_size: 0,
      //       sigma: 0,
      //       num_uavs: 2,
      //       num_users: 2,
      //       env_name: "string"
      // },
      // train_data: [
      //   {
      //     episode_id: 0,
      //     state: {
      //       uav_position: [
      //           54,
      //           100,
      //           120,
      //           100,
      //           100,
      //           115
      //       ],
      //       user_position: [
      //           54,
      //           110,
      //           100,
      //           115,
      //       ],
      //       user_rate: "string"
      //     },
      //     action: {
      //       uav_direction_distance: "string",
      //       uav_power: "string",
      //       uav_association: "string"
      //     },
      //     reward: 0,
      //     next_state: {
      //       uav_position: [
      //           60,
      //           110,
      //           120,
      //           95,
      //           90,
      //           115
      //       ],
      //       user_position: [
      //           52,
      //           112,
      //           102,
      //           125,
      //       ],
      //       user_rate: "string"
      //     },
      //     done: true
      //   },        
      //   {
      //     episode_id: 1,
      //     state: {
      //       uav_position: [
      //           60,
      //           110,
      //           120,
      //           95,
      //           90,
      //           115
      //       ],
      //       user_position: [
      //           52,
      //           112,
      //           102,
      //           125,
      //       ],
      //       user_rate: "string"
      //     },
      //     action: {
      //       uav_direction_distance: "string",
      //       uav_power: "string",
      //       uav_association: "string"
      //     },
      //     reward: 0,
      //     next_state: {
      //       uav_position: [
      //           65,
      //           114,
      //           120,
      //           95,
      //           90,
      //           115
      //       ],
      //       user_position: [
      //           55,
      //           107,
      //           100,
      //           120,
      //       ],
      //       user_rate: "string"
      //     },
      //     done: true
      //   },
      //   {
      //     episode_id: 2,
      //     state: {
      //       uav_position: [
      //           65,
      //           125,
      //           120,
      //           45,
      //           105,
      //           115
      //       ],
      //       user_position: [
      //           65,
      //           179,
      //           122,
      //           15,
      //       ],
      //       user_rate: "string"
      //     },
      //     action: {
      //       uav_direction_distance: "string",
      //       uav_power: "string",
      //       uav_association: "string"
      //     },
      //     reward: 0,
      //     next_state: {
      //       uav_position: [
      //           65,
      //           114,
      //           120,
      //           95,
      //           90,
      //           115
      //       ],
      //       user_position: [
      //           55,
      //           107,
      //           100,
      //           120,
      //       ],
      //       user_rate: "string"
      //     },
      //     done: true
      //   },
      // ],
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
      this.ThreeEngine.addObject(...allLights)  // 添加光线
      // this.ThreeEngine.addObject(...allHelper)   // 添加辅助
    })


    },
  methods: {
  handleClick(activity,index) {
    // console.log('Clicked on activity:', activity);
    // 把this.trainList中当前index的item.hollow设成true 其他设成false
    this.selectedTrainData = activity
    this.trainList.forEach((item, i) => {
    if (i === index) {
      item.hollow = true;
      item.type= 'primary'
      console.log(item);
    } else {
      item.hollow = false;
      item.type = null 
    }
  });
  },
  onPageChange(page,pageSize){
    getTrainingDataList(page, pageSize).then(response => {
        console.log(response);
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
    selectedTrainData(newVal, oldVal) {
      // 在这里调用 ThreeEngine 类的方法来处理属性变化
      // this.threeEngine.handlePropChange(newVal, oldVal);
      console.log(`myProp changed from ${oldVal} to ${newVal}`);
      this.ThreeEngine.resetUAVUser(this.selectedTrainData.config,this.selectedTrainData.data[0])
      episode_progress.reset(this.selectedTrainData.data.length)
      step_progress.reset(this.selectedTrainData.data[0].num_step)
      // this.ThreeEngine.resetEventListener(this.ThreeEngine.dom,this.selectedTrainData.data,episode_progress,step_progress)
      // this.ThreeEngine = new ThreeEngine(this.$refs.threeTarget,this.selectedTrainData.config,this.selectedTrainData.data,
      //                                         this.episode_progress,
      //                                         this.step_progress)
      // this.ThreeEngine.addObject(...allLights)  // 添加光线
      // this.ThreeEngine.addObject(...allHelper)   // 添加辅助
      
    },
    isLooping(newVal,oldVal){
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

.card {
  opacity: .5;
  transition: opacity 1s ease-in-out;
}

.card:hover {
  opacity: 1;
}

</style>