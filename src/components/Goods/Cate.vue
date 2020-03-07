<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- /.面包屑导航区 -->

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 卡片工具栏 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- /.卡片工具栏 -->

      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        border
        show-index
        index-text="#"
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot="isOK" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" size="mini">编辑</el-button>
          <el-button type="danger" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- /.表格 -->

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- /.分页区域 -->
    </el-card>
    <!-- /.卡片视图区域 -->

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClose"
      width="50%"
    >
      <!-- 对话框内容主体区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
        ref="addCateFormRef"
      >
        <el-form-item label="分类名称：" prop="cat_name" ref="addCateNameFormRef">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascadeProps"
            @change="parentCateChange"
            class="el-cascade"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 对话框页脚 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- /.添加分类对话框 -->
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 树形表格定义列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOK'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],

      // * 添加分类对话框
      // 控制添加对话框的显示与隐藏
      addCateDialogVisible: false,
      // 父级分类的列表
      parentCateList: [],
      // 添加分类的表单对象
      addCateForm: {
        cat_name: '', // 添加分类的名称
        cat_pid: 0, // 分类父 ID
        cat_level: 0 // 分类的等级，默认添加一级分类
      },
      // 添加分类表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 指定级联选择器的配置对象
      cascadeProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        checkStrictly: true
      },
      // 选中的父级分类ID数组
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      // 发送获取数据请求
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })

      // 处理请求结果
      if (res.meta.status !== 200) return this.$message.error('获取列表数据失败：' + res.meta.msg)

      // 把数值列表赋值给cateList
      this.cateList = res.data.result
      // 保存总数据条数
      this.total = res.data.total
    },

    // * 添加分类对话框
    // 显示添加分类对话框
    showAddCateDialog () {
      // 获取父级分类数据
      this.getParentCateList()

      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      // 发送数据请求
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })

      // 判断请求结果
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败：' + res.meta.msg)

      this.parentCateList = res.data
    },
    // 监听选择项变化
    parentCateChange () {
      console.log(this.selectedKeys)
      // 如果selectedKeys数组中的length大于0，证明选中的父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的ID
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return null
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 监听关闭对话框事件，重置对话框
    addCateDialogClose () {
      // 重置表单
      this.$refs.addCateNameFormRef.resetField()
      // 重置选择状态
      this.selectedKeys = []
      // 重置级联选择器修改的addForm
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击按钮，添加新的分类
    addCate () {
      // 预验证
      this.$refs.addCateFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return null

        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) return this.$message.error('添加分类失败：' + res.meta.msg)

        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
      console.log(this.addCateForm)
    },

    // * 分页处理
    // 监听每页条数改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听当前页改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascade {
  width: 100%;
}
</style>
