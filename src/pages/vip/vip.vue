<template>
  <view class="vip-page">
    <view class="page-title">
      <text>会员中心</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner">
      <view class="user-container">
        <view class="userinfo">
          <view class="left">
            <image
              mode="aspectFill"
              :src="
                userInfo.avatar_url || 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/my/default_head.png'
              "
            />
          </view>

          <view class="right" v-if="isLogin">
            <text>{{ userInfo.uname }}</text>
            <text v-if="!isVip">您还未开通会员</text>
          </view>

          <view class="right" v-else @click="$toRouter('/packageLogin/pages/login/login')">
            <text>登录/注册</text>
            <text>点击登录/注册</text>
          </view>
        </view>
      </view>
    </view>

    <view class="vip-info">
      <view class="title">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/vip/title-icon.png" />
        <text>尊享会员权益</text>
      </view>

      <view class="introduce">
        <image mode="heightFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/vip/icon1.png" />
        <image mode="heightFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/vip/icon2.png" />
        <image mode="heightFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/vip/icon3.png" />
      </view>

      <view class="vip-title-icon">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/vip/title-icon2.png" />
        <image
          @click="$toRouter('/pages/exchangeCenter/exchangeCenter')"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/vip/title-icon3.png"
        />
      </view>

      <view class="vip-shop-list">
        <view
          class="item"
          @click="selectedVip = item"
          :class="{ active: selectedVip.id === item.id }"
          v-for="item of vipList"
          :key="item.id"
        >
          <view class="name">{{ item.product_name }}</view>
          <view class="price">
            <text>￥</text>
            <text>{{ item.price }}</text>
          </view>
          <view class="tip">{{ Number((item.select_percentage * 100).toFixed(2)) }}%用户选择</view>

          <view class="vip-icon" v-if="selectedVip.id === item.id">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/vip/vip-icon1.png"
            />
            <text>立省￥{{ Number((item.original_price - item.price).toFixed(2)) }}</text>
          </view>
        </view>
      </view>

      <view class="rule">
        <view class="rule-title">以下内容请您知悉</view>

        <view>1.慧食搭子会员服务属于虚拟商品，是一项特殊服务，会员开通成功后概不退款，故请先试用满意后再开通</view>
        <view>2.会员价格会随着功能的完善会逐步涨价，现在开通最划算</view>
        <view>3.会员时长到期后不会自动续费</view>
        <view>4.有任何开通会员问题请联系客服咨询</view>
      </view>
    </view>

    <view class="buy-box">
      <template v-if="showShopInfo">
        <view class="btn" style="margin-bottom: 24rpx" @click="submit(selectedVip, openid, userInfo.phone)">
          立即开通
        </view>
        <view class="agreement">
          <checkbox-group @change="agree = $event.detail.value">
            <label>
              <checkbox value="1" :checked="agree.includes('1')" />
            </label>

            <text>我已阅读并同意</text>
            <text @click="$toRouter('/pages/protocol/protocol')">《会员服务协议》</text>
          </checkbox-group>
        </view>
      </template>

      <template v-else>
        <view class="buy-tip">由于相关规定，iOS版小程序暂不支持购买</view>
        <button class="btn" @click="openContact">联系客服</button>
      </template>
    </view>
  </view>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import $http from '@/utils/http';
import { onPay } from '@/pages/vip/member';

export default {
  name: 'vip',

  data() {
    const platform = uni.getDeviceInfo().platform;

    return {
      vipList: [],
      selectedVip: {},
      agree: [],
      openid: null,
      // showShopInfo: false, // 测试
      showShopInfo:
        (process.env.UNI_PLATFORM === 'mp-weixin' && platform !== 'ios') || process.env.UNI_PLATFORM !== 'mp-weixin',
    };
  },

  computed: {
    ...mapState('app', ['userInfo']),
    ...mapGetters('app', ['isLogin', 'isVip']),
  },

  onLoad() {
    uni.login({
      success: (res) => {
        $http
          .post('api/user/auth/userauth/get_openid', {
            code: res.code,
            micro_appid: uni.getAccountInfoSync().miniProgram.appId,
          })
          .then((res) => {
            this.openid = res.data;
          });
      },
    });

    this.getProductList();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    submit(price, openid, mobile) {
      if (!this.agree.includes('1')) {
        uni.showToast({
          title: '请先阅读并同意协议',
          icon: 'none',
        });

        return;
      }

      onPay(price, openid, mobile);
    },

    openContact() {
      uni.openCustomerServiceChat({
        corpId: 'wwa09afa94a53c191b',
        extInfo: {
          url: 'https://work.weixin.qq.com/kfid/kfc4d6f5ec87ef53883',
        },
      });
    },

    getProductList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http.get('api/global/product/get').then((res) => {
        uni.hideLoading();

        res.data.forEach((item) => {
          item.price = Number((item.price / 100).toFixed(2));
          item.original_price = Number((item.original_price / 100).toFixed(2));
        });

        this.vipList = res.data;
        this.selectedVip = this.vipList[0];
      });
    },
  },
};
</script>

<style scoped lang="scss">
.vip-page {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: linear-gradient(90deg, rgba(206, 238, 250, 0.9) 0%, #e0fae9 100%);

    .user-container {
      padding: 32rpx 20rpx 0;

      .userinfo {
        padding: 63rpx 40rpx 150rpx;
        background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/vip/vip-banner-bg.png') left
          top/100% 100% no-repeat;
        display: flex;
        align-items: center;

        .left {
          flex-shrink: 0;
          margin-right: 24rpx;

          image {
            width: 120rpx;
            height: 120rpx;
            border-radius: 50%;
          }
        }

        .right {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 30rpx;

          text {
            &:nth-child(1) {
              font-weight: bold;
              font-size: 32rpx;
              color: #ffffff;
            }

            &:nth-child(2) {
              font-size: 24rpx;
              color: #ffffff;
            }
          }
        }
      }
    }
  }

  .vip-info {
    padding: 50rpx 0 160rpx;
    background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/vip/vip-info-bg.png') left top/100%
      auto no-repeat;
    position: relative;
    top: -114rpx;

    .title {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 28rpx;
      margin-bottom: 40rpx;

      image {
        width: 178rpx;
        margin-bottom: 16rpx;
      }

      text {
        font-weight: 500;
        font-size: 24rpx;
        color: #1a1a1a;
      }
    }

    .introduce {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 35rpx;
      padding: 0 28rpx;
      margin-bottom: 45rpx;

      image {
        height: 158rpx;
      }
    }

    .vip-title-icon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28rpx;

      image {
        &:nth-child(1) {
          width: 142rpx;
        }

        &:nth-child(2) {
          width: 160rpx;
        }
      }
    }

    .vip-shop-list {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 56rpx 0 0 28rpx;
      overflow: auto;
      margin-bottom: 50rpx;

      .item {
        flex-shrink: 0;
        width: 257rpx;
        padding: 50rpx 0 28rpx;
        border-radius: 20rpx;
        border: 2px solid #d9d9d9;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;

        &.active {
          background: #f9faf4;
          border: 2px solid #333333;
        }

        .name {
          font-weight: 500;
          font-size: 32rpx;
          color: #333333;
          margin-bottom: 34rpx;
        }

        .price {
          margin-bottom: 44rpx;

          text {
            color: #111111;

            &:nth-child(1) {
              font-size: 24rpx;
            }

            &:nth-child(2) {
              font-size: 55rpx;
            }
          }
        }

        .tip {
          font-size: 24rpx;
          color: #666666;
        }

        .vip-icon {
          position: absolute;
          top: -22rpx;
          left: -6rpx;

          image {
            width: 68rpx;
            position: absolute;
            left: -12px;
            top: -8px;
          }

          text {
            width: 171rpx;
            height: 44rpx;
            padding-left: 40rpx;
            background: #0abf92;
            border-radius: 20rpx 0 20rpx 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 26rpx;
            color: #3f3f3d;
          }
        }
      }
    }

    .rule {
      padding: 0 28rpx;
      font-size: 22rpx;
      color: #666666;

      view {
        line-height: 40rpx;

        &.rule-title {
          font-size: 24rpx;
          font-weight: 500;
        }
      }
    }
  }

  .buy-box {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 240rpx;
    padding: 20rpx 0 40rpx;
    background: #ffffff;
    box-shadow: 0 2rpx 12rpx 0 rgba(0, 0, 0, 0.05);
    border-top: 2rpx solid #eeeeee;
    display: flex;
    flex-direction: column;
    align-items: center;

    .btn {
      width: 592rpx;
      height: 103rpx;
      background: #0abf92;
      border-radius: 52rpx;
      font-weight: 500;
      font-size: 32rpx;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .agreement {
      font-size: 24rpx;
      color: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;

      checkbox-group {
        checkbox {
          transform: scale(0.7);
        }
      }
    }

    .buy-tip {
      font-size: 28rpx;
      margin-bottom: 24rpx;
    }
  }
}
</style>
