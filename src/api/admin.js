import request from '@/utils/request'

export default {
  getList(searchMap) {
    return request({
      url: '/admin/list',
      method: 'post',
      data: searchMap
    })
  },
  update(pojo) {
    return request({
      url: '/admin/update',
      method: 'post',
      data: pojo
    })
  },
  add(pojo) {
    return request({
      url: '/admin/add',
      method: 'post',
      data: pojo
    })
  },
  delete(id) {
    return request({
      url: '/admin/delete?id=' + id,
      method: 'get'
    })
  }
}
