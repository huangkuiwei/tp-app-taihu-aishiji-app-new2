<template>
  <view class="logout-page">
    <view class="page-title">
      <text>注销账户</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="tip">
      *账户注销后，您将无法正常登录慧食搭子，并清空当前账号的所有数据，对应相关权益将同时全部作废
    </view>

    <view class="container">
      <view class="title">请完成以下验证</view>
      <view class="sub-title" v-if="userInfo.phone">
        请输入{{ userInfo.phone.slice(0, 3) }}****{{ userInfo.phone.slice(-4) }}收到的短信验证码
      </view>

      <view class="input-box">
        <text class="label">短信验证码</text>
        <input
          type="number"
          :maxlength="6"
          placeholder="请输入验证码"
          :value="sms_code"
          @input="sms_code = $event.detail.value"
        />
        <text class="get-code" @click="sendCode">{{ codeTip }}</text>
      </view>
    </view>

    <view class="btn">
      <view class="btn1" @click="$toBack">我再想想</view>
      <view class="btn2" @click="submit">确认注销</view>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex';
import $http from '@/utils/http';

export default {
  name: 'logout',

  data() {
    return {
      sms_code: '',
      sms_sign: '',
      countdown: 0,
    };
  },

  computed: {
    ...mapState('app', ['userInfo']),

    disabled() {
      return !!this.countdown;
    },

    codeTip() {
      if (this.countdown) {
        return `${this.countdown}S重新获取`;
      } else {
        return '获取验证码';
      }
    },
  },

  watch: {
    countdown(value) {
      setTimeout(() => {
        if (value > 0) {
          let countdown = this.countdown - 1;

          if (countdown < 0) {
            this.countdown = 0;
          } else {
            this.countdown--;
          }
        }
      }, 1000);
    },
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    sendCode() {
      if (this.disabled) return;

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/global/sms/send_code', {
          mobile: this.userInfo.phone,
        })
        .then((res) => {
          uni.hideLoading();

          this.sms_sign = res.data.sign;
          this.countdown = 60;
        });
    },

    submit() {
      if (!this.sms_code) {
        uni.showToast({
          title: '验证码错误',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/user/auth/userauth/delete_account', {
          sms_sign: this.sms_sign,
          sms_code: this.sms_code,
        })
        .then(() => {
          uni.hideLoading();

          uni.showToast({
            title: '注销成功',
            icon: 'none',
            mask: true,
          });

          setTimeout(() => {
            this.$toReLaunch('/pages/index/index');
          }, 1000);
        });
    },
  },
};
</script>

<style scoped lang="scss">
.logout-page {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
  }

  .tip {
    background: #faeee5;
    padding: 26rpx 36rpx;
    font-size: 26rpx;
    color: #ffaa00;
    line-height: 42rpx;
    margin-bottom: 52rpx;
  }

  .container {
    padding: 0 32rpx;

    .title {
      font-weight: 500;
      font-size: 32rpx;
      color: #111111;
      margin-bottom: 25rpx;
    }

    .sub-title {
      font-size: 22rpx;
      color: #999999;
      margin-bottom: 88rpx;
    }

    .input-box {
      border-bottom: 2rpx solid #d9d9d9;
      padding: 0 20rpx 18rpx;
      display: flex;
      align-items: center;

      .label {
        flex-shrink: 0;
        font-weight: 500;
        font-size: 28rpx;
        color: #111111;
        margin-right: 47rpx;
      }

      input {
        flex-grow: 1;
        font-size: 22rpx;
      }

      .get-code {
        flex-shrink: 0;
        font-size: 24rpx;
        color: #0abf92;
      }
    }
  }

  .btn {
    position: fixed;
    left: 30rpx;
    right: 30rpx;
    bottom: 100rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    view {
      height: 103rpx;
      border-radius: 20rpx;
      font-weight: 500;
      font-size: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.btn1 {
        width: 100%;
        background: #0abf92;
        color: #ffffff;
      }

      &.btn2 {
        width: 100%;
        background: #ffffff;
        color: #0abf92;
        border: 2rpx solid #0abf92;
      }
    }
  }
}
</style>
