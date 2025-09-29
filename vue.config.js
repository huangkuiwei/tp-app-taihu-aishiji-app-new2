module.exports = {
  transpileDependencies: ['@dcloudio/uni-ui'],

  devServer: {
    proxy: {
      '/api': {
        target: 'https://tool.laketay.com',
        changeOrigin: true,
      },
    },
    port: 8090,
  },
};
