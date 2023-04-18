import { nextTick, onMounted, onUnmounted, unref } from "vue";
import echarts from "./echartsLib.js";
import { SVGRenderer, CanvasRenderer } from "echarts/renderers";
 
export default function newChart( 
  elRef,
  autoChartSize = false,
  animation = false,
  theme = "default"
 ) {
  // 设置渲染模式
  echarts.use(CanvasRenderer);
 
  // echart实例
  let chartInstance = null;
 
  // 初始化图表
  const initCharts = () => {
    const el = unref(elRef);
    if (!el || !unref(el)) {
      return;
    }
    chartInstance = echarts.init(el, theme);
  };
 
  const setOption = (option) => {
    nextTick(() => {
      if (!chartInstance) {
        initCharts();
        if (!chartInstance) return;
      }
 
      chartInstance.setOption(option);
      hideLoading();
    });
  };
 
  // 获取echart实例
  function getInstance() {
    if (!chartInstance) {
      initCharts();
    }
    return chartInstance;
  }
 
  function resize() {
    chartInstance?.resize();
  }
 
  // 监听元素大小
  function watchEl() {
    // 添加过渡
    if (animation) {
      elRef.value.style.transition = "width 1s, height 1s";
    }
    const resizeObserver = new ResizeObserver((entries) => resize());
    resizeObserver.observe(elRef.value);
  }
 
  // 显示加载
  function showLoading() {
    if (!chartInstance) {
      initCharts();
    }
    chartInstance?.showLoading();
  }
  // 隐藏加载
  function hideLoading() {
    if (!chartInstance) {
      initCharts();
    }
    chartInstance?.hideLoading();
  }
 
  onMounted(() => {
    window.addEventListener("resize", resize);
    if (autoChartSize) watchEl();
  });
 
  onUnmounted(() => {
    window.removeEventListener("resize", resize);
  });
 
  return {
    setOption,
    getInstance,
    showLoading,
    hideLoading,
  };
}
 