<template>
  <view class="success-page">
    <view class="foot-box">
      <navigator open-type="switchTab" url="/pages/index/index">
        <image
          class="success_btn"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/success/success_btn.png"
        />
      </navigator>
    </view>
  </view>
</template>

<script>
export default {
  name: 'successPage',

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },
};
</script>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

.success-page {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/success/success_bg.png') left
    top/100% auto no-repeat;
}

.foot-box {
  position: absolute;
  left: 50%;
  top: 1050rpx;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
}

.success_btn {
  width: 420rpx;
}
</style>
