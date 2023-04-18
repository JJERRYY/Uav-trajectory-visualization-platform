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
  
                </el-timeline>
                <el-checkbox-group v-model="checkboxGroup1" size="small">
                <el-checkbox label="Option1" border disabled />
                <el-checkbox label="Option2" border disabled />
                </el-checkbox-group>


              <div id="components-pagination-demo-mini">
                <a-pagination size="small" v-model:current="current_page" :total="list_total_count" show-size-changer />
              </div>
            </el-card>
          </el-aside>
          <el-main class="common-layout ">



          </el-main>
          </el-container>
  
        </el-container>
  
      </el-container>
    </div>
</template>
<script lang="ts" setup>
import { defineComponent, reactive, ref } from 'vue';
import { MoreFilled } from '@element-plus/icons-vue'
const activeIndex = ref('3')

</script>
<script lang="ts">

</script>

<style scoped>

</style>