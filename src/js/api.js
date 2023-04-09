import request from './request'

export function getTrainingDataList(page, per_page) {
    return request({
      url: '/trainingdata/list',
      method: 'get',
      params: {
        page: page,
        per_page: per_page
      }
    })
  }

export function getTrainingDataById(id) {
return request({
    url: `/trainingdata/${id}`,
    method: 'get'
})
}

export function deleteTrainingData(id) {
    return request({
      url: '/delete_training_data',
      method: 'get',
      params: {
        id: id
      }
    })
  }