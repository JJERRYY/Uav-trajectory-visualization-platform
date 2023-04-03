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
                v-for="(activity, index) in activities"
                :key="index"
                :icon="activity.icon"
                :type="activity.type"
                :color="activity.color"
                :size="activity.size"
                :hollow="activity.hollow"
                :timestamp="activity.timestamp"
                >
                {{ activity.content }}
                </el-timeline-item>
              <!-- </el-scrollbar> -->

              </el-timeline>
          </el-card>
        </el-aside>
        <el-main class="common-layout ">
          <div class="canvas-wrapper">
            <div class="three-canvas common-layout" ref="threeTarget"></div>

            <a-card class="card progress" hoverable  style="width: 300px">
              <a-progress :percent="progress.digit" :format="()=> progress.up+'/'+progress.down" status="active" />
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

const activities = [
  {
    content: 'Custom icon',
    timestamp: '2018-04-12 20:46',
    size: 'large',
    type: 'primary',
    icon: MoreFilled,
  },
  {
    content: 'Custom color',
    timestamp: '2018-04-03 20:46',
    color: '#0bbd87',
  },
  {
    content: 'Custom size',
    timestamp: '2018-04-03 20:46',
    size: 'large',
  },
  {
    content: 'Custom hollow',
    timestamp: '2018-04-03 20:46',
    type: 'primary',
    hollow: true,
  },
  {
    content: 'Default node',
    timestamp: '2018-04-03 20:46',
  },
]

</script>

<script lang="ts">
import * as THREE from 'three';
import { ThreeEngine } from '../js/ThreeEngine';
import { allBaseObject,AirPlane } from '../js/TBaseObject'
import {allLights} from'../js/TLights'
import { allHelper } from '../js/THelper'

const progress= reactive({
      digit: 0,
      up:0,
      down:0
    })
export default {


    data() {
      return {
        progress:progress,
        ThreeEngine: null,
        train_config: {
            actor_lr: 0,
            critic_lr: 0,
            num_episodes: 0,
            num_steps: 0,
            gamma: 0,
            hidden_dim: 0,
            tau: 0,
            buffer_size: 0,
            minimal_size: 0,
            batch_size: 0,
            sigma: 0,
            num_uavs: 2,
            num_users: 2,
            env_name: "string"
      },
      train_data: [
        {
          episode_id: 0,
          state: {
            uav_position: [
                54,
                100,
                120,
                100,
                100,
                115
            ],
            user_position: [
                54,
                110,
                100,
                115,
            ],
            user_rate: "string"
          },
          action: {
            uav_direction_distance: "string",
            uav_power: "string",
            uav_association: "string"
          },
          reward: 0,
          next_state: {
            uav_position: [
                60,
                110,
                120,
                95,
                90,
                115
            ],
            user_position: [
                52,
                112,
                102,
                125,
            ],
            user_rate: "string"
          },
          done: true
        },        
        {
          episode_id: 1,
          state: {
            uav_position: [
                60,
                110,
                120,
                95,
                90,
                115
            ],
            user_position: [
                52,
                112,
                102,
                125,
            ],
            user_rate: "string"
          },
          action: {
            uav_direction_distance: "string",
            uav_power: "string",
            uav_association: "string"
          },
          reward: 0,
          next_state: {
            uav_position: [
                65,
                114,
                120,
                95,
                90,
                115
            ],
            user_position: [
                55,
                107,
                100,
                120,
            ],
            user_rate: "string"
          },
          done: true
        },
        {
          episode_id: 2,
          state: {
            uav_position: [
                65,
                125,
                120,
                45,
                105,
                115
            ],
            user_position: [
                65,
                179,
                122,
                15,
            ],
            user_rate: "string"
          },
          action: {
            uav_direction_distance: "string",
            uav_power: "string",
            uav_association: "string"
          },
          reward: 0,
          next_state: {
            uav_position: [
                65,
                114,
                120,
                95,
                90,
                115
            ],
            user_position: [
                55,
                107,
                100,
                120,
            ],
            user_rate: "string"
          },
          done: true
        },
      ],
      };
    },
    mounted() {
      this.ThreeEngine = new ThreeEngine(this.$refs.threeTarget,this.train_config,this.train_data,this.progress)
      // this.ThreeEngine.addObject(...allBaseObject)  // 添加基础模型
      // var Airplane = new AirPlane()
      // this.ThreeEngine.addObject(Airplane)  // 添加基础模型
      this.ThreeEngine.addObject(...allLights)  // 添加光线
      this.ThreeEngine.addObject(...allHelper)   // 添加辅助
      
    },

  }



</script>


<style>

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