import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://127.0.0.1:8765";
const URL =  "ws://localhost:8765";

// const io = new Server({
//   cors: {
//     origin: "http://localhost:8765"
//   }
// });
export const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"] //**加上这句**

});

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
});

socket.on("foo", (...args) => {
  state.fooEvents.push(args);
});

socket.on("bar", (...args) => {
  state.barEvents.push(args);
});