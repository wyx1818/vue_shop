<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-table :data="rightsList" border stripe height="800px">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="权限路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    // 获取所有权限
    this.getRightsList()
  },
  methods: {
    // 获取权限列表
    async getRightsList () {
      // 发送获取请求
      const { data: res } = await this.$http.get('rights/list')
      // 请求失败，提示错误信息
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 请求成功，存储数据信息
      this.rightsList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
</style>
