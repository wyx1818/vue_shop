module.exports = {
  chainWebpack: config => {
    config.when(process.env.NODE_ENV === 'production', config => {
      // 修改生产环境入口文件
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')

      // 通过 externals 加载外部 CDN 资源
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      // 定制首页内容
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    config.when(process.env.NODE_ENV === 'development', config => {
      // 修改开发环境入口文件
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')

      // 定制首页内容
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
