<template>
  <view class="login-page">
    <view class="page-title">
      <text></text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="container">
      <view class="title">慧食搭子 记录美好生活</view>

      <view class="input-box">
        <text>{{ phone.slice(0, 3) }}****{{ phone.slice(-4) }}</text>
      </view>

      <view class="login" @click="login">一键登录</view>
      <view class="other-login" @click="$toBack">其他手机号码登录</view>

      <view class="agreement">
        <checkbox-group @change="agree = $event.detail.value">
          <label>
            <checkbox value="1" :checked="agree.includes('1')" />
          </label>
        </checkbox-group>
        <view>
          我已阅读并同意
          <text @click="$toRouter('/pages/protocol/protocol')">《用户协议》</text>
          和
          <text @click="$toRouter('/pages/privacy/privacy')">《隐私政策》</text>
        </view>
      </view>
    </view>

    <view class="kefu">
      <text @click="callPhone">联系客服</text>
      <text class="line">｜</text>
      <text>客服电话：4009989759</text>
    </view>
  </view>
</template>

<script>
import { mapActions } from 'vuex';
import $http from '@/utils/http';

export default {
  name: 'login',

  data() {
    return {
      agree: [],
      phone: '',
      token: '',
    };
  },

  onLoad(options) {
    this.phone = options.phone;
    this.token = options.token;
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    ...mapActions('app', ['_getUserInfo']),

    /**
     * 登录
     */
    login() {
      if (!this.agree.includes('1')) {
        uni.showToast({
          title: '请阅读并同意《用户协议》和《隐私政策》',
          icon: 'none',
        });

        return;
      }

      // 登录完成之后保存 token
      const storageExpireDays = 7;
      const currentTime = Date.now();
      const expireTime = currentTime + storageExpireDays * 24 * 60 * 60 * 1000; // 当前时间加上7天
      uni.setStorageSync('foodDiaryToken', {
        value: this.token,
        expireTime: expireTime,
      });

      // 后端更新open_id和unionid
      uni.login({
        success: (res) => {
          $http.post('api/user/auth/userauth/get_openid', {
            code: res.code,
            micro_appid: uni.getAccountInfoSync().miniProgram.appId,
          });
        },
      });

      // 登录完成获取用户信息
      this._getUserInfo().then(() => {
        uni.hideLoading();

        uni.showToast({
          title: '登录成功',
          icon: 'none',
          mask: true,
        });

        uni.switchTab({
          url: '/pages/index/index',
        });
      });
    },

    callPhone() {
      uni.makePhoneCall({
        phoneNumber: '4009989759',
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
.login-page {
  height: 100%;
  background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/login/login-bg.png') top left/100% 100%
    no-repeat;
  padding-bottom: 60rpx;
  display: flex;
  flex-direction: column;

  .page-title {
  }

  .banner {
    flex-shrink: 0;
    padding: calc(var(--page-title-height)) 0 0;
  }

  .container {
    flex-grow: 1;
    padding-bottom: 180rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .title {
      font-weight: 500;
      font-size: 38rpx;
      color: #1a1a1a;
      margin-bottom: 128rpx;
    }

    .input-box {
      font-weight: 500;
      font-size: 48rpx;
      color: #1a1a1a;
      margin-bottom: 92rpx;
    }

    .login {
      width: 560rpx;
      height: 90rpx;
      background: #0abf92;
      border-radius: 45rpx;
      font-weight: 500;
      font-size: 32rpx;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 29rpx;
    }

    .other-login {
      font-weight: 500;
      font-size: 24rpx;
      color: #666666;
      margin-bottom: 37rpx;
    }

    .agreement {
      display: flex;
      align-items: center;

      checkbox {
        transform: scale(0.6);
      }

      view {
        font-size: 22rpx;
        color: #999999;
      }
    }
  }

  .kefu {
    font-size: 22rpx;
    color: #999999;
    align-self: center;

    .line {
      padding: 0 12rpx;
    }
  }
}
</style>
