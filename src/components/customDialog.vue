<template>
  <uni-popup ref="popupRef" :is-mask-click="false">
    <view class="custom-dialog">
      <view class="title">
        <text>{{ title }}</text>
        <text class="line"></text>
      </view>

      <view class="content-box">
        <slot></slot>
      </view>

      <slot name="footer"></slot>
    </view>

    <view class="close" v-show="shopClose">
      <uni-icons color="#ffffff" type="close" size="30" @click="close"></uni-icons>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'ruleDialog',

  props: {
    title: {
      type: String,
      default: '',
    },

    shopClose: {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    open() {
      this.$refs.popupRef.open();
    },

    close() {
      this.$refs.popupRef.close();
    },
  },
};
</script>

<style scoped lang="scss">
.custom-dialog {
  width: 690rpx;
  background: #ffffff;
  border-radius: 50rpx;
  padding: 38rpx 44rpx;

  .title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 50rpx;

    text {
      &:nth-child(1) {
        font-weight: bold;
        font-size: 32rpx;
        color: #1a1a1a;
        margin-bottom: 12rpx;
      }

      &:nth-child(2) {
        width: 120rpx;
        height: 6rpx;
        background: #0abf92;
        border-radius: 5rpx;
      }
    }
  }

  .content-box {
    max-height: 50vh;
    overflow: auto;
  }
}

.close {
  text-align: center;
  padding-top: 28rpx;
}
</style>
