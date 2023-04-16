import axios from 'axios';



const http = axios.create({
    baseURL: 'http://127.0.0.1:5000/',
    timeout: 50000,
    headers: {'X-Custom-Header': 'foobar'}
  });

// 添加请求拦截器
http.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
http.interceptors.response.use(
    response => {
      // 对响应数据做点什么
      return response;
    },
    error => {
      // 对响应错误做点什么
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // 处理401错误
            console.error('未授权，请登录');
            break;
          case 403:
            // 处理403错误
            console.error('拒绝访问');
            break;
          case 500:
            // 处理500错误
            console.error('服务器内部错误');
            break;
        }
      }
      return Promise.reject(error);
    }
  );

// 定义get方法
http.get = function (url, params) {
    return http({
      method: 'get',
      url,
      params,
    });
  };
  
  // 定义post方法
  http.post = function (url, data) {
    return http({
      method: 'post',
      url,
      data,
    });
  };




export default http;