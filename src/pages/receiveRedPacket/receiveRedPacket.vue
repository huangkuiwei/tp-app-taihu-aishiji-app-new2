<template>
  <view class="receive-red-packet-page">
    <view class="container">
      <view class="top">
        <image
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/scantool/static/assets/receiveRedPacket/logo.png"
        />

        <text>慧食搭子发出的红包</text>
      </view>

      <view class="bottom">恭喜发财，大吉大利！</view>
    </view>

    <view class="btn">
      <image
        mode="widthFix"
        @click="confirmReceive"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/scantool/static/assets/receiveRedPacket/open-btn.png"
      />
    </view>
  </view>
</template>

<script>
export default {
  name: 'receiveRedPacket',

  data() {
    return {
      redPacket: false,
      sign_order_no: null,
      interstitialAd: null,
    };
  },

  onLoad() {
    this.sign_order_no = uni.getStorageSync('sign_order_no');

    // #ifdef MP-WEIXIN
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-b1f21ced8f145f42',
      });
      this.interstitialAd.onLoad(() => {});
      this.interstitialAd.onError((err) => {
        console.error('插屏广告加载失败', err);
      });
      this.interstitialAd.onClose(() => {});
    }
    // #endif
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    async sleep(time) {
      return new Promise((resolve) => {
        setTimeout(resolve, time);
      });
    },

    async confirmReceive() {
      uni.showLoading({
        title: '正在抽取红包',
        mask: true,
      });

      await this.sleep(2000);

      uni.request({
        method: 'POST',
        url: `https://hsdzapi.laketay.com/api/open/order/cashgift/v3`,
        data: {
          external_agreement_no: this.sign_order_no,
        },
        success: async (res) => {
          console.log('res', res);

          if (res.data.Code === 0 || res.data.code === 0) {
            let packages = res.data.data.packages || [];
            console.log('packages', packages);

            if (!packages.length) {
              uni.showToast({
                title: '暂无红包可领取',
                icon: 'none',
              });

              return;
            }

            let mchId = res.data.data.mch_id;
            let appid = res.data.data.appid;

            for (let i = 0; i < packages.length; i++) {
              await this.merchantTransfer(mchId, appid, packages[i]).catch(() => {});
            }

            uni.hideLoading();
            uni.removeStorageSync('sign_order_no');

            uni.showModal({
              title: '温馨提示',
              content: '红包领取成功',
              showCancel: false,
              confirmText: '进入首页',
              closable: false,
              success: (res2) => {
                if (res2.confirm) {
                  uni.switchTab({
                    url: '/pages/index/index',
                  });
                }
              },
            });

            // #ifdef MP-WEIXIN
            // 在适合的场景显示插屏广告
            if (this.interstitialAd) {
              this.interstitialAd.show().catch((err) => {
                console.error('插屏广告显示失败', err);
              });
            }
            // #endif
          } else {
            uni.hideLoading();
            uni.showToast({
              title: res.data.msg || res.data.Msg,
              icon: 'none',
              mask: true,
            });
          }
        },

        fail: () => {
          uni.hideLoading();
        },
      });
    },

    merchantTransfer(mchId, appid, package1) {
      return new Promise((resolve, reject) => {
        uni.requestMerchantTransfer({
          mchId: mchId,
          appId: appid,
          package: package1,
          success: (res1) => {
            console.log('res1:', res1);

            // res.err_msg将在页面展示成功后返回应用时返回ok，并不代表付款成功
            if (res1.errMsg === 'requestMerchantTransfer:ok') {
            }
            resolve(res1);
          },
          fail: (error) => {
            console.log('error:', error, mchId, appid, package1);
            uni.showToast({
              title: error.errMsg,
              icon: 'none',
            });

            reject(error);
          },
        });
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
.receive-red-packet-page {
  height: 100%;
  background: #f15442
    url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/scantool/static/assets/receiveRedPacket/red-packet-bg.png') left
    top/100% auto no-repeat;
  position: relative;

  .container {
    padding-top: 236rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .top {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 52rpx;

      image {
        width: 60rpx;
        margin-right: 25rpx;
      }

      text {
        font-weight: 500;
        font-size: 40rpx;
        color: #ffe0b0;
      }
    }

    .bottom {
      font-weight: 500;
      font-size: 56rpx;
      color: #ffe0b0;
    }
  }

  .btn {
    position: absolute;
    top: 57%;
    left: 0;
    right: 0;
    text-align: center;

    image {
      width: 266rpx;
    }
  }
}
</style>
