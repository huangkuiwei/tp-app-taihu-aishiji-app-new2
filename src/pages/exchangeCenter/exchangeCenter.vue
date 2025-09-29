<template>
  <view class="exchange-center-page">
    <view class="page-title">
      <text>兑换中心</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner">
      <view class="points-container">
        <view class="points">
          <view class="points-title">我的阳光</view>

          <view class="number">
            <view>
              <image
                mode="heightFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/exchangeCenter/icon1.png"
              />

              <text>{{ signInfo.flowers }}</text>
            </view>

            <view>
              <image
                mode="heightFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/exchangeCenter/icon2.png"
              />

              <text>{{ signInfo.points }}</text>
            </view>
          </view>

          <view class="sign-in">
            <image
              mode="heightFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/exchangeCenter/icon3.png"
            />
            <text class="tip" v-if="hasSignIn">
              连续签到第{{ signInfo.sign_continuous_days }}天，明日签到阳光+{{ nextSignInPoints }}
            </text>

            <text class="tip" v-else>
              连续签到第{{ signInfo.sign_continuous_days }}天，今日签到阳光+{{ nextSignInPoints }}
            </text>

            <text class="go-sign-in" @click="goSignIn">去签到</text>
          </view>
        </view>
      </view>
    </view>

    <view class="exchange-container">
      <view class="title">
        <text>会员兑换</text>
        <text @click="$refs.exchangeDialog.open()">兑换记录</text>
      </view>

      <view class="exchange-list">
        <view class="exchange-item" v-for="item of exchangeList" :key="item.id">
          <view class="left">
            <text>{{ item.name }}</text>
            <text>需消耗{{ item.flowers_required }}朵小花</text>
          </view>

          <view class="right" @click="exchange(item)">去兑换</view>
        </view>
      </view>
    </view>

    <exchange-dialog ref="exchangeDialog" />
  </view>
</template>

<script>
import ExchangeDialog from '@/pages/exchangeCenter/exchangeDialog.vue';
import $http from '@/utils/http';

export default {
  name: 'exchangeCenter',

  components: {
    ExchangeDialog,
  },

  data() {
    return {
      hasSignIn: undefined,
      exchangeList: [],
      signInfo: {},
      signInPointsList: [5, 5, 10, 10, 30, 30, 30],
    };
  },

  computed: {
    nextSignInPoints() {
      return this.signInPointsList[this.signInfo.sign_continuous_days] || 30;
    },
  },

  onLoad(options) {
    this.hasSignIn = options.hasSignIn === 'true';
  },

  onShow() {
    this.getExchangeList();
    this.getSignInfo();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    goSignIn() {
      uni.setStorageSync('goSignIn', true);
      this.$toSwitch('/pages/sunshine/sunshine');
    },

    getSignInfo() {
      return $http.get('api/sunshine/account-info').then((res) => {
        this.signInfo = res.data;
      });
    },

    getExchangeList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http.get('api/sunshine/available-exchanges').then((res) => {
        uni.hideLoading();

        this.exchangeList = res.data;
      });
    },

    exchange(item) {
      uni.showModal({
        title: '温馨提示',
        content: '确定要兑换此商品吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '加载中...',
              mask: true,
            });

            $http
              .post('api/sunshine/exchange-vip', {
                exchange_type: item.exchange_type,
              })
              .then(() => {
                uni.hideLoading();

                uni.showToast({
                  title: '兑换成功',
                  mask: true,
                  icon: 'none',
                });

                this.getSignInfo();
                this.getExchangeList();
              });
          }
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
.exchange-center-page {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: linear-gradient(90deg, rgba(206, 238, 250, 0.9) 0%, #e0fae9 100%);

    .points-container {
      padding: 50rpx 15rpx 0;

      .points {
        height: 334rpx;
        padding: 77rpx 27rpx 0 44rpx;
        background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/exchangeCenter/points-bg.png') left
          top/ 100% 100% no-repeat;

        .points-title {
          font-weight: 500;
          font-size: 32rpx;
          color: #ffffff;
          margin-bottom: 38rpx;
        }

        .number {
          display: flex;
          align-items: center;
          gap: 24rpx;
          margin-bottom: 60rpx;

          view {
            display: flex;
            align-items: center;

            image {
              height: 38rpx;
              margin-right: 12rpx;
            }

            text {
              font-size: 24rpx;
              color: #ffffff;
            }
          }
        }

        .sign-in {
          display: flex;
          align-items: center;

          image {
            height: 40rpx;
            margin-right: 9rpx;
          }

          .tip {
            font-size: 26rpx;
            color: #ffffff;
            flex-grow: 1;
          }

          .go-sign-in {
            width: 140rpx;
            height: 60rpx;
            background: #0abf92;
            border-radius: 25rpx;
            font-size: 30rpx;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }

  .exchange-container {
    background: #ffffff;
    border-radius: 25rpx 25rpx 0 0;
    padding: 53rpx 30rpx;
    position: relative;
    top: -20rpx;

    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28rpx;
      margin-bottom: 32rpx;

      text {
        &:nth-child(1) {
          font-weight: 500;
          font-size: 32rpx;
          color: #111111;
        }

        &:nth-child(2) {
          font-size: 24rpx;
          color: #999999;
        }
      }
    }

    .exchange-list {
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      .exchange-item {
        background: #f5f5f5;
        border-radius: 20rpx;
        padding: 37rpx 40rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .left {
          display: flex;
          flex-direction: column;
          gap: 15rpx;

          text {
            &:nth-child(1) {
              font-weight: 500;
              font-size: 32rpx;
              color: #222222;
            }

            &:nth-child(2) {
              font-size: 24rpx;
              color: #999999;
            }
          }
        }

        .right {
          &.disabled {
            background: #d9d9d9;
            color: #ffffff;
          }

          background: linear-gradient(90deg, #fe9f49 0%, #fe4c03 100%);
          border-radius: 30rpx;
          width: 160rpx;
          height: 60rpx;
          font-size: 30rpx;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}
</style>
