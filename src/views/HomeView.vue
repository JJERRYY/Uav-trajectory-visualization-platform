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
              <a-slider v-model:value="speed" :disabled="isLooping" />
            </a-card>

            <div class="config-wrapper card" hoverable  style="width: 300px">
              <el-table :data="configTableData" fit border style="width: 100%"  max-height="200">
                <el-table-column width="120"   prop="parameter" label="超参数" />
                <el-table-column prop="value"  label="数值" width="180" />
                <!-- <el-table-column prop="address" label="Address" /> -->
              </el-table>
            </div>
            <div class="state-wrapper card" hoverable  style="width: 300px">
              <el-table :data="stateTableData" fit border style="width: 100%"  max-height="200">
                <el-table-column width="120"   prop="state" label="状态" />
                <el-table-column prop="value"  label="参数" width="180" />
                <!-- <el-table-column prop="address" label="Address" /> -->
              </el-table>
            </div>

            <!-- <div class="trajectory-wrapper "   style="width: 500px"> -->
              <!-- <canvas ref="canvas" width="500" height="500"></canvas> -->
              <!-- <Chart id="lossChart" :option="lossChartOption"></Chart> -->
              <!-- <Chart id="trajectoryChart" :option="trajectoryChartOption"></Chart> -->
              <!-- <div id="trajectoryChart" style="width: 600px; height: 400px" ></div> -->
              <!-- <Chart id="lossChart" :option="lossChartOption"></Chart> -->
            <!-- </div> -->


          </div>
        </el-main>
        </el-container>
      <el-container v-if="currentPage === 'dataStatistics'">
        <el-aside width="400px" height="600px">
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
        <el-main class="common-layout" overflow="hidden">
          <div style="display: flex;">
              <div style="display: flex; flex-direction: column;">
                  <Chart id="rewardChart" :option="rewardChartOption"></Chart>
                  <Chart id="lossChart" :option="lossChartOption"></Chart>
              </div>
              <el-card shadow="always" class="list-card">
                  <div class=" card"  style="width: 300px">
                      <el-table :data="configTableData" fit border style="width: 100%" >
                          <el-table-column width="120" prop="parameter" label="超参数" />
                          <el-table-column prop="value" label="数值" width="180" />
                      </el-table>
                  </div>
              </el-card>
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
import newChart from "../js/newChart";
import Chart from '../components/Chart.vue';
import { ElCard } from 'element-plus';
import * as echarts from 'echarts';
import 'echarts-gl';

const speed = ref<number>(50);
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

// const trajectoryChartOption = reactive({
//   tooltip: {},
//   backgroundColor: '#fff',
//   visualMap: {
//     show: false,
//     dimension: 2,
//     min: 0,
//     max: 30,
//     inRange: {
//       color: [
//         '#313695',
//         '#4575b4',
//         '#74add1',
//         '#abd9e9',
//         '#e0f3f8',
//         '#ffffbf',
//         '#fee090',
//         '#fdae61',
//         '#f46d43',
//         '#d73027',
//         '#a50026'
//       ]
//     }
//   },
//   xAxis3D: {
//     type: 'value'
//   },
//   yAxis3D: {
//     type: 'value'
//   },
//   zAxis3D: {
//     type: 'value'
//   },
//   grid3D: {
//     viewControl: {
//       projection: 'orthographic'
//     }
//   },
//   series: [
//   ],
// });

    
const isLooping = ref(false)
const isSyncing = ref(false)
const currentPage=ref('trainingVisualization');
const receivetCount = ref(0)//计算ws收到episode的数量

// const lineChart = ref(null);
// const { setOption } = newChart(lineChart, true, true);

export { isLooping };
export default {
    data() {
        return {
            lossChartOption: {},
            rewardChartOption: {},
            trajectoryChartOption:{},
            currentPage: currentPage,
            receivetCount: receivetCount,
            realTimeEpisodes: [],
            socket: null,
            isSyncing: isSyncing,
            isConnected: false,
            stateTableData:[{state:"哈哈","value":1}],
            configTableData: [],
            isLooping: isLooping,
            list_total_count: 0,
            trainList: [
                {
                    content: "Custom icon",
                    timestamp: "2018-04-12 20:46",
                    size: "large",
                    type: "primary",
                    icon: MoreFilled,
                },
            ],
            current_page: ref(1),
            episode_progress: episode_progress,
            step_progress: step_progress,
            ThreeEngine: null,
            ThreeRealTimeEngine: null,
            selectedTrainData: null,
        };
    },
    mounted() {
        getTrainingDataList(this.current_page.value, 10).then(response => {
            // console.log(response);
            this.list_total_count = response.data.total_count;
            this.trainList = [];
            response.data.data.forEach(item => {
                item.content = "训练id" + item.id;
                item.timestamp = item.datetime;
                item.size = "large";
                // 并存入 trainList 中
                this.trainList.push(item);
                // this.selectedTrainData = item
                // console.log(item);
            });
            this.handleClick(response.data.data[0], 0);
            // console.log(this.selectedTrainData.data[0]);
            // console.dir(this.selectedTrainData);
            // console.log(JSON.stringify(this.selectedTrainData));
            this.ThreeEngine = new ThreeEngine(this.$refs.threeTarget, this.selectedTrainData.config, this.selectedTrainData.data, this.episode_progress, this.step_progress);
            // this.ThreeEngine = new ThreeRealTimeEngine(this.$refs.threeRealTimeTarget)
            this.ThreeEngine.addObject(...allLights); // 添加光线
        });
        // this.ThreeRealTimeEngine = new ThreeRealTimeEngine(this.$refs.threeRealTimeTarget)
        // this.ThreeRealTimeEngine.addObject(...allLights)
    },
    methods: {
        createWebSocket(url) {
            this.socket = new WebSocket(url);
            this.socket.onopen = (event) => {
                this.isConnected = true;
                console.log("WebSocket is open now.");
                receivetCount.value = 0;
            };
            this.socket.onmessage = (event) => {
                if (event.data != "ping") {
                    var episode = JSON.parse(event.data);
                    this.realTimeEpisodes.push(episode);
                    receivetCount.value += 1;
                    // console.log(episode);
                    var uav_num = episode.step_data[0].state["uav_position"].length;
                    var user_num = episode.step_data[0].state["user_position"].length;
                    // console.log("无人机"+uav_num+"user"+user_num);
                }
                // console.log('Message from server:', JSON.parse(event.data));
            };
            this.socket.onclose = (event) => {
                if (event.code === 1000) {
                    // 正常关闭
                }
                else {
                    // 非正常关闭
                    setTimeout(this.createWebSocket("ws://127.0.0.1:8765"), 1000);
                }
            };
        },
        
        getLossChartData() {
            let data;
            if (this.selectedTrainData.loss_list !== null) {
                data = this.selectedTrainData.loss_list.map((item, index) => [index + 1, item]);
            }
            else {
                return null;
            }
            // 计算步长为 10 的滑动平均
            let step = 10;
            let movingAverageData = [];
            for (let i = 0; i < data.length - step + 1; i++) {
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    sum += data[i + j][1];
                }
                let avg = sum / step;
                movingAverageData.push([i + 1, avg]);
            }
            let option = {
                xAxis: {
                    name: "epoch"
                },
                yAxis: {
                    name: "策略网络的平均损失"
                },
                tooltip: {
                    trigger: "axis"
                },
                series: [
                    {
                        name: "原始数据",
                        data: data,
                        type: "line",
                        symbol: "none",
                    },
                    {
                        name: "滑动平均",
                        data: movingAverageData,
                        type: "line",
                        symbol: "none",
                    }
                ]
            };
            return option;
        },
        getRewardChartData() {
            let data;
            if (this.selectedTrainData.returns_list !== null) {
                data = this.selectedTrainData.returns_list.map((item, index) => [index + 1, item]);
            }
            else {
                data = this.selectedTrainData.data.map((item, index) => [index, item.total_reward]);
            }
            let option = {
                xAxis: {
                    name: "epoch"
                },
                yAxis: {
                    name: "平均奖励"
                },
                tooltip: {
                    trigger: "item"
                },
                series: [
                    {
                        data: data,
                        type: "line",
                    }
                ]
            };
            return option;
        },
        handleSelect(key: string, keyPath: string[]) {
            //处理顶部菜单栏点击
            // console.log(key, keyPath)
            console.log("点击" + key);
            if (key === "1") {
                currentPage.value = "trainingVisualization";
            }
            else if (key === "2") {
                this.$router.push("/real-time-training");
            }
            else if (key === "3") {
                currentPage.value = "dataStatistics";
            }
        },
        handleClick(activity, index) {
            //处理首页列表点击
            // console.log('Clicked on activity:', activity);
            // 把this.trainList中当前index的item.hollow设成true 其他设成false
            this.selectedTrainData = activity;
            // console.log(this.selectedTrainData.value);
            this.trainList.forEach((item, i) => {
                if (i === index) {
                    item.hollow = true;
                    item.type = "primary";
                    // console.log(item);
                }
                else {
                    item.hollow = false;
                    item.type = null;
                }
            });
            isLooping.value = false;
        },
        onPageChange(page, pageSize) {
            //第一页左侧翻页时
            getTrainingDataList(page, pageSize).then(response => {
                // console.log(response);
                this.list_total_count = response.data.total_count;
                this.trainList = [];
                response.data.data.forEach(item => {
                    // let obj = {
                    //   content: '训练id'+item.id,
                    //   timestamp: item.datetime,
                    //   size: 'large',
                    // }
                    item.content = "训练id" + item.id;
                    item.timestamp = item.datetime;
                    item.size = "large";
                    item.hollow = false;
                    // 并存入 trainList 中
                    this.trainList.push(item);
                });
            });
        },
    },
    watch: {
      trajectoryChartOption(newVal){
        // console.log(newVal);
        // this.$forceUpdate();
        // var chart = echarts.init(document.getElementById('trajectoryChart'));
        // chart.setOption(this.trajectoryChartOption)
        // console.log(newVal.series[0]);
        
        // this.trajectoryChartOption.series[0].data.push([951, 381, 815])
        // chart.setOption(this.trajectoryChartOption)
      },
      selectedTrainData(newVal, oldVal) {
          // 在这里调用 ThreeEngine 类的方法来处理属性变化
          // this.threeEngine.handlePropChange(newVal, oldVal);
          // console.log(`myProp changed from ${oldVal} to ${newVal}`);
          console.log(newVal);
          // this.trajectoryChartOption = this.ThreeEngine.resetUAVUser(this.selectedTrainData.config, this.selectedTrainData.data[0],this.stateTableData,this.trajectoryChartOption);
          
          this.ThreeEngine.resetUAVUser(this.selectedTrainData.config, this.selectedTrainData.data[0],this.stateTableData);
          // this.$forceUpdate();
          // console.log(this.stateTableData);
          
          episode_progress.reset(this.selectedTrainData.data.length);
          step_progress.reset(this.selectedTrainData.data[0].num_step);
          // console.log(this.selectedTrainData.config);
          // 遍历config，将config的属性名作为 parameter，属性值做为value，构造一个字典，依次压入this.tableData中
          this.configTableData = [];
          for (let key in this.selectedTrainData.config) {
              let parameter = key;
              let value = this.selectedTrainData.config[key];
              this.configTableData.push({ parameter: parameter, value: value });
          }
          // console.log(this.tableData.values);
          this.rewardChartOption = this.getRewardChartData();
          this.lossChartOption = this.getLossChartData();

          // console.log(this.trajectoryChartOption);
          
          // console.log(this.rewardChartOption);
          // setOption(this.getLineChartData)
      },
      isLooping(newVal, oldVal) {
            //首页按钮状态
            // console.log(isLooping.value);
            // console.log(`myProp changed from ${oldVal} to ${newVal}`);
            if (isLooping.value) {
              // let duration = speed.value
              let duration = 1000 - (speed.value * 9.9);//线性映射，将滑块转化为时间间隔

              this.ThreeEngine.startSimulate(this.selectedTrainData.data, episode_progress, step_progress,this.stateTableData,duration,this.trajectoryChartOption);
            }
        }
    },
    components: { ElCard }
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
.state-wrapper{
  position: absolute;
  top: 0;
  /* left: 0; */
  right: 0;
  z-index: 2;
}
.trajectory-wrapper{
  background: #f5f5f5;
  position: absolute;
  bottom: 0;
  /* left: 0; */
  right: 0;
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