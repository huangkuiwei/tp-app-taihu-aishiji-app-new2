<template>
  <view class="data-report-page">
    <view class="page-title">
      <text>数据报告</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="nav-tab">
      <view
        class="nav-item"
        :class="{ active: selectedTime.id === item.id }"
        v-for="item of timeList"
        :key="item.id"
        @click="selectedTime = item"
      >
        <text class="name">{{ item.name }}</text>
        <text class="highlight" v-if="selectedTime.id === item.id" />
      </view>
    </view>

    <view class="data-detail">
      <view class="data-item">
        <view class="data-title">
          <text>身体指标</text>
          <text>共{{ dataReport.weight_record_days }}天</text>
        </view>

        <view class="data-info">
          <view class="data-info-item">
            <view class="info-title">体重</view>

            <template v-if="dataReport.weight_list && dataReport.weight_list.length">
              <view class="change-list">
                <view class="day1">
                  <text>{{ firstDay.weight }}公斤</text>
                  <text>{{ firstDay.date_time.slice(5, 10) }}</text>
                </view>

                <view class="line"></view>

                <view class="day2">
                  <text>{{ lastDay.weight }}公斤</text>
                  <text>{{ lastDay.date_time.slice(5, 10) }}</text>
                </view>
              </view>
            </template>

            <view v-else class="empty-recode">
              <text>暂无记录</text>
            </view>
          </view>

          <view class="data-info-item">
            <view class="info-title">BMI</view>

            <template v-if="dataReport.weight_list && dataReport.weight_list.length">
              <view class="change-list">
                <view class="day1">
                  <text>{{ firstDay.bmi }}</text>
                  <text>{{ firstDay.date_time.slice(5, 10) }}</text>
                </view>

                <view class="line"></view>

                <view class="day2">
                  <text>{{ lastDay.bmi }}</text>
                  <text>{{ lastDay.date_time.slice(5, 10) }}</text>
                </view>
              </view>

              <view class="summary">
                <text v-if="firstDay.weight === lastDay.weight">{{ selectedTime.name }}体重无明显变化</text>
                <text v-else-if="firstDay.weight > lastDay.weight">
                  {{ selectedTime.name }}体重减少{{ Number((firstDay.weight - lastDay.weight).toFixed(2)) }}KG
                </text>
                <text v-else>
                  {{ selectedTime.name }}体重增加{{ Number((lastDay.weight - firstDay.weight).toFixed(2)) }}KG
                </text>
              </view>
            </template>

            <view v-else class="empty-recode">
              <text>暂无记录</text>
            </view>
          </view>
        </view>
      </view>

      <view class="data-item">
        <view class="data-title">
          <text>饮食</text>
          <text>共{{ dataReport.meal_record_days }}天</text>
        </view>

        <view class="data-info">
          <view class="data-info-item">
            <view class="info-title">平均摄入</view>

            <view class="change-list1">
              <view class="day1">
                <text class="time">{{ selectedTime.name }}</text>
                <text class="progress"></text>
                <text class="number">{{ dataReport.calorie_average }}千卡</text>
              </view>

              <view class="day2">
                <text class="time">{{ selectedTime.preName }}</text>
                <text class="number">{{ dataReport.previous_calorie_average }}千卡</text>
              </view>
            </view>

            <view class="summary">
              {{ selectedTime.name }}平均摄入热量{{ dataReport.calorie_average }}千卡，最高的一天摄入{{
                dataReport.calorie_max
              }}千卡
            </view>
          </view>

          <view class="data-info-item">
            <view class="info-title">食物种类</view>

            <view class="change-list1">
              <view class="day1">
                <text class="time">{{ selectedTime.name }}</text>
                <text class="progress"></text>
                <text class="number">{{ dataReport.food_num }}种</text>
              </view>

              <view class="day2">
                <text class="time">{{ selectedTime.preName }}</text>
                <text class="number">{{ dataReport.previous_food_num }}种</text>
              </view>
            </view>

            <view class="summary">{{ selectedTime.name }}摄入食物{{ dataReport.food_num }}种</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'dataReport',

  data() {
    return {
      dataReport: {},
      timeList: [
        {
          id: 1,
          name: '本周',
          value: 1,
          preName: '上周',
        },
        {
          id: 2,
          name: '本月',
          value: 2,
          preName: '上月',
        },
        {
          id: 3,
          name: '近三个月',
          value: 3,
          preName: '上三个月',
        },
        {
          id: 4,
          name: '近半年',
          value: 4,
          preName: '上半年',
        },
      ],
      selectedTime: {},
    };
  },

  computed: {
    firstDay() {
      return this.dataReport.weight_list && this.dataReport.weight_list[0];
    },

    lastDay() {
      return this.dataReport.weight_list && this.dataReport.weight_list[this.dataReport.weight_list.length - 1];
    },
  },

  watch: {
    selectedTime() {
      this.getDataReport();
    },
  },

  onLoad() {
    this.selectedTime = this.timeList[0];
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    getDataReport() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/data-report', {
          report_type: this.selectedTime.value,
        })
        .then((res) => {
          uni.hideLoading();
          this.dataReport = res.data;
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
.data-report-page {
  .page-title {
    background: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: #ffffff;
  }

  .nav-tab {
    background: #ffffff;
    padding: 48rpx 56rpx 32rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .nav-item {
      position: relative;

      &.active {
        .name {
          color: #1a1a1a;
        }
      }

      .name {
        color: #999999;
        font-size: 30rpx;
        position: relative;
        z-index: 1;
      }

      .highlight {
        position: absolute;
        left: 0;
        right: 0;
        bottom: -2rpx;
        height: 12rpx;
        background: #0abf92;
        border-radius: 6rpx;
      }
    }
  }

  .data-detail {
    padding: 40rpx 30rpx;

    .data-item {
      margin-bottom: 44rpx;

      .data-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28rpx;

        text {
          &:nth-child(1) {
            font-weight: 500;
            font-size: 30rpx;
            color: #1a1a1a;
          }

          &:nth-child(2) {
            font-size: 24rpx;
            color: #333333;
          }
        }
      }

      .data-info {
        background: #ffffff;
        border-radius: 20rpx;
        padding: 30rpx 25rpx;
        display: flex;
        flex-direction: column;
        gap: 44rpx;

        .data-info-item {
          .info-title {
            padding-left: 30rpx;
            font-size: 24rpx;
            color: #999999;
            margin-bottom: 30rpx;
            position: relative;

            &::after {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              width: 10rpx;
              height: 26rpx;
              background: #0abf92;
              border-radius: 5rpx;
            }
          }

          .change-list {
            background: #f5f6fa;
            border-radius: 10rpx;
            padding: 30rpx 52rpx;
            display: flex;
            align-items: center;

            .day1,
            .day2 {
              flex-shrink: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;

              text {
                &:nth-child(1) {
                  font-size: 28rpx;
                  color: #1a1a1a;
                  margin-bottom: 20rpx;
                }

                &:nth-child(2) {
                  font-size: 26rpx;
                  color: #666666;
                }
              }
            }

            .line {
              flex-grow: 1;
              border-top: 2rpx dashed #cbe1ff;
              margin: 0 40rpx;
            }
          }

          .change-list1 {
            background: #f5f6fa;
            border-radius: 10rpx;
            padding: 30rpx 52rpx;
            display: flex;
            flex-direction: column;
            gap: 16rpx;

            .day1 {
              display: flex;
              align-items: center;
              font-size: 28rpx;
              color: #1a1a1a;

              .time {
                flex-shrink: 0;
                white-space: nowrap;
              }

              .progress {
                flex-grow: 1;
                width: 317rpx;
                height: 10rpx;
                background: #cbe1ff;
                border-radius: 5rpx;
                margin: 0 34rpx;
              }

              .number {
                flex-shrink: 0;
                white-space: nowrap;
              }
            }

            .day2 {
              font-size: 26rpx;
              color: #666666;

              .time {
                margin-right: 40rpx;
              }
            }
          }

          .summary {
            margin-top: 32rpx;
            font-size: 25rpx;
            color: #666666;
          }
        }
      }
    }
  }
}

.empty-recode {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #aaaaaa;
  padding: 30rpx 0;
}
</style>
