import { WebGLRenderer, Scene, PerspectiveCamera, Vector3 ,MOUSE } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three';
import * as MyObject from '../js/TBaseObject'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

import image from '/public/resource/grass.jpg'

var Colors = {
  red:0xf25346,  
  white:0xd8d0d1,  
  brown:0x59332e,  
  pink:0xF5986E,
  brownDark:0x23190f,  
  blue:0x68c3c0
};
//引入tween用作动画
// const TWEEN = require('@tweenjs/tween.js')

export class ThreeEngine {
  dom = null; // 挂载的 DOM
  scene = null; // 场景
  user_mixers = [];
  uav_mixers = [];
  uavs = [];
  users = [];
  

  constructor(dom,t_cfg,t_data,progress) {
    // 创建渲染器
    let renderer = new WebGLRenderer({
      antialias: true,  // 开启抗锯齿
    })
    dom.appendChild(renderer.domElement)  // 将渲染器挂载到dom
    renderer.setSize(dom.offsetWidth, dom.offsetHeight, true)
    let scene = new Scene()  // 实例化场景
    // scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8cc7de);
	// 实例化相机
    let camera = new PerspectiveCamera(45, dom.offsetWidth / dom.offsetHeight, 1, 1000)  	   
    camera.position.set(150, 150, 150) // 设置相机位置
    camera.lookAt(new Vector3(0, 0, 0))  // 设置相机看先中心点
    camera.up = new Vector3(0, 1, 0)  // 设置相机自身方向

    const clock = new THREE.Clock();
    this.dom = dom
    this.scene = scene
    renderer.render(scene, camera)  // 渲染器渲染场景和相机
    this.scene = scene
    // renderer.setClearColor('rgb(247, 217, 170)')  // 设置渲染器的颜色
    // scene.background = new THREE.Color(0x000000);



    //路面
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xa9a9a9, // 材质的颜色
    });
    const floorGeometry = new THREE.BoxGeometry(1000, 1000, 0.1, 1, 1, 1);
    const floorMesh = new THREE.Mesh(floorGeometry, floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2.0;
    scene.add(floorMesh);

    // var airplane = new MyObject.AirPlane();
    // airplane.scale.set(.25,.25,.25);
    // airplane.position.y = 50;
    // scene.add(airplane);


    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load('public\\resource\\Robot3_lambert2SG_Diffuse.png');// 加载手机mesh另一个颜色贴图
    texture.encoding = THREE.sRGBEncoding; //和渲染器.outputEncoding一样值
    this.initUAVUser(t_cfg,t_data)


    // let orbitControls = new OrbitControls(camera, renderer.domElement)//轨道控制器
    let orbitControls = new OrbitControls(camera, renderer.domElement)
    orbitControls.mouseButtons = {  // 设置鼠标功能键（轨道控制器）
      LEFT: null,  // 左键无功能
      MIDDLE: MOUSE.DOLLY,  // 中键缩放
      RIGHT: MOUSE.ROTATE   // 右键旋转
    } 

    progress.digit = 0
    progress.down = t_data.length
    dom.addEventListener('click', () => {
      // 播放动画
      // mixer.clipAction(animation).play();
      // 更新每个无人机的位置

      t_data.forEach((data,i)=>{
        setTimeout(()=> {
          this.uavs.forEach((uav,n) => {
            let next_position = [];
            next_position.push(data.state.uav_position[3*n])
            next_position.push(data.state.uav_position[3*n+1])
            next_position.push(data.state.uav_position[3*n+2])
    
            this.updateEntityPosition(uav, next_position, 1, 2000);
          });
  
          this.users.forEach((user,k) => {
            let next_position = [];
            next_position.push(data.state.user_position[k*2])
            next_position.push(data.state.user_position[k*2+1])
            next_position.push(0)
    
            this.updateEntityPosition(user, next_position, 1, 2000);
          });
          progress.up = i+1
          progress.digit=(progress.up/progress.down)*100
        }, 5000 * i);

      })

    });


    // 逐帧渲染threejs
    let animate = () => {
      const delta = clock.getDelta();
      requestAnimationFrame(animate);

      for ( const mixer of this.uav_mixers ) mixer.update( delta );
      for ( const mixer of this.user_mixers ) mixer.update( delta );

      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.render(scene, camera)  // 渲染器渲染场景和相机
      TWEEN.update();



    }
    animate()
    
  }

  

  initUAVUser(t_cfg,t_data){
    const loader = new GLTFLoader();

    var uav_num = t_cfg.num_uavs;
    var user_num = t_cfg.num_users;
    var uav_scale = 0.25;
    var uav_y_pos = 50;
    let promises = [];

    for (let i = 0; i < uav_num; i++) {
      let promise = new Promise((resolve, reject) => {
        loader.load('public/resource/uav_fly.glb', (gltf)=> {
          var mesh = gltf.scene.getObjectByName('uav');
          let mixer = new THREE.AnimationMixer( mesh );
  
          let action = mixer.clipAction(gltf.animations[1]);
          action.play();
          this.uav_mixers.push(mixer)
  
          mesh.scale.set(uav_scale, uav_scale, uav_scale);
          mesh.position.x = t_data[0].state.uav_position[i * 3];
  
          mesh.position.y = t_data[0].state.uav_position[i * 3+2];
          mesh.position.z = t_data[0].state.uav_position[i * 3 + 1];
          this.uavs.push(mesh)
  
          this.scene.add(mesh);
  
          resolve();
        }, undefined, function(error) {
          console.error(error);
        });
      });
  
      promises.push(promise);
    }
    Promise.all(promises).then(() => {
      console.log('All UAVs loaded!');
    });
  
    let promise = Promise.resolve();

    for (let i = 0; i < user_num; i++) {
      promise = promise.then(() => {
        return new Promise((resolve, reject) => {
          loader.load('public/resource/robot3.gltf', (gltf)=> {
            var mesh = gltf.scene.getObjectByName('robot');
            let mixer = new THREE.AnimationMixer( mesh );
    
            let action = mixer.clipAction(gltf.animations[0]);
            action.play();
            this.user_mixers.push(mixer)
    
            mesh.position.x = t_data[0].state.user_position[i * 2];
            mesh.position.y = 0;
            mesh.position.z = t_data[0].state.user_position[i * 2 + 1];
            this.users.push(mesh)
            this.scene.add(mesh);
    
            resolve();
          }, undefined, function(error) {
            console.error(error);
          });
        });
      });
    }
  }



  updateEntityPosition(entity, next_position, timeStep, duration) {
    // const nextPosition = uav_position.shift(); // 获取下一个位置并从数组中删除
  
    const startPosition = entity.position.clone(); // 复制当前位置
    const endPosition = new THREE.Vector3(next_position[0], next_position[2], next_position[1]); // 将下一个位置转换为THREE.Vector3对象
  
    // 创建Tween动画
    new TWEEN.Tween(startPosition)
      .to(endPosition, duration)
      .onUpdate(() => {
        // 更新无人机的位置
        entity.position.copy(startPosition);
      })
      .start();
  
    // // 将下一个位置重新插入到数组末尾，以便在下一次更新时使用
    // uav_position.push(nextPosition);
  }
  


    /**
   * 向场景中添加模型
   * @param  {...any} object 模型列表
   */
    addObject(...object) {
      object.forEach(elem => {
        this.scene.add(elem)  // 场景添加模型
      })
    }


}


