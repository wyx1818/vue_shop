<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 工具栏 -->
      <el-row>
        <!-- 添加角色功能 -->
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisivle = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
          <!-- 展开行 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row :class="['bdbottom', i1 === 0 ? 'bdtop':'', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag @close="removeRightById(scope.row, item1.id)" closable>{{ item1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                  </el-col>

                <!-- 渲染二级和三级权限-->
                <el-col :span="19">
                  <!-- 通过for循环嵌套渲染二级权限 -->
                  <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success" @close="removeRightById(scope.row, item2.id)" closable>{{ item2.authName }}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 渲染三级权限 -->
                    <el-col :span="18">
                      <el-tag v-for="item3 in item2.children" :key="item3.id" @close="removeRightById(scope.row, item3.id)"
                      type="warning" closable>{{ item3.authName }}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <!-- 修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoleDialog(scope.row.id)">编辑</el-button>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
              <!-- 分配角色按钮 -->
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>

      <!-- 分配权限对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        @close="setRightDialogClose"
        width="50%">
        <!-- 树形控件 -->
        <el-tree :data="rightsList" :props="treeProps" node-key="id" :default-checked-keys="defKeys"
        show-checkbox default-expand-all ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisivle"
      @close="addRoleDialogClose"
      width="50%">
      <!-- 内容主体区 -->
      <el-form :model="addRoleForm" :rules="addFormRules" ref="addRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisivle = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisble"
      @close="editRoleDialogClose"
      width="50%">
      <!-- 内容主体区 -->
      <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // ---权限管理---
      // 所有角色信息
      rolesList: [],
      // 控制分配权限的对话框显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id数组
      defKeys: [],
      // 即将分配权限的角色ID
      roleId: '',

      // ---添加角色---
      // 控制添加角色的对话框显示与隐藏
      addRoleDialogVisivle: false,
      // 添加角色表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色校验表单
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },

      // ---编辑角色---
      // 编辑角色的ID
      editRoleId: '',
      // 编辑角色表单
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色校验表单
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 控制编辑角色的对话框显示与隐藏
      editRoleDialogVisble: false
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // ---角色权限---
    // 获取所有角色列表
    async getRolesList () {
      // 发送获取请求
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败：' + res.meta.msg)
      // 保存角色列表数据
      this.rolesList = res.data
    },
    // 通过id删除权限
    async removeRightById (role, rightId) {
      // 弹窗提醒用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 用户确认删除，返回值为字符串confirm
      if (confirmResult !== 'confirm') {
        return this.$message.info('删除操作已取消')
      }
      // 确认删除，发送删除请求
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      // 删除失败，提醒用户
      if (res.meta.status !== 200) return this.$message.error('删除权限失败：' + res.meta.msg)
      // 删除成功，提醒用户
      this.$message.success('删除权限成功')
      // 将返回的权限，重新赋予角色
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      // 请求失败提醒用户
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败：' + res.meta.msg)
      // 请求成功，把获取到的权限数据保存到 rightsList 中
      this.rightsList = res.data
      // 递归获取三级节点ID
      this.getLeafKeys(role, this.defKeys)
      // 展示权限
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defkey中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听权限分配对话框关闭事件，重置defKeys
    setRightDialogClose () {
      this.defKeys = []
    },
    // 点击确定为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(), // ...展开运算符
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 拼接节点ID
      const idStr = keys.join(',')

      // 发送处理请求
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      // 处理失败情况
      if (res.meta.status !== 200) return this.$message.error('分配权限失败：' + res.meta.msg)
      // 请求成功
      this.$message.success('分配权限成功')
      // 关闭对话框
      this.setRightDialogVisible = false
      // 刷新数据
      this.getRolesList()
    },

    // ---添加角色---
    // 发送添加角色请求
    addRole () {
      // 预校验
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return null

        // 校验成功，发送添加角色请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)

        // 判断是否添加成功
        if (res.meta.status !== 201) return this.$message.error('添加角色失败：' + res.meta.msg)
        // 添加成功
        this.$message.success('添加角色成功')
        // 隐藏对话框
        this.addRoleDialogVisivle = false
        // 重新获取角色列表
        this.getRolesList()
      })
    },
    // 监听添加角色对话框关闭事件，重置添加角色表单
    addRoleDialogClose () {
      this.$refs.addRoleFormRef.resetFields()
    },

    // 编辑角色
    // 获取编辑角色信息
    async editRoleDialog (id) {
      this.editRoleId = id
      // 通过id查询角色信息
      const { data: res } = await this.$http.get('roles/' + id)

      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败：' + res.meta.msg)

      // 渲染表单
      this.editRoleForm.roleName = res.data.roleName
      this.editRoleForm.roleDesc = res.data.roleDesc
      // 显示编辑对话框
      this.editRoleDialogVisble = true
    },
    // 发送编辑角色请求
    editRole () {
      // 预校验
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return null

        // 校验成功，发送修改角色请求
        const { data: res } = await this.$http.put(`roles/${this.editRoleId}`, this.editRoleForm)

        if (res.meta.status !== 200) return this.$message.error('编辑角色信息失败：' + res.meta.msg)

        // 编辑成功
        this.$message.success('编辑角色信息成功')
        this.getRolesList()
        this.editRoleDialogVisble = false
      })
    },
    // 监听编辑角色对话框关闭事件，重置编辑角色表单
    editRoleDialogClose () {
      this.$refs.editRoleFormRef.resetFields()
    },

    // ---删除角色---
    // 通过Id删除对应角色
    async removeRoleById (id) {
      // 弹窗询问是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 用户确认删除，confirmResult返回值为字符串confirm
      if (confirmResult !== 'confirm') { // 字符串需要加引号！！！
        return this.$message.info('已取消删除')
      }
      // 确认删除，发送删除请求
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败：' + res.meta.msg)
      // 删除成功，提醒用户
      this.$message.success('删除角色成功')
      // 重新获取角色列表
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
