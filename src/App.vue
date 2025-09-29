<script>
import { mapActions, mapMutations } from 'vuex';

export default {
  name: 'app',

  globalData: {},

  data() {
    return {};
  },

  methods: {
    ...mapMutations('app', ['_setSystemInfo']),
    ...mapActions('app', ['_getUserInfo', '_getUserDetailInfo', '_getLifestyle']),
  },

  onLaunch() {
    // 获取用户信息
    this._getUserInfo();
    this._getUserDetailInfo();
    this._getLifestyle();

    // 小程序版本更新
    const updateManager = uni.getUpdateManager();

    updateManager.onUpdateReady(() => {
      uni.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启小程序？',
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    updateManager.onUpdateFailed((err) => {
      console.log('版本下载失败原因', err);

      uni.showToast({
        title: '新版本下载失败，请稍后再试',
        icon: 'none',
      });
    });

    // 获取系统信息
    let systemInfo = uni.getDeviceInfo();
    this._setSystemInfo(systemInfo);
  },

  onShow(res) {
    console.log('App Show');

    // 场景值1038：从被打开的小程序返回
    if (res.scene === 1038) {
      const { appId, extraData } = res.referrerInfo;

      // appId为wxbd687630cd02ce1d：从签约小程序跳转回来
      if (appId === 'wxbd687630cd02ce1d') {
        if (extraData.return_code === 'SUCCESS') {
          let sign_order_no = uni.getStorageSync('sign_order_no');

          if (sign_order_no) {
            // 跳转到红包领取页面
            wx.navigateTo({
              url: '/pages/receiveRedPacket/receiveRedPacket',
            });
          } else {
            // 跳转到订购成功页面
            wx.navigateTo({
              url: '/pages/success/success',
            });
          }
        } else {
          wx.showToast({
            title: '签约失败',
            icon: 'none',
          });
        }
      }
    }
  },
};
</script>

<style lang="scss">
@import './common/styles/reset.scss';
@import './common/styles/global.scss';
</style>
