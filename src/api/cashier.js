import request from '@/utils/request'

const api_name='/cashier'

export default{
 
    find(barCode){
        return request({
            url:`${api_name}/find?barCode=`+barCode,
            method:'get'
        }) 
    },
    findAll(){
        return request({
            url:`${api_name}/findAll`,
            method:'get'
        }) 
    },
  

}