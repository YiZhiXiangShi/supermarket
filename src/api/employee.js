import request from '@/utils/request'

const api_name = '/employee'

export default {
    // 分页查询员工列表
    search(searchMap) {
        return request({
            url: `${api_name}/page`,
            method: 'post',
            data: searchMap
        })
    },
    
    // 添加员工
    save(pojo) {
        return request({
            url: `${api_name}/add`,
            method: 'post',
            data: pojo
        })
    },
    
    // 更新员工信息
    update(pojo) {
        return request({
            url: `${api_name}/update`,
            method: 'put',
            data: pojo
        })
    },
    
    // 根据员工号查询员工
    find(id) {
        return request({
            url: `${api_name}/${id}`,
            method: 'get'
        })
    },
    
    // 删除员工
    delete(id) {
        return request({
            url: `${api_name}/${id}`,
            method: 'delete'
        })
    },
    
    // 根据身份证号查询员工
    findByIdCard(idCardNo) {
        return request({
            url: `${api_name}/idCard/${idCardNo}`,
            method: 'get'
        })
    },
    
    // 根据RFID卡号查询员工
    findByRfid(rfidCardNo) {
        return request({
            url: `${api_name}/rfid/${rfidCardNo}`,
            method: 'get'
        })
    }
}