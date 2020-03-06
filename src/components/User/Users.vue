<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 工具栏，搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select"
          clearable @clear="getUserList">
            <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisivle=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" width="70px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"
            active-color="#13ce66" inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip class="item" effect="dark" content="修改信息" placement="top" :enterable="false" :open-delay="500">
              <el-button @click="editDialog(scope.row.id)" type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip class="item" effect="dark" content="删除用户" placement="top" :enterable="false"  :open-delay="500">
              <el-button @click="removeUserById(scope.row.id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false"  :open-delay="500">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisivle"
      @close="addDialogClose"
      width="50%">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisivle = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑用户"
      :visible.sync="editDialogVisble"
      @close="editDialogClose"
      width="50%">
      <!-- 内容主体区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" ></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile" ></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      @close="setRoleDialogClose"
      width="50%">
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义校验规则
    // 校验邮箱规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      } else {
        callback(new Error('请输入合法的邮箱'))
      }
    }
    // 校验手机规则
    var chenckMoblie = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|199|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        // 合法的手机号
        return callback()
      } else {
        callback(new Error('请输入合法的手机号'))
      }
    }
    return {
      // 用户列表数据请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 用户列表
      userlist: [],
      // 用户个数
      total: 0,

      // 隐藏添加对话框
      addDialogVisivle: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: chenckMoblie, trigger: 'blur' }
        ]
      },

      // 编辑用户对话框
      editDialogVisble: false,
      // 查询到的用户信息对象
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: chenckMoblie, trigger: 'blur' }
        ]
      },

      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色信息
      rolesList: [],
      // 已选中的ID值
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 请求用户列表数据
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    // 监听 每页个数 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听页面状态变更
    async userStateChange (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('用户状态修改失败')
      }
      this.$message.success('用户状态更新成功')
    },

    // 监听添加用户对话框关闭事件，重置表单
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮添加用户
    addUser () {
      // 预检验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return null
        // 校验成功，可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        // 修改失败
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
          return null
        }
        // 修改成功
        this.$message.success('添加用户成功！')
        // 隐藏添加用户对话框
        this.addDialogVisivle = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },

    // 编辑用户
    async editDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.editDialogVisble = true
    },
    // 监听编辑用户对话框关闭事件，重置表单
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定提交修改用户申请
    editUser () {
      // 预校验表单
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return null
        // 预校验成功，发送编辑信息网络请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })

        // 修改失败
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
          return null
        }
        // 修改成功
        this.$message.success('修改用户信息成功')
        // 隐藏对话框
        this.editDialogVisble = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 根据id删除对应的用户信息
    async removeUserById (id) {
      // 弹窗询问是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 用户确认删除，返回值为字符串confirm
      if (confirmResult !== 'confirm') { // 字符串需要加引号！！！
        return this.$message.info('已取消删除')
      }
      // 确认删除，发送删除请求
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 删除成功，提醒用户
      this.$message.success('删除用户成功')
      // 重新获取用户列表数据
      this.getUserList()
    },

    // 分配角色的对话框
    async setRole (userInfo) {
      // 保存当前用户的信息
      this.userInfo = userInfo

      // 在展示对话框前，获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      // 获取失败，提示用户
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败：' + res.meta.msg)
      // 获取成功，保存角色列表数据
      this.rolesList = res.data

      // 展示对话框
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo () {
      // 判断是否选择了角色
      if (!this.selectedRoleId) return this.$message.error('请选择要分配的角色')

      // 发送请求
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })

      // 请求失败，提示用户
      if (res.meta.status !== 200) return this.$message.error('分配角色列表失败：' + res.meta.msg)

      // 分配成功
      this.$message.success('分配角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色关闭的事件
    setRoleDialogClose () {
      this.selectedRoleId = ''
      this.userInfo = ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>
