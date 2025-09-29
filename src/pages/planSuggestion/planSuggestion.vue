<template>
  <view class="plan-suggestion-page">
    <view class="page-title">
      <text>方案建议</text>

      <view class="back" @click="$toSwitch('/pages/index/index')">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="suggest-box-wrap">
      <view class="suggest-box">
        <view class="title">您的专属计划已生成！</view>

        <view class="head">
          <image
            class="head-img"
            mode="aspectFill"
            :src="
              userInfo.avatar_url || 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/my/default_head.png'
            "
          />

          <view class="suggest-list">
            <view class="suggest-item suggest-item1">
              <image
                mode="widthFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/planSuggestion/dialog01.png"
              />

              <text>BMI {{ planSuggestion.plan_initial_bmi }}</text>
            </view>

            <view class="suggest-item suggest-item2">
              <image
                mode="widthFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/planSuggestion/dialog02.png"
              />

              <text>身高 {{ planSuggestion.height }}cm</text>
            </view>

            <view class="suggest-item suggest-item3">
              <image
                mode="widthFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/planSuggestion/dialog03.png"
              />

              <text>基础代谢 {{ planSuggestion.plan_initial_bmr }}</text>
            </view>

            <view class="suggest-item suggest-item4">
              <image
                mode="widthFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/planSuggestion/dialog04.png"
              />

              <text>体重 {{ planSuggestion.current_weight }}公斤</text>
            </view>
          </view>
        </view>

        <view class="info">
          <view class="bmi">初始BMI值为：{{ planSuggestion.plan_initial_bmi }}</view>

          <view class="info1">
            <view>
              根据您的身高体重测算，推荐BMI范围：
              <text>18.5-24.9</text>
            </view>

            <view>
              您的标准体重区间为
              <text>{{ weightData.min }}公斤——{{ weightData.max }}公斤</text>
            </view>

            <view>
              您大概需要
              <text>{{ Math.ceil(planDays / 7) }}周（{{ planDays }}天）</text>
              时间达成目标
            </view>
          </view>
        </view>

        <view class="suggest-list2">
          <view class="suggest-item">
            <view class="suggest-title">建议每日热量缺口</view>
            <view class="unit">
              <text>200</text>
              千卡
            </view>
          </view>

          <view class="suggest-item">
            <view class="suggest-title">建议运动频率</view>
            <view class="unit">
              <text>2-3次</text>
              /每周
            </view>
          </view>

          <view class="suggest-item">
            <view class="suggest-title">建议饮食节奏</view>
            <view class="unit">
              <text>12+10</text>
              轻断食
            </view>
          </view>

          <view class="suggest-item">
            <view class="suggest-title">建议饮食习惯</view>
            <view class="unit">
              <text>少油少盐</text>
            </view>
          </view>
        </view>

        <view class="countdown">
          <view class="countdown-title">计划剩余时间</view>

          <view class="time">
            <text class="number" v-for="(item, index) of countdownDays" :key="index">{{ item }}</text>
            <text class="unit">天</text>
            <text class="number" v-for="(item, index) of countdownHours" :key="index">{{ item }}</text>
            <text class="unit">小时</text>
            <text class="number" v-for="(item, index) of countdownMinutes" :key="index">{{ item }}</text>
            <text class="unit">分钟</text>
          </view>
        </view>

        <view class="submit-btn" @click="submit">开启好身材计划</view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'planSuggestion',

  data() {
    return {
      planSuggestion: {},
      countdownDays: '',
      countdownHours: '',
      countdownMinutes: '',
    };
  },

  computed: {
    ...mapState('app', ['userInfo']),
    ...mapGetters('app', ['isVip']),

    weightData() {
      return {
        min: Number((((this.planSuggestion.height * this.planSuggestion.height) / 10000) * 18.5).toFixed(1)),
        max: Number((((this.planSuggestion.height * this.planSuggestion.height) / 10000) * 24.9).toFixed(1)),
      };
    },

    planDays() {
      let end_date = this.planSuggestion.end_date && this.planSuggestion.end_date.replace(/-/g, '/');
      let start_date = this.planSuggestion.start_date && this.planSuggestion.start_date.replace(/-/g, '/');

      let diff = new Date(end_date).getTime() - new Date(start_date).getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      const hours = Math.floor(minutes / 60);

      return Math.ceil(hours / 24);
    },
  },

  onLoad() {
    this.planSuggestion = uni.getStorageSync('planSuggestion');
    console.log('this.planSuggestion', this.planSuggestion);

    this.countDown();

    setInterval(() => {
      this.countDown();
    }, 2000);
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    countDown() {
      let end_date = this.planSuggestion.end_date && this.planSuggestion.end_date.replace(/-/g, '/');
      let diff = new Date(end_date).getTime() - new Date().getTime();

      const minutes = Math.floor(diff / 1000 / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      const remainingMinutes = minutes % 60;

      this.countdownDays = days.toString();
      this.countdownHours = remainingHours.toString();
      this.countdownMinutes = remainingMinutes.toString();
    },

    submit() {
      if (this.isVip) {
        this.$toRouter('/pages/weightManagementPlan/weightManagementPlan');
      } else {
        this.$toRouter('/pages/vip/vip');
      }
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
.plan-suggestion-page {
  height: 100%;
  overflow: auto;
  padding-bottom: 240rpx;
  background: linear-gradient(180deg, rgba(204, 255, 238, 0.9) 0%, rgba(251, 255, 255, 0.93) 27%, #f6f7fb 100%);

  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
  }

  .suggest-box-wrap {
    padding: 60rpx 30rpx 0;

    .suggest-box {
      background: #ffffff;
      border-radius: 25rpx;
      padding: 38rpx 30rpx;

      .title {
        font-weight: 500;
        font-size: 32rpx;
        color: #333333;
        text-align: center;
        margin-bottom: 115rpx;
      }

      .head {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 60rpx;

        .head-img {
          width: 148rpx;
          height: 148rpx;
          border-radius: 50%;
        }

        .suggest-list {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;

          .suggest-item {
            text {
              position: absolute;
              left: 0;
              right: 0;
              top: 0;
              bottom: 20rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24rpx;
              color: #ffffff;
            }
          }

          .suggest-item1 {
            position: absolute;
            left: 114rpx;
            top: -60rpx;

            image {
              width: 144rpx;
            }
          }

          .suggest-item2 {
            position: absolute;
            right: 114rpx;
            top: -60rpx;

            image {
              width: 154rpx;
            }
          }

          .suggest-item3 {
            position: absolute;
            left: 47rpx;
            bottom: 12rpx;

            image {
              width: 190rpx;
            }
          }

          .suggest-item4 {
            position: absolute;
            right: 47rpx;
            bottom: 12rpx;

            image {
              width: 184rpx;
            }
          }
        }
      }

      .info {
        .bmi {
          font-weight: 500;
          font-size: 28rpx;
          color: #1a1a1a;
          margin-bottom: 22rpx;
        }

        .info1 {
          font-size: 22rpx;
          color: #999999;

          view {
            margin-bottom: 20rpx;

            text {
              color: #ffa537;
            }
          }
        }
      }

      .suggest-list2 {
        margin-bottom: 56rpx;

        .suggest-item {
          background: #eff5fe;
          border-radius: 25rpx;
          padding: 30rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;

          &:not(:last-child) {
            margin-bottom: 12rpx;
          }

          &:nth-child(1) {
            background: #eff5fe;
          }

          &:nth-child(2) {
            background: #fffae1;
          }

          &:nth-child(3) {
            background: #fef4f3;
          }

          &:nth-child(4) {
            background: #e4fff7;
          }

          .suggest-title {
            font-size: 28rpx;
            color: #555555;
          }

          .unit {
            font-weight: 500;
            font-size: 24rpx;
            color: #555555;

            text {
              font-size: 36rpx;
              color: #ffa537;
            }
          }
        }
      }

      .countdown {
        .countdown-title {
          font-size: 22rpx;
          color: #999999;
          text-align: center;
          margin-bottom: 36rpx;
        }

        .time {
          display: flex;
          align-items: center;
          justify-content: center;

          .number {
            width: 55rpx;
            height: 70rpx;
            background: #0abf92;
            border-radius: 10rpx;
            font-weight: bold;
            font-size: 45rpx;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 5rpx;
          }

          .unit {
            font-size: 22rpx;
            color: #999999;
            margin: 0 5rpx;
          }
        }
      }

      .submit-btn {
        position: fixed;
        bottom: 80rpx;
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
    }
  }
}
</style>
