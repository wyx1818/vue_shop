<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- /.面包屑导航区 -->

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告线区域 -->
      <el-alert :closable="false" show-icon title="注意，只允许为第三级分类设置相关参数" type="warning"></el-alert>

      <!-- 卡片工具栏 -->
      <el-row class="cat-opt">
        <!-- 选择商品分类区域 -->
        <el-col>
          <span>商品分类：</span>
          <!-- 商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cascadeProps"
            @change="handleChange"
            style="width:250px"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- /.Tab页面区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="idBtnDisable"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  @close="handleClose(i,scope.row)"
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  clearable
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作" width="180px">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- /.添加动态参数的面板 -->

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="idBtnDisable"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  @close="handleClose(i,scope.row)"
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  clearable
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作" width="180px">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- /.Tab页面区域 -->

      <!-- 添加参数对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClose"
      >
        <!-- 对话框主要内容区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑参数对话框 -->
      <el-dialog
        :title="'编辑' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <!-- 对话框主要内容区域 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
    <!-- /.卡片视图区域 -->
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框配置
      cascadeProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 级联选择框选择的对象数组
      selectedCateKeys: [],

      // 标签页
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],

      // * 添加对话框
      // 控制添加对话框的显示隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的表单校验规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },

      // * 编辑对话框
      // 控制编辑对话框的显示隐藏
      editDialogVisible: false,
      // 编辑参数的表单数据对象
      editForm: {
      },
      // 编辑参数的表单校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取父级分类的数据列表
    async getCateList () {
      // 发送数据请求
      const { data: res } = await this.$http.get('categories')

      // 判断请求结果
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败：' + res.meta.msg)

      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 监听级联选择框变化
    async handleChange () {
      if (this.selectedCateKeys.length !== 3) {
        // 清楚冗余数据
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.error('只允许选择三级分类')
      }
      this.getParamsData()
    },

    // 监听Tab页签切换
    handleTabClick () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return this.$message.info('请先选择三级分类')
      }
      this.getParamsData()
      // console.log(this.activeName)
    },

    // 获取面板数据
    async getParamsData () {
      // 根据所选分类的ID，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })

      // 判断请求情况
      if (res.meta.status !== 200) return this.$message.error('面板数据请求失败：' + res.meta.msg)

      // 拆分特点
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })

      // 根据不同表格保存数据
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },

    // * 添加参数
    // 监听添加参数对话框关闭事件，重置表单
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams () {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        // 发起添加请求
        if (!valid) return null
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        // 判断请求状态
        if (res.meta.status !== 201) return this.$message.error('添加参数失败：' + res.meta.msg)

        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },

    // * 编辑参数
    // 编辑参数对话框
    async showEditDialog (attrId) {
      // 发送查询请求，以便渲染编辑框默认数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`)

      if (res.meta.status !== 200) return this.$message.error('请求参数失败：' + res.meta.msg)

      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听编辑参数对话框关闭事件，重置表单
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击编辑对话框确定按钮，发送修改请求
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return null

        // 发送修改请求
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 200) return this.$message.error('修改参数失败：' + res.meta.msg)

        this.getParamsData()
        this.editDialogVisible = false
      })
    },

    // 根据ID删除参数
    async removeParams (attrId) {
      // 提醒用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)

      // 用户却删除，confirmResult 返回值为 confirm
      if (confirmResult !== 'confirm') return this.$message.info('操作已取消')

      // 发送删除请求
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)

      // 判断请求结果
      if (res.meta.status !== 200) return this.$message.error('删除参数失败：' + res.meta.msg)

      this.$message.success('删除参数成功')
      this.getParamsData()
    },

    // * Tag
    // Tag文本框失去焦点，或摁下了Enter
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return null
      }

      // 用户输入了有效的内容
      row.inputValue = row.inputValue.trim()
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 点击按钮展示文本框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染后，才会执行回调函数的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 修改属性
    async saveAttrVals (row) {
      // 发起请求，保存数据
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })

      if (res.meta.status !== 200) {
        row.inputValue.pop()
        return this.$message.error('修改属性失败：' + res.meta.msg)
      }
      this.$message.success('修改参数项成功！')
    },
    // 删除对应的参数可选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    idBtnDisable () {
      return this.selectedCateKeys.length !== 3
    },
    // 当前选择的三级分类ID
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }

}
</script>

<style lang="less" scoped>
.cat-opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 100px;
}
</style>
