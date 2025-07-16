import request from '@/utils/request'

const api_name='/role'

export default{

    search(searchMap){
        return request({
            url:`${api_name}/list`,
            method:'post',
            data:searchMap
        })
    },
    save(pojo){
        return request({
            url:`${api_name}/add`,
            method:'post',
            data:pojo
        }) 
    },
    update(pojo){
        return request({
            url:`${api_name}/update`,
            method:'post',
            data:pojo
        }) 
    },
    find(id){
        return request({
            url:`${api_name}/find?id=`+id,
            method:'get'
        }) 
    },
    findAll(){
        return request({
            url:`${api_name}/findAll`,
            method:'get'
        }) 
    },
    delete(id){
        return request({
            url:`${api_name}/delete?id=`+id,
            method:'get'
        }) 
    }

}