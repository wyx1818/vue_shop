<template>
  <div>
    我是首页
    <br />
    <el-button type="info" size="small" @click="logout">注销</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout () {
      // 清空token
      window.sessionStorage.clear()
      // 跳转回登录页面
      this.$message.success('注销成功')
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
