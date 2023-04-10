import { AmbientLight, PointLight } from "three"


/**
 * 光线
 */
export const allLights = []

// 添加环境光（自然光），设置自然光的颜色，设置自然光的强度（0 最暗， 1 最强）
export const ambientLight = new AmbientLight('rgb(255,255,255)', 0.8)

allLights.push(ambientLight)

// 点光源
export const pointLight = new PointLight(
    'rgb(255,255,255)',
    0.5,
    600,
    0.2
  )
  pointLight.position.set(500, 100, 500)  // 设置点光源位置 (x,y,z)
  pointLight.castShadow = true;

  allLights.push(pointLight)  // 将点光源添加到光源列表抛出
  