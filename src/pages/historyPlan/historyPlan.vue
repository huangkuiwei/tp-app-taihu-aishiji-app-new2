<template>
  <view class="history-plan-page">
    <view class="page-title">
      <text>历史方案</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="current-plan">
      <view class="plan-title">当前方案</view>

      <view class="plan-box-wrap">
        <view class="plan-box" v-for="item of historyPlanList.filter((x) => x.state === 1)" :key="item.plan_id">
          <view class="data">
            <view class="progress">
              <text :style="{ width: item.progress + '%' }"></text>
            </view>

            <view class="time">
              <text>{{ item.start_date.slice(0, 10) }}</text>
              <text>{{ item.end_date.slice(0, 10) }}</text>
            </view>

            <view class="value">
              <view class="value-item">
                <text>初始</text>
                <text>{{ item.plan_initial_weight }}公斤</text>
              </view>

              <view class="value-item">
                <text>{{ isWeightLoss(item) ? '已减重' : '已增重' }}</text>
                <text>{{ isWeightLoss(item) ? item.loss_weight : -item.loss_weight }}公斤</text>
              </view>

              <view class="value-item">
                <text>目标</text>
                <text>{{ item.plan_target_weight }}公斤</text>
              </view>
            </view>
          </view>

          <view class="tip" @click="$toBack()">
            <text class="progress-tip">最新体重{{ item.current_weight }}公斤，当前进度{{ item.progress }}%</text>
            <uni-icons class="back" color="#999999" type="right" size="18"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <view class="history-plan">
      <view class="plan-title">历史方案</view>

      <view class="plan-box-wrap">
        <view class="plan-box" v-for="item of historyPlanList.filter((x) => x.state !== 1)" :key="item.plan_id">
          <view class="data">
            <view class="progress">
              <text :style="{ width: item.progress + '%' }"></text>
            </view>

            <view class="time">
              <text>{{ item.start_date.slice(0, 10) }}</text>
              <text>{{ item.end_date.slice(0, 10) }}</text>
            </view>

            <view class="value">
              <view class="value-item">
                <text>初始</text>
                <text>{{ item.plan_initial_weight }}公斤</text>
              </view>

              <view class="value-item">
                <text>{{ isWeightLoss(item) ? '已减重' : '已增重' }}</text>
                <text>{{ isWeightLoss(item) ? item.loss_weight : -item.loss_weight }}公斤</text>
              </view>

              <view class="value-item">
                <text>目标</text>
                <text>{{ item.plan_target_weight }}公斤</text>
              </view>
            </view>
          </view>

          <view class="tip" @click="previewPlan(item)">
            <text class="progress-tip">方案结束时体重：{{ item.current_weight }}公斤</text>
            <uni-icons class="back" color="#999999" type="right" size="18"></uni-icons>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'historyPlan',

  data() {
    return {
      historyPlanList: [],
    };
  },

  computed: {
    isWeightLoss() {
      return (plan) => {
        return plan.plan_initial_weight - plan.plan_target_weight > 0;
      };
    },
  },

  onShow() {
    this.getHistoryPlanList();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    getHistoryPlanList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/weight-plan/history', {
          pageIndex: 1,
          pageSize: 9999,
        })
        .then((res) => {
          uni.hideLoading();

          res.data.Items.forEach((item) => {
            // 计算已减体重和进度
            item.loss_weight = Number((item.plan_initial_weight - item.current_weight).toFixed(2));
            item.progress = ((item.loss_weight / (item.plan_initial_weight - item.plan_target_weight)) * 100).toFixed(
              2,
            );

            if (item.progress > 100) {
              item.progress = 100;
            } else if (item.progress < 0) {
              item.progress = 0;
            }
          });

          this.historyPlanList = res.data.Items;
        });
    },

    previewPlan(item) {
      uni.setStorageSync('lastPlanData', item);
      this.$toRouter('/pages/historyWeightManagementPlan/historyWeightManagementPlan', `plan_id=${item.plan_id}`);
    },
  },
};
</script>

<style lang="scss">
page {
  background: #f6f7fb;
}
</style>

<style scoped lang="scss">
.history-plan-page {
  .page-title {
    background: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: #ffffff;
  }

  .current-plan,
  .history-plan {
    &.current-plan {
      margin-top: 38rpx;
    }

    padding: 0 30rpx;
    position: relative;
    margin-bottom: 52rpx;

    &.current-plan {
      &::after {
        content: '';
        position: absolute;
        left: 30rpx;
        top: 10rpx;
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background: #0abf92;
      }
    }

    &.history-plan {
      &::after {
        content: '';
        position: absolute;
        left: 30rpx;
        top: 10rpx;
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background: #d0d0d0;
      }
    }

    .plan-title {
      font-weight: 500;
      font-size: 30rpx;
      color: #1a1a1a;
      padding-left: 30rpx;
      margin-bottom: 30rpx;
    }

    .plan-box-wrap {
      .plan-box {
        background: #ffffff;
        border-radius: 20rpx;

        &:not(:last-child) {
          margin-bottom: 20rpx;
        }

        .data {
          padding: 30rpx 25rpx 44rpx;

          .progress {
            width: 100%;
            height: 15rpx;
            background: #f6f7fb;
            border-radius: 8rpx;
            position: relative;
            margin-bottom: 22rpx;

            text {
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              background: #0abf92;
              border-radius: 8rpx;
            }
          }

          .time {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 50rpx;

            text {
              font-size: 24rpx;
              color: #999999;
            }
          }

          .value {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 90rpx;

            .value-item {
              &:nth-child(1),
              &:nth-child(3) {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 30rpx;

                text {
                  &:nth-child(1) {
                    width: 97rpx;
                    height: 48rpx;
                    background: #eeeeee;
                    border-radius: 10rpx;
                    font-size: 26rpx;
                    color: #333333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }

                  &:nth-child(2) {
                    font-weight: 500;
                    font-size: 32rpx;
                    color: #1a1a1a;
                  }
                }
              }

              &:nth-child(2) {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 30rpx;

                text {
                  &:nth-child(1) {
                    width: 97rpx;
                    height: 48rpx;
                    background: #f2fff4;
                    border-radius: 10rpx;
                    border: 1px solid #0abf92;
                    font-size: 26rpx;
                    color: #0abf92;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }

                  &:nth-child(2) {
                    font-weight: 500;
                    font-size: 32rpx;
                    color: #0abf92;
                  }
                }
              }
            }
          }
        }

        .tip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 30rpx 23rpx;
          border-top: 2rpx solid #efeff1;

          .progress-tip {
            font-size: 26rpx;
            color: #333333;
          }
        }
      }
    }
  }
}
</style>
