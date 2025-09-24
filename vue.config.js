// Moved to frontend/
module.exports = {
  publicPath: '/', // Set for local development
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
};
