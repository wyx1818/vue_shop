<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- /.面包屑导航区 -->

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <!-- 步骤条区 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateCascadeProps"
                @change="handleChange"
                style="width: 250px;"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="valName" v-for="(valName,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- /.卡片视图区域 -->

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="60%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      // 步骤条索引
      activeIndex: '0',
      // 添加商品的表单
      addForm: {
        goods_name: '',
        goods_cat: [],
        goods_price: 0,
        goods_number: 1,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        // 提价表单的商品参数
        attrs: []
      },

      // 添加商品校验规则
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }
        ]
      },
      // 商品分类数据列表
      cateList: [],
      // 级联选择器配置选项
      cateCascadeProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片地址
      previewPath: '',
      // 控制预览图片对话框显示与隐藏
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList () {
      // 发起获取请求
      const { data: res } = await this.$http.get('categories')

      // 判断请求结果
      if (res.meta.status !== 200) return this.$message.error('请求商品列表失败：' + res.meta.msg)

      this.cateList = res.data
    },
    // 监听商品分类级联选择器
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return this.$message.warning('只允许选择三级分类')
      }
    },
    // 标签页切换
    beforeTabLeave (activeName, oldActiveName) {
      // console.log('即将离开的标签页：' + oldActiveName + '，将要切换的标签页：' + activeName)
      // return false
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('前先选择三级分类')
        return false
      }
    },
    // 请求参数
    async tabClicked () {
      // 请求动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: 'many' } })

        if (res.meta.status !== 200) return this.$message.error('请求动态参数失败：' + res.meta.msg)

        this.manyTableData = res.data
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: 'only' } })

        if (res.meta.status !== 200) return this.$message.error('请求动态参数失败：' + res.meta.msg)

        this.onlyTableData = res.data
      }
    },
    // 监听图片上传成功的事件
    handleSuccess (response) {
      // 1.拼接得到一个图片对象
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },
    // 处理图片预览事件
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片事件
    handleRemove (file) {
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.tmp_path
      // 2.从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3.调用数组的splice方法，把图片信息对象从pics移除
      this.addForm.pics.splice(i, 1)
    },
    addGood () {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写必要的表单项！')

        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals.join(',')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })

        // 执行添加业务的逻辑
        // lodash cloneDeep(obj) 深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form)

        if (res.meta.status !== 201) return this.$message.error('请求动态参数失败：' + res.meta.msg)

        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取三级分类的ID
    cateID () {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    }
  }

}
</script>

<style lang="less" scoped>
.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>
