import * as echarts from "echarts/core";
 
import { SVGRenderer, CanvasRenderer } from "echarts/renderers";
 
import { BarChart, LineChart, PieChart } from "echarts/charts";
 
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  TimelineComponent,
} from "echarts/components";
 
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  TimelineComponent,
  CanvasRenderer
]);
 
export default echarts;