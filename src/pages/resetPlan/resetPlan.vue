<template>
  <view class="reset-plan-page">
    <view class="page-title">
      <text>重置方案</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="setting-list">
      <view class="box">
        <view class="item">
          <text class="label">目标体重</text>

          <picker mode="selector" :range="rulerLineList" :value="planData.plan_target_weight" @change="onWeightChange">
            <view class="value">
              <text class="filed">{{ rulerLineList[planData.plan_target_weight] }}公斤</text>
              <uni-icons class="back" color="#999999" type="right" size="18"></uni-icons>
            </view>
          </picker>
        </view>
      </view>

      <view class="evaluation">
        <calendar
          ref="calendarRef"
          :initialWeight="initialWeight"
          :targetWeight="targetWeight"
          @selectDayChange="onSelectDayChange"
        />

        <view class="expected-wrap">
          <view class="expected" v-if="planData1">
            <view class="line1">
              <view class="left">
                预计
                <text>{{ planData1.week }}</text>
                周
              </view>

              <view class="right">
                每周{{ isWeightLoss ? '减重' : '增重' }}约
                <text>{{ planData1.weight }}</text>
                公斤
              </view>
            </view>

            <view class="line2" v-if="planData1.weight > 0.7">
              <text>困难模式：</text>
              <text v-if="isWeightLoss">快速减重可能会导致营养不良、肌肉流失和新陈代谢问题</text>
              <text v-else>增重速度过快，这可能会增加体内脂肪比例，对心脏和代谢健康产生不利影响。</text>
            </view>

            <view class="line2" v-else-if="planData1.weight > 0.28">
              <text>适中模式：</text>
              <text>适合绝大多数人，你一也定可以的！ 加油！</text>
            </view>

            <view class="line2" v-else>
              <text>简单模式：</text>
              <text>适合绝大多数人，你一也定可以的！ 加油！</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="submit-btn" @click="resetPlan">重置计划</view>
  </view>
</template>

<script>
import $http from '@/utils/http';
import Calendar from '@/components/calendar.vue';

export default {
  name: 'resetPlan',

  components: {
    Calendar,
  },

  data() {
    let rulerLineList = [];

    for (let i = 30; i < 301; i++) {
      rulerLineList.push(i);
    }

    return {
      targetWeight: null,
      initialWeight: null,
      rulerLineList,
      planData: {},
      planData1: {},
    };
  },

  computed: {
    isWeightLoss() {
      return this.initialWeight - this.targetWeight > 0;
    },
  },

  onLoad(options) {
    let plan_target_weight = this.rulerLineList.findIndex((item) => item === Number(options.plan_target_weight));
    let end_date = options.end_date.slice(0, 10);
    let start_date = options.start_date.slice(0, 10);

    this.initialWeight = options.plan_initial_weight;
    this.targetWeight = options.plan_target_weight;

    this.planData = {
      plan_id: options.plan_id,
      plan_initial_weight: options.plan_initial_weight,
      plan_target_weight: plan_target_weight,
      end_date: end_date,
      start_date: start_date,
    };

    this.$refs.calendarRef.currentDate = new Date(options.end_date.replace(/-/g, '/')).getTime();

    let currentDate = new Date(this.$refs.calendarRef.currentDate);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1 > 9 ? currentDate.getMonth() + 1 : `0${currentDate.getMonth() + 1}`;
    const date = currentDate.getDate() > 9 ? currentDate.getDate() : `0${currentDate.getDate()}`;

    this.$refs.calendarRef.selectedDate = `${year}/${month}/${date}`;
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    onWeightChange($event) {
      this.planData.plan_target_weight = $event.detail.value;
      this.targetWeight = this.rulerLineList[this.planData.plan_target_weight];
      this.onSelectDayChange();
    },

    onSelectDayChange() {
      if (this.$refs.calendarRef) {
        let selectedDate = this.$refs.calendarRef.selectedDate;

        let now = Date.now();
        let selectDate = new Date(selectedDate).getTime();
        let day = Math.ceil((selectDate - now) / (1000 * 60 * 60 * 24));
        let week = day / 7;

        this.planData1 = {
          day,
          week: Number(week.toFixed(1)),
          weight: Number((Math.abs(this.initialWeight - this.targetWeight) / week).toFixed(2)),
        };
      }
    },

    resetPlan() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/weight-plan/update', {
          plan_id: this.planData.plan_id,
          target_weight: this.rulerLineList[this.planData.plan_target_weight],
          end_date: new Date(this.$refs.calendarRef.selectedDate).format(),
        })
        .then(() => {
          uni.hideLoading();

          uni.showToast({
            title: '操作成功',
            icon: 'none',
            mask: true,
          });

          setTimeout(() => {
            this.$toBack();
          }, 1000);
        });
    },
  },
};
</script>

<style lang="scss">
page {
  background: #f6f7fb;
  height: 100%;
}
</style>

<style scoped lang="scss">
.reset-plan-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-title {
    background: #ffffff;
  }

  .banner {
    flex-shrink: 0;
    padding: calc(var(--page-title-height)) 0 0;
    background: #ffffff;
  }

  .setting-list {
    flex-grow: 1;
    padding: 20rpx 30rpx 0;

    .box {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 30rpx 24rpx;
      margin-bottom: 20rpx;

      .item {
        display: flex;
        align-items: center;

        &:not(:last-child) {
          padding-bottom: 30rpx;
          margin-bottom: 30rpx;
          border-bottom: 1px solid #f6f7fb;
        }

        .label {
          font-size: 28rpx;
          color: #1a1a1a;
          flex-grow: 1;
        }

        picker {
          .value {
            display: flex;
            align-items: center;

            .filed {
              font-size: 26rpx;
              color: #666666;
              margin-right: 10rpx;
            }
          }
        }
      }
    }

    .evaluation {
      width: 100%;
      background: #ffffff;
      padding: 40rpx 20rpx;
      border-radius: 20rpx;
      margin-top: 20rpx;

      .expected-wrap {
        .expected {
          margin-top: 20rpx;
          background: #ffffff;
          border-radius: 25rpx;
          border: 2px solid #0abf92;
          padding: 32rpx;

          .line1 {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 500;
            font-size: 28rpx;
            color: #1a1a1a;
            margin-bottom: 40rpx;

            view {
              display: flex;
              align-items: center;

              text {
                height: 60rpx;
                padding: 0 16rpx;
                background: #0abf92;
                border-radius: 10rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 42rpx;
                color: #ffffff;
                margin: 0 6rpx;
              }
            }
          }

          .line2 {
            color: #1a1a1a;
            font-size: 28rpx;
            line-height: 40rpx;

            text {
              &:nth-child(1) {
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }

  .submit-btn {
    width: 592rpx;
    margin: 0 auto 100rpx;
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
</style>
