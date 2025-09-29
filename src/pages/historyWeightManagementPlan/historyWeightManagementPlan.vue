<template>
  <view class="weight-management-plan-page">
    <view class="page-title">
      <text>体重管理方案</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="plan-box">
      <view class="plan-title">我的定制体重管理方案</view>
      <view class="plan-tip">
        <text>目标在</text>
        <text>{{ lastPlanData.end_date && lastPlanData.end_date.slice(0, 10) }}</text>
        <text>达到</text>
        <text>{{ lastPlanData.plan_target_weight }}KG</text>
      </view>

      <view class="chart-box">
        <view class="chart-item1">
          <view class="chart-title">
            <text>初始BMI值为：{{ lastPlanData.plan_initial_bmi }}</text>
          </view>

          <view class="chart-title">
            <text>初始体重值为：{{ lastPlanData.plan_initial_weight }}KG</text>
          </view>

          <view class="chart-title">
            <text>当前体重值为：{{ lastPlanData.current_weight }}KG</text>
          </view>

          <view class="chart-title">
            <text style="color: #ffa537">
              {{ isWeightLoss ? '已减重：' : '已增重：' }}
              <template v-if="isWeightLoss">
                {{ Number((lastPlanData.plan_initial_weight - lastPlanData.current_weight).toFixed(2)) }}KG
              </template>

              <template v-else>
                {{ -Number((lastPlanData.plan_initial_weight - lastPlanData.current_weight).toFixed(2)) }}KG
              </template>
            </text>
          </view>

          <view class="chart-tip">
            根据您的身高体重测算，推荐BMI范围：
            <text>18.5-24.9</text>
          </view>
        </view>

        <view class="chart-item2">
          <view class="time">
            <text class="time1">{{ lastPlanData.start_date && lastPlanData.start_date.slice(0, 10) }}</text>

            <text class="line"></text>
            <text class="tip">
              每周{{
                isWeightLoss ? `减重${lastPlanData.weekly_loss_weight}` : `增重${-lastPlanData.weekly_loss_weight}`
              }}kg
            </text>
            <text class="line"></text>

            <view class="time2">
              <text class="value">{{ lastPlanData.end_date && lastPlanData.end_date.slice(0, 10) }}</text>
              <!--<uni-icons color="#666666" type="right" size="18"></uni-icons>-->
            </view>
          </view>

          <!-- 历史计划折线图显示逻辑存在问题，先不做显示 -->
          <!--<view class="chart">-->
          <!--  <l-echart ref="chartRef" @finished="init" />-->
          <!--</view>-->

          <!--<view class="expected">-->
          <!--  <text>一周后</text>-->
          <!--  <text>的理想变化</text>-->
          <!--  <text>-{{ lastPlanData.weekly_loss_weight }}kg</text>-->
          <!--</view>-->

          <!--<view class="recode" @click="$toRouter('/pages/weightData/weightData')">记录体重》</view>-->

          <view class="options">
            <text @click="deletePlan">删除方案</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';

let chart = null;

export default {
  name: 'weightManagementPlan',

  data() {
    return {
      lastPlanData: {},
      weighData: {},
      option: {
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          bottom: 0,
        },
        grid: {
          top: '5%',
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [],
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '体重',
            data: [],
            type: 'line',
            color: '#FFA537',
            areaStyle: {
              color: '#FFEDD7',
            },
          },
        ],
      },
    };
  },

  onLoad() {
    this.getLastPlanData();
  },

  computed: {
    isWeightLoss() {
      return this.lastPlanData.plan_initial_weight - this.lastPlanData.plan_target_weight > 0;
    },
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    async init() {
      chart = await this.$refs.chartRef.init(echarts);
      chart.setOption(this.option);
    },

    /**
     * 获取最新一次计划数据
     */
    getLastPlanData() {
      this.lastPlanData = uni.getStorageSync('lastPlanData');
      // this.getRecodeWeightData(this.lastPlanData.plan_id);
    },

    /**
     * 获取当前计划已记录的体重数据
     */
    getRecodeWeightData(plan_id) {
      $http
        .post('api/diet-info/weight-plan-data', {
          plan_id,
        })
        .then((res) => {
          res.data.weight_list = res.data.weight_list || [];
          this.weighData = res.data;

          // this.option.xAxis.data = res.data.weight_list.map((item) => item.date_time.slice(6, 10));
          // this.option.series[0].data = res.data.weight_list.map((item) => item.weight);
          //
          // setTimeout(() => {
          //   chart.setOption(this.option);
          // }, 1000);
        });
    },

    /**
     * 删除计划
     */
    deletePlan() {
      uni.showModal({
        title: '温馨提示',
        content: '确定要删除计划吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中...',
            });

            $http
              .post('api/diet-info/weight-plan/delete', {
                plan_id: this.lastPlanData.plan_id,
              })
              .then(() => {
                uni.hideLoading();

                uni.showToast({
                  title: '删除成功',
                  icon: 'none',
                  mask: true,
                });

                setTimeout(() => {
                  this.$toBack();
                }, 1000);
              });
          }
        },
      });
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
.weight-management-plan-page {
  .page-title {
    background: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: #ffffff;
  }

  .plan-box {
    background: linear-gradient(to bottom, #ffdecf, #fcebbf, #e3ffcf) left top/100% 620rpx no-repeat;
    padding: 64rpx 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .plan-title {
      font-weight: bold;
      font-size: 46rpx;
      color: #333333;
      margin-bottom: 24rpx;
    }

    .plan-tip {
      font-size: 30rpx;
      color: #1a1a1a;
      margin-bottom: 67rpx;

      text {
        &:nth-child(2) {
          color: #b36408;
        }

        &:nth-child(4) {
          color: #b36408;
          font-size: 40rpx;
          font-weight: bold;
        }
      }
    }

    .chart-box {
      background: #ffffff;
      box-shadow: 0 2rpx 23rpx 7rpx rgba(241, 203, 151, 0.24);
      border-radius: 20rpx;
      align-self: stretch;
      margin-bottom: 22rpx;

      .chart-item1 {
        padding: 32rpx 25rpx 34rpx;
        border-bottom: 2rpx dashed #dddddd;

        .chart-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20rpx;

          text {
            &:nth-child(1) {
              font-weight: 500;
              font-size: 28rpx;
              color: #1a1a1a;
            }

            &:nth-child(2) {
              font-size: 26rpx;
              color: #b97420;
            }
          }
        }

        .chart-tip {
          font-size: 22rpx;
          color: #999999;

          text {
            color: #ffa537;
          }
        }
      }

      .chart-item2 {
        padding: 32rpx 14rpx;

        .time {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 35rpx;
          font-size: 26rpx;

          .time1 {
            color: #333333;
          }

          .line {
            flex-grow: 1;
            border-bottom: 2rpx dashed #dddddd;
          }

          .tip {
            font-size: 22rpx;
            background: #fef7dd;
            color: #b46408;
            padding: 8rpx 30rpx;
            border-radius: 20rpx;
          }

          .time2 {
            display: flex;
            align-items: center;

            .value {
              font-size: 26rpx;
              color: #333333;
            }
          }
        }

        .chart {
          margin-bottom: 35rpx;
        }

        .expected {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 45rpx;

          text {
            &:nth-child(1) {
              width: 120rpx;
              height: 51rpx;
              background: #ffa537;
              border-radius: 15rpx;
              font-weight: 500;
              font-size: 30rpx;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 22rpx;
            }

            &:nth-child(2) {
              color: #1a1a1a;
              font-size: 28rpx;
              margin-right: 10rpx;
            }

            &:nth-child(3) {
              color: #b56505;
              font-size: 32rpx;
            }
          }
        }

        .recode {
          width: 100%;
          height: 86rpx;
          background: #fef7dd;
          border-radius: 40rpx;
          font-weight: bold;
          font-size: 32rpx;
          color: #b46408;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 42rpx;
        }

        .options {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20rpx;

          text {
            width: 274rpx;
            height: 85rpx;
            background: #f7f6fb;
            border-radius: 20rpx;
            font-size: 28rpx;
            color: #333333;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }
}
</style>
