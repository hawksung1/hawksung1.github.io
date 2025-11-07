const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/hawksung1.github.io/'
    : '/',
  outputDir: 'dist',
  assetsDir: 'static'
})

