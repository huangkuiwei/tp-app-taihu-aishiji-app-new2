<template>
  <view class="change-phone-page">
    <view class="page-title">
      <text></text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="container">
      <view class="step" v-if="step === 1">
        <view class="title">安全验证</view>
        <view class="sub-title">
          <view>为了保证您的账号安全，需先验证您的身份，</view>
          <view>验证成功后可进行下一步</view>
        </view>
        <view class="phone" v-if="userInfo.phone">
          {{ userInfo.phone.slice(0, 3) }}****{{ userInfo.phone.slice(-4) }}
        </view>
        <view class="input-box">
          <input
            type="number"
            :maxlength="6"
            placeholder="请输入验证码"
            :value="formState.old_mobile_sms_code"
            @input="formState.old_mobile_sms_code = $event.detail.value"
          />
          <text class="get-code" @click="sendCode">{{ codeTip }}</text>
        </view>
      </view>

      <view class="step" v-if="step === 2">
        <view class="title">修改手机号码</view>
        <view class="sub-title" v-if="userInfo.phone">
          <view>当前绑定手机号为{{ userInfo.phone.slice(0, 3) }}****{{ userInfo.phone.slice(-4) }}</view>
        </view>
        <view class="input-box" style="margin-bottom: 20rpx">
          <text class="suffix">+86</text>
          <text class="line"></text>
          <input
            type="text"
            placeholder="输入新的手机号"
            :value="formState.new_mobile"
            @input="formState.new_mobile = $event.detail.value"
          />
          <text class="get-code" @click="sendCode">{{ codeTip }}</text>
        </view>
        <view class="input-box">
          <input
            type="number"
            :maxlength="6"
            placeholder="请输入验证码"
            :value="formState.new_mobile_sms_code"
            @input="formState.new_mobile_sms_code = $event.detail.value"
          />
        </view>
      </view>
    </view>

    <view class="next" @click="next">{{ step === 1 ? '下一步' : '确认' }}</view>
  </view>
</template>

<script>
import { mapState } from 'vuex';
import $http from '@/utils/http';

export default {
  name: 'changePhone',

  data() {
    return {
      step: 1,
      countdown: '',
      formState: {
        old_mobile_sms_code: '',
        old_mobile_sms_sign: '',
        new_mobile: '',
        new_mobile_sms_sign: '',
        new_mobile_sms_code: '',
      },
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

      if (this.step === 2 && !this.formState.new_mobile) {
        uni.showToast({
          title: '新手机号不能为空',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      let mobile = '';

      if (this.step === 1) {
        mobile = this.userInfo.phone;
      } else {
        mobile = this.formState.new_mobile;
      }

      $http
        .post('api/global/sms/send_code', {
          mobile: mobile,
        })
        .then((res) => {
          uni.hideLoading();

          if (this.step === 1) {
            this.formState.old_mobile_sms_sign = res.data.sign;
          } else {
            this.formState.new_mobile_sms_sign = res.data.sign;
          }

          this.countdown = 60;
        });
    },

    next() {
      if (this.step === 1) {
        if (!this.formState.old_mobile_sms_code) {
          uni.showToast({
            title: '验证码错误',
            icon: 'none',
          });

          return;
        }

        this.countdown = 0;
        this.step = 2;
      } else {
        if (!this.formState.new_mobile) {
          uni.showToast({
            title: '新手机号不能为空',
            icon: 'none',
          });

          return;
        }

        if (!this.formState.new_mobile_sms_code) {
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

        $http.post('api/user/auth/userauth/change_mobile', this.formState).then(() => {
          uni.hideLoading();

          uni.showToast({
            title: '修改成功，请重新登录',
            icon: 'none',
            mask: true,
          });

          setTimeout(() => {
            this.$toSwitch('/pages/index/index');
          }, 1000);
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.change-phone-page {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height) + 60rpx) 0 0;
  }

  .container {
    padding: 0 30rpx;

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .title {
        font-weight: 500;
        font-size: 32rpx;
        color: #111111;
        margin-bottom: 36rpx;
      }

      .sub-title {
        font-size: 26rpx;
        color: #999999;
        margin-bottom: 57rpx;

        view {
          line-height: 40rpx;
          text-align: center;
        }
      }

      .phone {
        font-weight: 500;
        font-size: 32rpx;
        color: #111111;
        margin-bottom: 43rpx;
      }

      .input-box {
        width: 100%;
        height: 103rpx;
        background: #ffffff;
        border-radius: 20rpx;
        border: 2rpx solid #0abf92;
        padding: 0 33rpx;
        display: flex;
        align-items: center;

        .suffix {
          flex-shrink: 0;
          font-size: 24rpx;
          color: #0abf92;
          margin-right: 20rpx;
        }

        .line {
          flex-shrink: 0;
          width: 1rpx;
          height: 52rpx;
          background: #999999;
          margin-right: 20rpx;
        }

        input {
          flex-grow: 1;
          font-size: 28rpx;
        }

        .get-code {
          flex-shrink: 0;
          font-size: 24rpx;
          color: #0abf92;
        }
      }
    }
  }

  .next {
    position: fixed;
    left: 30rpx;
    right: 30rpx;
    bottom: 100rpx;
    height: 103rpx;
    background: #0abf92;
    border-radius: 20rpx;
    font-weight: 500;
    font-size: 32rpx;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
