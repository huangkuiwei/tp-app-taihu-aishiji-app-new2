<template>
  <web-view :src="src"></web-view>
</template>

<script>
export default {
  name: 'webview',

  data() {
    return {
      src: '',
    };
  },

  onLoad(options) {
    this.src = options.src && decodeURIComponent(options.src);
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },
};
</script>

<style lang="scss"></style>
