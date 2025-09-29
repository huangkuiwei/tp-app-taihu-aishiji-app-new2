<template>
  <view class="qyhywx-page">
    <view class="qyhywx-page-wrap"></view>

    <view class="mask" @click="confirmReceive"></view>

    <uni-popup ref="checkConfirmDialog" maskBackgroundColor="rgba(0, 0, 0, 0.5)">
      <view class="check-confirm-dialog">
        <view class="check-content">
          <view class="buy">
            <image
              class="agree-btn"
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/auorder/order_btn.png"
            />
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'auorderPage',

  data() {
    return {
      queryO: null,
      pt: null,
      mobile: null,
      shurl: null,
      openId: null,
      interstitialAd: null,
    };
  },

  onLoad(options) {
    console.log(options.o, 'options_o');
    this.queryO = options && options.o ? options.o : null;

    this.pt = options.pt;
    this.mobile = options.mobile;
    this.shurl = options.shurl;

    if (this.pt) {
      uni.login({
        success: (res) => {
          $http
            .post('api/user/auth/userauth/get_openid', {
              code: res.code,
              micro_appid: uni.getAccountInfoSync().miniProgram.appId,
              only_auth: true,
              phone: this.mobile,
            })
            .then((res) => {
              this.openId = res.data;
            });
        },
      });
    }

    // #ifdef MP-WEIXIN
    // 在页面onLoad回调事件中创建插屏广告实例
    // if (wx.createInterstitialAd) {
    //   this.interstitialAd = wx.createInterstitialAd({
    //     adUnitId: 'adunit-b1f21ced8f145f42',
    //   });
    //   this.interstitialAd.onLoad(() => {});
    //   this.interstitialAd.onError((err) => {
    //     console.error('插屏广告加载失败', err);
    //   });
    //   this.interstitialAd.onClose(() => {});
    // }
    // #endif

    // #ifdef MP-WEIXIN
    // wx.onAppShow((res) => {
    //   console.log('res', res);
    //
    //   if (res.scene === 1038) {
    //     const { appId, extraData } = res.referrerInfo;
    //
    //     if (appId === 'wxbd687630cd02ce1d') {
    //       if (extraData.return_code !== 'SUCCESS') {
    //         // 在适合的场景显示插屏广告
    //         if (this.interstitialAd) {
    //           this.interstitialAd.show().catch((err) => {
    //             console.error('插屏广告显示失败', err);
    //           });
    //         }
    //       }
    //     }
    //   }
    // });
    // #endif
  },

  onReady() {
    this.$refs.checkConfirmDialog.open();
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

    //点击确认领取
    confirmReceive() {
      // 小程序支付
      if (this.pt) {
        this.createOrderNew();
      }
      // 签约支付
      else if (this.queryO) {
        this.getQuery();
      }
    },

    createOrderNew() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      uni.request({
        method: 'POST',
        url: 'https://hsdzapi.laketay.com/api/microapp/order/we_h5/createordernew',
        data: {
          mobile: this.mobile,
          url: decodeURIComponent(this.shurl),
          openid: this.openId,
          appid: uni.getAccountInfoSync().miniProgram.appId,
          user_agent:
            'Mozilla/5.0 (Linux; Android 8.1.0; vivo Y85A Build/OPM1.171019.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.120 Mobile Safari/537.36 XWEB/1220099 MMWEBSDK/20240404 MMWEBID/106 MicroMessenger/8.0.49.2600(0x28003133) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64',
        },
        success: (res) => {
          if (res.data.code === 0 || res.data.Code === 0) {
            let payParams = JSON.parse(res.data.data);
            console.log(payParams, 'payParams');

            uni.requestPayment({
              ...payParams,
              success: (res1) => {
                // 支付成功处理逻辑，res.errMsg=requestPayment:ok时，才表示支付成功
                if (res1.errMsg === 'requestPayment:ok') {
                  uni.showModal({
                    content: '支付成功',
                    showCancel: false,
                    confirmText: '进入首页',
                    success: (res) => {
                      if (res.confirm) {
                        uni.switchTab({
                          url: '/pages/index/index',
                        });
                      }
                    },
                  });
                } else {
                  uni.showModal({
                    content: '支付失败',
                    showCancel: false,
                  });
                }
              },
              fail: () => {
                uni.showModal({
                  content: '支付失败',
                  showCancel: false,
                });
              },
            });
          } else {
            uni.showModal({
              title: '温馨提示',
              content: res.data.Msg,
              confirmText: '确认',
              cancelText: '取消',
            });
          }
        },
        complete: () => {
          uni.hideLoading();
        },
      });
    },

    async getQuery() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      await this.sleep(2000);

      uni.request({
        method: 'GET',
        url: `https://hsdzapi.laketay.com/api/business/ali_sign/au_order/${this.queryO}`,
        success: (res) => {
          if (res.data.code === 0 || res.data.Code === 0) {
            let sign_order_no = res.header.sign_order_no;

            if (sign_order_no) {
              uni.setStorageSync('sign_order_no', sign_order_no);
            }

            if (res.data.data.startsWith('http')) {
              uni.navigateTo({
                url: `/pages/webview/webview?src=${encodeURIComponent(res.data.data)}`,
              });
            } else {
              let params = JSON.parse(res.data.data);
              console.log(params, 'params');
              this.navigateToMiniProgram(params);
            }
          } else {
            uni.showToast({
              title: res.data.msg || res.data.Msg,
              icon: 'none',
              mask: true,
            });
          }
        },
        complete: () => {
          uni.hideLoading();
        },
      });
    },
    navigateToMiniProgram(params) {
      // 使用wx.navigateToMiniProgram跳转到小程序，拉起签约
      wx.navigateToMiniProgram({
        appId: 'wxbd687630cd02ce1d',
        path: 'pages/index/index',
        extraData: {
          appid: params.appid,
          contract_code: params.contract_code,
          contract_display_account: params.contract_display_account,
          mch_id: params.mch_id,
          notify_url: params.notify_url,
          plan_id: params.plan_id,
          request_serial: params.request_serial,
          timestamp: Number(params.timestamp),
          sign: params.sign,
          // return_web: params.return_web,
          // version: params.version,
        },
        success(res) {
          // 成功跳转到签约小程序
          console.log(res, 'success');
        },
        fail: (res) => {
          // 未成功跳转到签约小程序
          console.log(res, 'fail');
          uni.showModal({
            content: res.errMsg || '支付失败',
            showCancel: false,
          });

          // #ifdef MP-WEIXIN
          // 在适合的场景显示插屏广告
          // if (this.interstitialAd) {
          //   this.interstitialAd.show().catch((err) => {
          //     console.error('插屏广告显示失败', err);
          //   });
          // }
          // #endif
        },
      });
    },
  },
};
</script>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

.qyhywx-page {
  height: 100%;
  overflow: auto;

  .qyhywx-page-wrap {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/auorder/dialog_back_img.png') left
      top/100% 100% no-repeat;
  }

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    z-index: 999;
  }

  .check-confirm-dialog {
    position: relative;
    width: 676rpx;
    height: 711rpx;
    background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/auorder/dialog_box.png') left top/100%
      100% no-repeat;

    .check-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 auto;

      .buy {
        position: absolute;
        bottom: 180rpx;
        left: 50%;
        transform: translateX(-50%);
        .agree-btn {
          width: 318rpx;
          height: 86rpx;
        }
      }
    }
  }
}
</style>
