const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/'  // 사용자 페이지 (username.github.io)는 루트 경로 사용
    : '/',
  outputDir: 'dist',
  assetsDir: 'static',
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
    port: 8080,
    watchOptions: {
      poll: 1000, // 1초마다 파일 변경 확인 (WSL 환경에서 유용)
      aggregateTimeout: 300, // 파일 변경 후 300ms 대기
      ignored: /node_modules/
    }
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

