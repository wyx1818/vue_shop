<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- /.面包屑导航区 -->

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 工具栏区域 -->
      <el-row>
        <el-col :span="8">
          <!-- 搜索栏 -->
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-row>
        <el-table :data="orderList" border stripe>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="订单编号" prop="order_number"></el-table-column>
          <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
          <el-table-column label="是否付款" width="80px">
            <template slot-scope="scope">
              <el-tag type="success" v-if="!scope.row.order_pay" size="mini">已付款</el-tag>
              <el-tag type="danger" v-else size="mini">未付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
          <el-table-column label="下单时间" width="130px">
            <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
          </el-table-column>
          <el-table-column label="操作" width="120px">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </el-table-column>
        </el-table>
      </el-row>
      <!-- /.表格区域 -->

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="orderTotal"
      ></el-pagination>
      <!-- /.分页区域 -->
    </el-card>
    <!-- /.卡片视图区域 -->

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- /.修改地址对话框 -->

    <!-- 展示物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data () {
    return {
      // 请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单数据列表
      orderList: [],
      // 订单总数
      orderTotal: 0,

      // 控制修改地址对话框显示与隐藏
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址表单校验规则
      addressFormRules: {
        address1: [
          { type: 'array', required: true, message: '请选择省市区/县', trigger: 'change' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
          { min: 2, message: '请输入至少2个字符', trigger: 'blur' }
        ]
      },
      cityData,

      // 控制物流进度对话框的显隐
      progressDialogVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList () {
      // 发起数据请求
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })

      // 判断相应结果
      if (res.meta.status !== 200) return this.$message.error('获取订单数据失败：' + res.meta.msg)

      // 保存订单数据
      this.orderList = res.data.goods
      this.orderTotal = res.data.total
    },
    // 监听每页显示数变化事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听当前页码改变事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示修改地址的对话框
    showBox () {
      this.addressVisible = true
    },
    // 监听修改地址对话框关闭事件
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 展示修改
    async showProgressBox () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')

      if (res.meta.status !== 200) return this.$message.error('获取物流进度失败：' + res.meta.msg)

      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
