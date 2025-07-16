<template>

    <div>

    <!--条件查询表单-->
    <el-form :inline="true">
            <el-form-item label="角色编号">
              <el-input v-model="searchMap.number" placeholder="">
              </el-input>
            </el-form-item>
              <el-form-item label="角色名称">
              <el-input v-model="searchMap.name" placeholder="">
              </el-input>
            </el-form-item>
      <el-button type="primary" @click="fetchData()">查询</el-button>
      <el-button type="primary" @click="handleEdit('')">新增</el-button>
    </el-form>

  
    <!--表格组件-->
     <el-table
        :data="list"
        style="width: 100%">
       <!--prop 后端返回的json数据的字段名-->
      <el-table-column prop="id" label="序号" ></el-table-column>
      <el-table-column prop="number" label="角色编号" ></el-table-column>
      <el-table-column prop="name" label="角色名称" ></el-table-column>
      <el-table-column prop="description" label="角色描述" ></el-table-column>
      <el-table-column prop="created" :formatter="dateFormat" label="创建时间" ></el-table-column>
  
      <el-table-column
        fixed="right"   
        label="操作"
      width="100">
      <template slot-scope="scope">
        <el-button @click="handleEdit(scope.row.id)" type="text" size="small">修改</el-button>
        <el-button @click="handleDelete(scope.row.id)" type="text" size="small">删除</el-button>
      </template>
      </el-table-column>
     </el-table>

       <!--分页-->
      <el-pagination
        @size-change="sizeData"
        @current-change="pageData"
        :page-sizes="[5,10,20,30,60]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="count">
      </el-pagination>


        <el-dialog title="编辑" :visible.sync="dialogFormVisible">
          <el-form label-width="80px">

            <el-form-item label="角色名称"><el-input v-model="pojo.name" /></el-form-item>
            <el-form-item label="角色编号"><el-input v-model="pojo.number" /></el-form-item>
            <el-form-item label="角色描述"><el-input v-model="pojo.description" /></el-form-item>
            <el-button type="primary" @click="handleSave()">保存</el-button>
            <el-button @click="dialogFormVisible = false">关闭</el-button>
          </el-form>
        </el-dialog>


    </div>
  
  </template>
  <script>


    import roleApi from '@/api/role'

    
   //导入日期组件
   import moment from 'moment'

     export default {
      data() {
        return {
          //页面数据
          list:[],
          searchMap:{
            page:1,
            limit:5
          },
          pojo:{

          },
          count:0,
          dialogFormVisible:false,
          id:''
        }
      },
      created(){
        //在创建vue实例后触发钩子函数
        this.fetchData()

      },
      methods:{
        fetchData(){
          //发起axios请求，获取后端的数据

         roleApi.search(this.searchMap).then(response =>{

            this.list=response.data
            this.count=response.count

         })
      },
      sizeData(size){
          this.searchMap.limit=size
          this.fetchData()
      },
      pageData(page){
          this.searchMap.page=page
          this.fetchData()
      },
      //新增和修改使用同一个函数打开弹窗，区别是新增没有id
      handleEdit(id){
            
            this.id=id

            //打开弹窗
            this.dialogFormVisible=true

            if(this.id!==''){
               
               //根据id查询数据绑定到模型上面
               roleApi.find(this.id).then(response=>{

                 this.pojo=response.data

               })

            }else{
              this.pojo={}//清除数据
            }


      },
      handleSave(){
         
         if(this.id===null||this.id===''){

            //新增操作
            roleApi.save(this.pojo).then(response=>{

             this.$message({
                message: response.msg,
                type: 'success'
             });

            //重新加载列表页面
            this.fetchData()

            //关闭弹窗
            this.dialogFormVisible=false

            })

         }else{


            //新增操作
            roleApi.update(this.pojo).then(response=>{

             this.$message({
                message: response.msg,
                type: 'success'
             });

            //重新加载列表页面
            this.fetchData()

            //关闭弹窗
            this.dialogFormVisible=false

            })

         }

      },
      handleDelete(id){


       this.$confirm('此操作将永久删除该科室, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          
          roleApi.delete(id).then(response=>{

                  this.$message({
                        type: 'success',
                        message: '删除成功!'
                  });

                  this.fetchData()
          })
          

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      



      },
      //增加格式化日期的方法
          dateFormat(row,column){

            let data=row[column.property]
            if(data == undefined){
              return ''
            }
            return moment(data).format('YYYY-MM-DD hh:mm:ss')
          }
     }

     }

  </script>