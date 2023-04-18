<template>
    <div :id="id" :style="{width: width, height: height}"></div>
  </template>
  
  <script>
  import { onMounted, watch } from 'vue';
  import * as echarts from 'echarts';
  
  export default {
    props: {
      id: {
        type: String,
        required: true
      },
      width: {
        type: String,
        default: '600px'
      },
      height: {
        type: String,
        default: '400px'
      },
      option: {
        type: Object,
        required: true
      }
    },
    setup(props) {
      let chart;
      onMounted(() => {
        chart = echarts.init(document.getElementById(props.id));
        chart.setOption(props.option);
      });
      watch(
        () => props.option,
        (newOption) => {
          chart.setOption(newOption);
        }
      );
    }
  }
  </script>