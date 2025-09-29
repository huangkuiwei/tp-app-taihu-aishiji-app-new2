<template>
  <view class="profile-page">
    <view class="page-title">
      <text>编辑资料</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="header">
      <image
        @click="editHeaderImg"
        class="header-img"
        mode="aspectFill"
        :src="userInfo.avatar_url || 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/my/default_head.png'"
      />

      <image
        class="cramer"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/profile/cramer.png"
      />
    </view>

    <view class="nav-container">
      <view class="nav">
        <view class="nav-item">
          <view class="nav-title">昵称</view>
          <view class="name">{{ userInfo.uname }}</view>
        </view>

        <view class="nav-item">
          <view class="nav-title">
            <text>绑定手机号</text>
            <text class="phone">{{ userInfo.phone }}</text>
          </view>
          <view class="name" @click="$toRouter('/pages/changePhone/changePhone')">更换手机号</view>
        </view>
      </view>

      <view class="nav">
        <view class="nav-item" @click="$toRouter('/pages/privacy/privacy')">
          <view class="nav-title">隐私协议</view>
          <view class="name">
            <uni-icons color="#999999" type="right" size="14"></uni-icons>
          </view>
        </view>

        <view class="nav-item" v-if="version" @click="update">
          <view class="nav-title">
            <text>检查更新</text>
          </view>
          <view class="name">
            <text class="version">当前版本{{ version }}</text>
            <uni-icons color="#999999" type="right" size="14"></uni-icons>
          </view>
        </view>
      </view>

      <view class="sign-out" @click="signOut">退出登录</view>
      <view class="logout" @click="$toRouter('/packageLogin/pages/logout/logout')">注销账号</view>
    </view>

    <uni-popup ref="signOutDialog">
      <view class="sign-out-dialog">
        <view class="title">确认退出登录吗？</view>

        <view class="tip">
          <view>退出登录后将无法继续同步数据、</view>
          <view>无法享受当前权益</view>
        </view>

        <view class="options">
          <view class="btn1" @click="$refs.signOutDialog.close()">取消</view>
          <view class="btn2" @click="submitSignOut">确认</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import $http from '@/utils/http';

export default {
  name: 'profile',

  data() {
    return {
      version: '',
    };
  },

  computed: {
    ...mapState('app', ['userInfo']),
  },

  onLoad() {
    // #ifdef MP-WEIXIN
    let { version } = uni.getAccountInfoSync().miniProgram;
    this.version = version;
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
    ...mapActions('app', ['_getUserInfo']),

    update() {
      // #ifdef MP-WEIXIN
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      const updateManager = uni.getUpdateManager();

      updateManager.onCheckForUpdate((event) => {
        uni.hideLoading();

        if (!event.hasUpdate) {
          uni.showToast({
            title: '当前已是最新版本',
            icon: 'none',
          });
        }
      });

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

      updateManager.onUpdateFailed(() => {
        uni.showToast({
          title: '新版本下载失败，请稍后再试',
          icon: 'none',
        });
      });
      // #endif
    },

    editHeaderImg() {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          uni.showLoading({
            title: '上传中，请稍等...',
            mask: true,
          });

          let filePath = res.tempFiles[0].tempFilePath;
          let url = await this.uploadFile(filePath);

          await $http.post('api/user/auth/userauth/update_wx_info', {
            avatarUrl: url,
          });

          await this._getUserInfo();

          uni.showToast({
            title: '更新成功',
            icon: 'none',
          });
        },
      });
    },

    uploadFile(path) {
      return $http.upload('api/global/fileupload/upload', path, 'file').then((res) => {
        return res.data;
      });
    },

    signOut() {
      this.$refs.signOutDialog.open();
    },

    submitSignOut() {
      uni.showLoading({
        title: '退出中...',
        mask: true,
      });

      $http.post('api/user/auth/userauth/logout').then(() => {
        uni.hideLoading();

        this.$refs.signOutDialog.close();

        uni.showToast({
          title: '退出成功',
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

<style>
page {
  background: #f6f7fb;
}
</style>

<style scoped lang="scss">
.profile-page {
  page-title {
    background: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: #ffffff;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 54rpx 0 60rpx;
    position: relative;

    .header-img {
      width: 150rpx;
      height: 150rpx;
      border-radius: 50%;
    }

    .cramer {
      position: absolute;
      width: 50rpx;
      bottom: 50rpx;
      right: 300rpx;
    }
  }

  .nav-container {
    padding: 0 30rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .nav {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 32rpx 25rpx;
      display: flex;
      flex-direction: column;
      gap: 60rpx;

      .nav-item {
        display: flex;
        align-items: center;

        .nav-title {
          font-size: 28rpx;
          color: #1a1a1a;
          flex-grow: 1;

          .phone {
            margin-left: 20rpx;
            font-size: 24rpx;
            color: #999999;
          }
        }

        .name {
          font-size: 24rpx;
          color: #999999;

          .version {
            margin-right: 20rpx;
          }
        }
      }
    }

    .sign-out {
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

    .logout {
      font-size: 28rpx;
      color: #0abf92;
      text-align: center;
    }
  }

  .sign-out-dialog {
    width: 589rpx;
    background: #ffffff;
    border-radius: 30rpx;
    padding: 40rpx 90rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    .title {
      font-weight: 500;
      font-size: 32rpx;
      color: #111111;
      margin-bottom: 50rpx;
    }

    .tip {
      font-size: 26rpx;
      color: #555555;
      margin-bottom: 35rpx;

      view {
        line-height: 45rpx;
        text-align: center;
      }
    }

    .options {
      align-self: stretch;

      .btn1 {
        width: 100%;
        height: 90rpx;
        background: #0abf92;
        border-radius: 45rpx;
        font-size: 30rpx;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 22rpx;
      }

      .btn2 {
        font-size: 30rpx;
        color: #999999;
        text-align: center;
      }
    }
  }
}
</style>
