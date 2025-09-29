<template>
  <view class="evaluation-page">
    <view class="page-title">
      <text>创建计划</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="evaluation-container">
      <view class="evaluation-box">
        <view class="evaluation evaluation2" v-if="stepIndex === 0">
          <view class="evaluation-item">
            <view class="evaluation-item-title">目标体重</view>

            <view class="evaluation-tip">
              <text>推荐体重：{{ weightData.min }}千克-{{ weightData.max }}千克；请选择合理体重。</text>
            </view>

            <view class="evaluation-item-value">
              <text v-if="targetWeight">{{ targetWeight }}</text>
              <text class="unit">公斤</text>
            </view>

            <view class="scale"></view>

            <scroll-view
              class="ruler-line"
              :scroll-into-view="initPosition3"
              :scroll-x="true"
              :enable-flex="true"
              @scroll="onScroll3"
            >
              <view
                :id="`ruler3-${item}`"
                class="ruler-line-item"
                :class="{ 'int-line': item % 10 === 0 }"
                v-for="item of rulerLineList3"
                :key="item"
              >
                <text v-if="item && item % 10 === 0">{{ item }}</text>
              </view>
            </scroll-view>
          </view>
        </view>

        <view class="evaluation evaluation3" v-if="stepIndex === 1">
          <calendar
            ref="calendarRef"
            :initialWeight="userDetailInfo.current_weight"
            :targetWeight="targetWeight"
            @selectDayChange="onSelectDayChange"
          />

          <view class="expected-wrap">
            <view class="expected" v-if="planData">
              <view class="line1">
                <view class="left">
                  预计
                  <text>{{ planData.week }}</text>
                  周
                </view>

                <view class="right">
                  每周{{ isWeightLoss ? '减重' : '增重' }}约
                  <text>{{ planData.weight }}</text>
                  公斤
                </view>
              </view>

              <view class="line2" v-if="planData.weight > 0.7">
                <text>困难模式：</text>
                <text v-if="isWeightLoss">快速减重可能会导致营养不良、肌肉流失和新陈代谢问题</text>
                <text v-else>增重速度过快，这可能会增加体内脂肪比例，对心脏和代谢健康产生不利影响。</text>
              </view>

              <view class="line2" v-else-if="planData.weight > 0.28">
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

        <view class="next" @click="next">{{ stepIndex > 0 ? '生成方案' : '继续' }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Calendar from '@/components/calendar.vue';
import $http from '@/utils/http';

export default {
  name: 'evaluation',

  components: {
    Calendar,
  },

  data() {
    let rulerLineList2 = [];
    let rulerLineList3 = [];

    for (let i = 0; i < 305; i++) {
      rulerLineList2.push(i);
      rulerLineList3.push(i);
    }

    return {
      stepIndex: 0,
      gender: null,
      targetWeight: null,
      initPosition3: null,
      rulerLineList2: rulerLineList2,
      rulerLineList3: rulerLineList3,
      planData: null,
    };
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),

    isWeightLoss() {
      return this.userDetailInfo.current_weight - this.target_weight > 0;
    },

    weightData() {
      return {
        min: Number((((this.userDetailInfo.height * this.userDetailInfo.height) / 10000) * 18.5).toFixed(1)),
        max: Number((((this.userDetailInfo.height * this.userDetailInfo.height) / 10000) * 24.9).toFixed(1)),
      };
    },
  },

  onShow() {
    uni.showLoading({
      title: '加载中...',
      mask: true,
    });

    this._getUserDetailInfo().then(() => {
      uni.hideLoading();

      this.targetWeight = this.userDetailInfo.target_weight;
      this.initPosition3 = `ruler3-${this.targetWeight - 20}`;
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    ...mapActions('app', ['_getUserDetailInfo']),

    next() {
      if (this.stepIndex === 0) {
        setTimeout(() => {
          let weight = Math.abs(this.userDetailInfo.current_weight - this.targetWeight);
          this.$refs.calendarRef.currentDate = Date.now() + 7 * 24 * 60 * 60 * 1000 * Math.ceil(weight / 0.5);

          let currentDate = new Date(this.$refs.calendarRef.currentDate);

          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1 > 9 ? currentDate.getMonth() + 1 : `0${currentDate.getMonth() + 1}`;
          const date = currentDate.getDate() > 9 ? currentDate.getDate() : `0${currentDate.getDate()}`;

          this.$refs.calendarRef.selectedDate = `${year}/${month}/${date}`;
        }, 0);
      }

      if (this.stepIndex === 1) {
        uni.showLoading({
          title: '加载中...',
          mask: true,
        });

        $http
          .post('api/diet-info/weight-plan/add', {
            target_weight: this.targetWeight,
            end_date: new Date(this.$refs.calendarRef.selectedDate).format(),
          })
          .then((res) => {
            uni.hideLoading();

            uni.setStorageSync('planSuggestion', res.data);
            this.$toRouter('/pages/planSuggestion/planSuggestion');
          });

        return;
      }

      this.stepIndex += 1;
    },

    onScroll3(event) {
      this.targetWeight = Math.round((event.detail.scrollLeft / 61) * 10) + 20;
    },

    onSelectDayChange() {
      if (this.$refs.calendarRef) {
        let selectedDate = this.$refs.calendarRef.selectedDate;

        let now = Date.now();
        let selectDate = new Date(selectedDate).getTime();
        let day = Math.ceil((selectDate - now) / (1000 * 60 * 60 * 24));
        let week = day / 7;

        this.planData = {
          day,
          week: Number(week.toFixed(1)),
          weight: Number((Math.abs(this.userDetailInfo.current_weight - this.targetWeight) / week).toFixed(2)),
        };
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
.evaluation-page {
  height: 100%;
  background: linear-gradient(to bottom, #ccffee, #fbffff, #f6f7fb);
  padding-bottom: 40rpx;
  display: flex;
  flex-direction: column;

  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    flex-shrink: 0;
  }

  .evaluation-container {
    padding: 60rpx 30rpx 0;
    flex-grow: 1;
    overflow: hidden;

    .evaluation-box {
      height: 100%;
      padding: 52rpx 30rpx;
      background: #ffffff;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .evaluation {
        flex-grow: 1;
      }

      .evaluation2 {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        .evaluation-item {
          position: relative;

          .evaluation-item-title {
            font-weight: 500;
            font-size: 26rpx;
            color: #1a1a1a;
            text-align: center;
            padding-left: 16px;
            margin-bottom: 14rpx;
          }

          .evaluation-tip {
            font-size: 22rpx;
            color: #bfbfbf;
            text-align: center;
            margin-bottom: 14rpx;
          }

          .evaluation-item-value {
            font-weight: 500;
            font-size: 30rpx;
            color: #333333;
            text-align: center;
            padding-left: 16px;
            margin-bottom: 22rpx;

            .unit {
              color: #666666;
              font-size: 24rpx;
              margin-left: 4rpx;
            }
          }

          .scale {
            position: absolute;
            width: 4px;
            height: 15px;
            background: #0abf92;
            border-radius: 4rpx;
            top: 120rpx;
            left: calc(50% - 1px);
          }

          .ruler-line {
            display: flex;
            width: 244px;
            margin: 0 auto;
            overflow: auto;

            .ruler-line-item {
              flex-shrink: 0;
              margin-right: 5px;
              width: 1px;
              height: 17px;
              background: #0abf9240;
              border-radius: 2rpx;
              position: relative;

              &.int-line {
                width: 2px;
                height: 33px;
                background: #0abf92aa;
              }

              text {
                position: absolute;
                left: 0;
                right: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                bottom: -40rpx;
                font-size: 22rpx;
                color: #666666;
              }
            }
          }
        }
      }

      .evaluation3 {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        .expected-wrap {
          .expected {
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

      .next {
        flex-shrink: 0;
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
