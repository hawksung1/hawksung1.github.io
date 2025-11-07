const { defineConfig } = require('@vue/cli-service')
const os = require('os')

module.exports = defineConfig({
  transpileDependencies: [],
  productionSourceMap: false,
  parallel: os.cpus().length > 1,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/'  // 사용자 페이지 (username.github.io)는 루트 경로 사용
    : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  configureWebpack: {
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    }
  },
  devServer: {
    hot: true,
    liveReload: true,
    watchFiles: [
      'src/**/*',
      'public/**/*',
      '*.js',
      '*.json'
    ],
    open: false,
    port: 8080
  },
  chainWebpack: config => {
    // 파일 변경 감지 개선
    config.watchOptions({
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/
    })
  }
})

