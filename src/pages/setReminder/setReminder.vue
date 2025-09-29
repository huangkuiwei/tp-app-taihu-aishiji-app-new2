<template>
  <view class="set-reminder-page">
    <view class="page-title">
      <text>设置提醒</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="container">
      <view class="reminder-item" v-if="!reminderData.is_wx_subscribed" @click="goWebview">
        <view class="left">一键开启提醒功能，避免错误登记</view>
        <view class="right">开启提醒</view>
      </view>

      <view class="reminder-item">
        <view class="left">
          <text>饮食记录提醒</text>
          <text>早餐、午餐、晚餐未记录时，提醒触发</text>
        </view>

        <view @click="toggleSwitch">
          <switch
            :disabled="!reminderData.is_wx_subscribed"
            :checked="reminderData.is_diet_remind_enabled"
            @change="onChange1"
          />
        </view>
      </view>

      <view class="reminder-item">
        <view class="left">
          <text>运动提醒</text>
          <text>到点未记录时，提醒触发</text>
        </view>

        <view @click="toggleSwitch">
          <switch
            :disabled="!reminderData.is_wx_subscribed"
            :checked="reminderData.is_exercise_remind_enabled"
            @change="onChange2"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'setReminder',

  data() {
    return {
      reminderData: {},
      link: 'https://mp.weixin.qq.com/s/TsRPYgh5yjosYiIGK7_XtA',
    };
  },

  async onShow() {
    uni.showLoading({
      title: '加载中...',
      mask: true,
    });

    await this.getWxSubStatus();
    await this.getReminderData();

    uni.hideLoading();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    getWxSubStatus() {
      return $http.get('api/user/profile/check-wx-subscription');
    },

    getReminderData() {
      return $http.get('api/user/profile/remind-settings').then((res) => {
        this.reminderData = res.data;
      });
    },

    goWebview() {
      this.$toRouter('/pages/webview/webview', `src=${encodeURIComponent(this.link)}`);
    },

    toggleSwitch() {
      if (!this.reminderData.is_wx_subscribed) {
        uni.showToast({
          title: '请先开启提醒',
          icon: 'none',
        });
      }
    },

    onChange1($event) {
      this.reminderData.is_diet_remind_enabled = $event.detail.value;
      this.updateReminderData();
    },

    onChange2($event) {
      this.reminderData.is_exercise_remind_enabled = $event.detail.value;
      this.updateReminderData();
    },

    /**
     * 更新订阅状态
     */
    updateReminderData() {
      $http
        .post('api/user/profile/update-remind-settings', {
          is_diet_remind_enabled: this.reminderData.is_diet_remind_enabled,
          is_exercise_remind_enabled: this.reminderData.is_exercise_remind_enabled,
        })
        .then(() => {
          uni.showToast({
            title: '操作成功',
            icon: 'none',
          });
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
.set-reminder-page {
  .page-title {
    background: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: #ffffff;
  }

  .container {
    padding: 20rpx 30rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .reminder-item {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 22rpx 20rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .left {
        font-size: 28rpx;
        color: #1a1a1a;
        display: flex;
        flex-direction: column;
        gap: 22rpx;

        text {
          &:nth-child(2) {
            font-size: 22rpx;
            color: #999999;
          }
        }
      }

      .right {
        width: 135rpx;
        height: 55rpx;
        background: #f2fff4;
        border-radius: 28rpx;
        border: 1px solid #0abf92;
        font-size: 24rpx;
        color: #0abf92;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
