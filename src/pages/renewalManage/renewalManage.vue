<template>
  <view class="renewal-manage-page">
    <view class="page-title">
      <text>续订管理</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="container" v-if="isLogin">
      <view class="info">
        <image
          class="head"
          mode="aspectFill"
          :src="
            userInfo.avatar_url || 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/my/default_head.png'
          "
        />

        <view class="middle">
          <view class="name">{{ userInfo.uname }}</view>
          <view class="opened">
            {{ shopInfo.appid ? '已开通自动续订' : '已关闭自动续订' }}
          </view>
        </view>

        <view class="right" v-if="shopInfo.appid" @click="$refs.cancelPopupRef.open()">取消自动续订</view>
        <view class="right" v-else @click="$toRouter('/pages/vip/vip')">开启自动续订</view>
      </view>

      <view class="renew-box">
        <template v-if="shopInfo.appid">
          <view class="renew-info">
            <view>
              <text>续订产品</text>
              <text>慧食搭子月会员</text>
            </view>

            <view>
              <text>下次续费时间</text>
              <text>{{ shopInfo.NextAutoPaidTime }}</text>
            </view>

            <view>
              <text>续费金额</text>
              <text>{{ Number((shopInfo.SingleAmount / 100).toFixed(2)) }}元</text>
            </view>

            <view>
              <text>支付方式</text>
              <text>微信支付</text>
            </view>
          </view>
        </template>

        <template v-else>
          <view class="empty">暂无自动续订产品</view>
        </template>
      </view>
    </view>

    <uniPopup ref="loginPopupRef" :mask-click="false">
      <view class="login-dialog">
        <view class="tip">请先登录</view>

        <view class="login-box">
          <view class="phone">
            <input type="text" :disabled="true" :value="userInfo.phone" />
          </view>

          <view class="code">
            <input placeholder="请输入验证码" maxlength="6" v-model="formState.sms_code" @input="onSmsCodeInput" />
            <text class="get-code" @click="sendCode">{{ codeTip }}</text>
          </view>

          <view class="login" @click="login">登录</view>
        </view>
      </view>
    </uniPopup>

    <uniPopup ref="cancelPopupRef" :mask-click="false">
      <view class="login-dialog">
        <view class="tip">即将取消自动续订</view>

        <view class="login-box">
          <view class="phone">
            <input type="text" :disabled="true" :value="userInfo.phone" />
          </view>

          <view class="code">
            <input
              placeholder="请输入验证码"
              maxlength="6"
              v-model="cancelFormState.sms_code"
              @input="onSmsCodeInput1"
            />
            <text class="get-code" @click="sendCode1">{{ codeTip }}</text>
          </view>
        </view>

        <view class="options">
          <text @click="close1">取消</text>
          <text @click="submit">确定</text>
        </view>
      </view>
    </uniPopup>
  </view>
</template>

<script>
import { mapState } from 'vuex';
import $http from '@/utils/http';
import { getStorageSyncWithExpire, setStorageSyncWithExpire } from '@/utils';

export default {
  name: 'renewalManage',

  data() {
    return {
      formState: {
        sms_code: '',
        sms_sign: '',
      },
      cancelFormState: {
        sms_code: '',
        sms_sign: '',
      },
      countdown: 0,
      shopInfo: {},
      isLogin: false,
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
          let cd = this.countdown - 1;

          if (cd < 0) {
            this.countdown = 0;
          } else {
            this.countdown--;
          }
        }
      }, 1000);
    },
  },

  onShow() {
    this.getShopInfo();
  },

  methods: {
    getShopInfo() {
      $http
        .post(
          'https://hsdzapi.laketay.com/api/microapp/order/query_user_order_sign',
          {
            appid: 'wx230d5641dd96fcc9',
          },
          {
            hideLoginBox: true,
            token: getStorageSyncWithExpire('qyToken'),
          },
        )
        .then((res) => {
          this.isLogin = true;
          this.shopInfo = res.data.find((item) => item.state === 2) || {};
        })
        .catch(() => {
          this.isLogin = false;
          this.$refs.loginPopupRef.open();
        });
    },

    sendCode() {
      if (this.disabled) return;

      if (!this.userInfo.phone) {
        uni.showToast({
          title: '手机号错误',
          icon: 'none',
          mask: true,
        });

        return;
      }

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('https://hsdzapi.laketay.com/api/global/sms/send_code', {
          mobile: this.userInfo.phone,
          appid: 'wx230d5641dd96fcc9',
        })
        .then((res) => {
          this.formState.sms_sign = res.data.sign;
          this.countdown = 60;
        })
        .finally(() => {
          uni.hideLoading();
        });
    },

    sendCode1() {
      if (this.disabled) return;

      if (!this.userInfo.phone) {
        uni.showToast({
          title: '手机号错误',
          icon: 'none',
          mask: true,
        });

        return;
      }

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post(
          'https://hsdzapi.laketay.com/api/sms/sendcode',
          {
            mobile: this.userInfo.phone,
            item_type: this.shopInfo.businessType,
          },
          {
            hideLoginBox: true,
            token: getStorageSyncWithExpire('qyToken'),
          },
        )
        .then((res) => {
          this.cancelFormState.sms_sign = res.data.sign;
          this.countdown = 60;
        })
        .finally(() => {
          uni.hideLoading();
        });
    },

    onSmsCodeInput(event) {
      setTimeout(() => {
        this.formState.sms_code = event.detail.value.slice(0, 6);
      }, 0);
    },

    onSmsCodeInput1(event) {
      setTimeout(() => {
        this.cancelFormState.sms_code = event.detail.value.slice(0, 6);
      }, 0);
    },

    login() {
      if (!this.userInfo.phone) {
        uni.showToast({
          title: '手机号错误',
          icon: 'none',
          mask: true,
        });

        return;
      }

      if (!this.formState.sms_code) {
        uni.showToast({
          title: '验证码错误',
          icon: 'none',
          mask: true,
        });

        return;
      }

      uni.showLoading({
        title: '正在登录',
        mask: true,
        icon: 'none',
      });

      $http
        .post('https://hsdzapi.laketay.com/api/user/auth/login', {
          ...this.formState,
          mobile: this.userInfo.phone,
          appid: 'wx230d5641dd96fcc9',
        })
        .then((res) => {
          // 登录完成之后保存 token
          setStorageSyncWithExpire('qyToken', res.data.token, 24 * 60);
          uni.hideLoading();
          this.$refs.loginPopupRef.close();
          this.getShopInfo();
        });
    },

    close1() {
      this.$refs.cancelPopupRef.close();
      this.countdown = 0;
      this.cancelFormState.sms_code = '';
      this.cancelFormState.sms_sign = '';
    },

    submit() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post(
          'https://hsdzapi.laketay.com/api/user/order/unsign',
          {
            external_agreement_no: this.shopInfo.external_agreement_no,
            mobile: this.userInfo.phone,
            sms_sign: this.cancelFormState.sms_sign,
            sms_code: this.cancelFormState.sms_code,
          },
          {
            hideLoginBox: true,
            token: getStorageSyncWithExpire('qyToken'),
          },
        )
        .then(() => {
          uni.hideLoading();
          this.$refs.cancelPopupRef.close();
          this.getShopInfo();
        })
        .catch(() => {
          this.$refs.cancelPopupRef.close();
        });
    },
  },
};
</script>

<style lang="scss">
page {
  height: 100%;
}
</style>

<style scoped lang="scss">
.renewal-manage-page {
  height: 100%;
  background: linear-gradient(180deg, rgba(204, 255, 238, 0.9) 0%, rgba(251, 255, 255, 0.93) 27%, #f6f7fb 100%);

  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height) + 59rpx) 0 0;
    flex-shrink: 0;
  }

  .container {
    width: 690rpx;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 20rpx;
    padding: 20rpx;

    .info {
      display: flex;
      align-items: center;
      margin-bottom: 72rpx;

      .head {
        flex-shrink: 0;
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }

      .middle {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 20rpx;

        .name {
          font-weight: 500;
          font-size: 28rpx;
          color: #1a1a1a;
        }

        .opened {
          font-size: 22rpx;
          color: #999999;
          padding-left: 4rpx;
        }
      }

      .right {
        flex-shrink: 0;
        width: 180rpx;
        height: 55rpx;
        background: #0abf92;
        border-radius: 28rpx;
        font-weight: 400;
        font-size: 24rpx;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .renew-box {
      .renew-info {
        display: flex;
        flex-direction: column;

        view {
          display: flex;
          align-items: center;
          justify-content: space-between;

          &:not(:last-child) {
            margin-bottom: 30rpx;
            padding-bottom: 30rpx;
            border-bottom: 2rpx solid #f6f7fb;
          }

          text {
            &:nth-child(1) {
              font-size: 28rpx;
              color: #1a1a1a;
            }

            &:nth-child(2) {
              font-size: 24rpx;
              color: #999999;
            }
          }
        }
      }

      .empty {
        font-size: 28rpx;
        color: #999;
        padding: 20rpx 0;
        text-align: center;
      }
    }
  }
}

.login-dialog {
  width: 600rpx;
  background: #ffffff;
  padding-top: 40rpx;
  border-radius: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .tip {
    font-weight: 500;
    font-size: 32rpx;
    color: #111111;
    margin-bottom: 40rpx;
  }

  .login-box {
    padding: 0 40rpx;
    margin-bottom: 40rpx;
    display: flex;
    flex-direction: column;
    gap: 30rpx;

    .phone {
      background: #eeeeee;
      border-radius: 40rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      input {
        width: 100%;
        font-size: 28rpx;
        color: #999999;
        padding: 0 20px;
      }
    }

    .code {
      border-radius: 40rpx;
      height: 80rpx;
      border: 2rpx solid #cccccc;
      display: flex;
      align-items: center;

      input {
        flex-grow: 1;
        height: 100%;
        font-size: 28rpx;
        padding: 0 20px;
      }

      text {
        flex-shrink: 0;
        padding: 0 20rpx;
        font-size: 24rpx;
        color: #555555;
      }
    }

    .login {
      width: 100%;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #229bf7;
      border-radius: 40rpx;
      color: #ffffff;
    }
  }

  .options {
    border-top: 2rpx solid #f2f2f2;
    align-self: stretch;
    display: flex;
    align-items: center;

    text {
      padding: 40rpx 0;
      width: 50%;
      font-size: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &:nth-child(1) {
        color: #333333;
        border-right: 2rpx solid #f2f2f2;
      }

      &:nth-child(2) {
        color: #0abf92;
      }
    }
  }
}
</style>
