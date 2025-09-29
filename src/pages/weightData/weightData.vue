<template>
  <view class="weight-data-page">
    <view class="page-title">
      <text>体重数据</text>

      <view class="back" @click="back">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="data-charts">
      <view class="chart1-box">
        <view class="progress">
          <view class="chart">
            <l-echart ref="chart1Ref" @finished="init1" />

            <view class="progress-tip">
              <text v-if="isWeightLoss">累计减重（公斤）</text>
              <text v-else>累计增肌（公斤）</text>
              <text>{{ (isWeightLoss ? userDetailInfo.weight_loss : -userDetailInfo.weight_loss).toFixed(2) }}</text>
              <text>{{ progress === 100 ? '目标已完成' : `目标完成${progress}%` }}</text>
            </view>
          </view>

          <view class="detail">
            <view class="item">
              <view class="value">
                <text>初始体重</text>
                <text>{{ userDetailInfo.initial_weight }}公斤</text>
              </view>

              <image
                @click="updateWeightData(1)"
                mode="widthFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/weightData/edit.png"
              />
            </view>

            <view class="item">
              <view class="value">
                <text>目标体重</text>
                <text>{{ userDetailInfo.target_weight }}公斤</text>
              </view>

              <image
                @click="updateWeightData(2)"
                mode="widthFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/weightData/edit.png"
              />
            </view>

            <view class="item">
              <view class="value">
                <text>最新体重</text>
                <text>{{ userDetailInfo.current_weight }}公斤</text>
              </view>

              <image
                @click="updateWeightData(3)"
                mode="widthFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/weightData/edit.png"
              />
            </view>
          </view>
        </view>

        <view class="line"></view>

        <view class="bmi">
          <view class="value1">
            <text>初始BMI值为：{{ userDetailInfo.initial_bmi }}</text>
            <text v-if="userDetailInfo.initial_bmi > 27.9">肥胖</text>
            <text v-else-if="userDetailInfo.initial_bmi > 24.9">超重</text>
            <text v-else-if="userDetailInfo.initial_bmi > 18.5">正常</text>
            <text v-else>偏瘦</text>
          </view>

          <view class="value2">
            <text>根据您的身高体重测算，推荐BMI范围：</text>
            <text>18.5-24.9</text>
          </view>
        </view>
      </view>

      <view class="plan">
        <view class="btn1" v-if="hasCompletedPlan" @click="$toRouter('/pages/addPlan/addPlan')">创建新计划</view>
        <view class="btn1" v-else @click="previewPlan">查看计划</view>
        <view class="btn2" @click="updateWeightData(3)">+更新最新体重</view>
      </view>

      <view class="chart2-box">
        <view class="chart-title">体重变化曲线</view>

        <view class="chart">
          <l-echart ref="chart2Ref" @finished="init2" />
        </view>
      </view>

      <view class="chart3-box">
        <view class="chart-title">BMI变化曲线</view>

        <view class="chart">
          <l-echart ref="chart3Ref" @finished="init3" />
        </view>
      </view>
    </view>

    <uni-popup ref="updateWeightDataDialog">
      <view class="update-weight-data-dialog">
        <view class="title" v-if="updateType === 1">更新初始体重</view>
        <view class="title" v-else-if="updateType === 2">更新目标体重</view>
        <view class="title" v-else-if="updateType === 3">更新最新体重</view>

        <view class="input-box">
          <input
            v-if="updateType === 1"
            type="number"
            :value="weightData.initial_weight"
            @input="weightData.initial_weight = $event.detail.value"
          />
          <input
            v-else-if="updateType === 2"
            type="number"
            :value="weightData.target_weight"
            @input="weightData.target_weight = $event.detail.value"
          />
          <input
            v-else-if="updateType === 3"
            type="number"
            :value="weightData.current_weight"
            @input="weightData.current_weight = $event.detail.value"
          />
          <text>公斤</text>
        </view>

        <view class="submit" @click="submit">确定</view>

        <view class="close" @click="$refs.updateWeightDataDialog.close()">
          <uni-icons class="back" color="#999999" type="closeempty" size="24"></uni-icons>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';

let chart1 = null;
let chart2 = null;
let chart3 = null;

export default {
  name: 'weightData',

  data() {
    return {
      userDetailInfo: {},
      homeWeightPlanData: {},
      hasCompletedPlan: false,
      weightData: {},
      progress: 0,
      updateType: 1,
      option1: {
        series: [
          {
            type: 'gauge',
            startAngle: 120,
            endAngle: -240,
            min: 0,
            max: 100,
            splitNumber: 12,
            itemStyle: {
              color: '#0ABF92',
              shadowColor: 'transparent',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
            progress: {
              show: true,
              roundCap: true,
              width: 4,
            },
            pointer: {
              show: false,
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 4,
                color: [[1, '#F6F7FB']],
              },
            },
            radius: '100%',
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            title: {
              show: false,
            },
            detail: {
              show: false,
            },
            data: [
              {
                value: 20,
              },
            ],
          },
        ],
      },
      option2: {
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
          top: '10%',
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [],
          // boundaryGap: false,
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '体重',
            label: {
              show: true,
              position: 'top',
            },
            data: [],
            type: 'line',
            color: '#FFA537',
            areaStyle: {
              color: '#FFEDD7',
            },
          },
        ],
      },
      option3: {
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
          top: '10%',
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [],
          // boundaryGap: false,
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: 'BMI',
            label: {
              show: true,
              position: 'top',
            },
            data: [],
            type: 'line',
            color: '#0ABF92',
            areaStyle: {
              color: '#CEF2E9',
            },
          },
        ],
      },
    };
  },

  onShow() {
    this.getWeightData();
    this.getHomeWeightPlan();
  },

  computed: {
    isWeightLoss() {
      return this.userDetailInfo.initial_weight - this.userDetailInfo.target_weight > 0;
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
    async init1() {
      chart1 = await this.$refs.chart1Ref.init(echarts);
      chart1.setOption(this.option1);
    },

    async init2() {
      chart2 = await this.$refs.chart2Ref.init(echarts);
      chart2.setOption(this.option2);
    },

    async init3() {
      chart3 = await this.$refs.chart3Ref.init(echarts);
      chart3.setOption(this.option3);
    },

    back() {
      // eslint-disable-next-line no-undef
      let pages = getCurrentPages();

      if (pages[pages.length - 2].route === 'pages/my/my') {
        this.$toBack();
        return;
      }

      if (this.hasCompletedPlan) {
        this.$toSwitch('/pages/recode/recode');
        return;
      }

      this.$toBack();
    },

    getHomeWeightPlan() {
      return $http.get('api/diet-info/weight-plan/home').then((res) => {
        this.homeWeightPlanData = res.data;
        this.hasCompletedPlan = res.data.state !== 1;
      });
    },

    getWeightData(showLoading = true) {
      if (showLoading) {
        uni.showLoading({
          title: '加载中...',
          mask: true,
        });
      }

      $http
        .post('api/diet-info/weight-data', {
          days: 30,
        })
        .then((res) => {
          if (showLoading) {
            uni.hideLoading();
          }

          this.userDetailInfo = res.data;
          this.progress = Number(
            (
              (this.userDetailInfo.weight_loss /
                (this.userDetailInfo.initial_weight - this.userDetailInfo.target_weight)) *
              100
            ).toFixed(2),
          );

          if (this.progress > 100) {
            this.progress = 100;
          } else if (this.progress < 0) {
            this.progress = 0;
          }

          this.option1.series[0].data[0].value = this.progress;

          setTimeout(() => {
            chart1.setOption(this.option1);
          }, 500);

          let weightList = res.data.weight_list.map((item) => item.weight).reverse();
          let bmiList = res.data.weight_list.map((item) => item.bmi).reverse();
          let timeList = res.data.weight_list.map((item) => item.date_time.slice(6, 10)).reverse();

          this.option2.series[0].data = weightList;
          this.option2.xAxis.data = timeList;

          this.option3.series[0].data = bmiList;
          this.option3.xAxis.data = timeList;

          setTimeout(() => {
            chart2.setOption(this.option2);
            chart3.setOption(this.option3);
          }, 500);
        });
    },

    previewPlan() {
      this.$toRouter('/pages/weightManagementPlan/weightManagementPlan');
    },

    updateWeightData(type) {
      this.updateType = type;
      this.weightData = { ...this.userDetailInfo };
      this.$refs.updateWeightDataDialog.open();
    },

    submit() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      if (this.updateType === 1 || this.updateType === 2) {
        $http
          .post('api/diet-info/user-info/update', {
            initial_weight: this.weightData.initial_weight,
            target_weight: this.weightData.target_weight,
          })
          .then(() => {
            this.$refs.updateWeightDataDialog.close();
            uni.hideLoading();
            this.getWeightData(false);
            this.getHomeWeightPlan();

            uni.showToast({
              title: '更新成功',
              icon: 'none',
            });
          });
      } else {
        $http
          .post('api/diet-info/user-weight/update', {
            weight: this.weightData.current_weight,
          })
          .then(() => {
            this.$refs.updateWeightDataDialog.close();
            uni.hideLoading();
            this.getWeightData(false);
            this.getHomeWeightPlan();

            uni.showToast({
              title: '更新成功',
              icon: 'none',
            });
          });
      }
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
.weight-data-page {
  .page-title {
    background: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: #ffffff;
  }

  .data-charts {
    padding: 20rpx 30rpx;

    .chart1-box {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 30rpx 40rpx;
      margin-bottom: 20rpx;

      .progress {
        display: flex;
        align-items: center;

        .chart {
          width: 220rpx;
          height: 220rpx;
          flex-shrink: 0;
          position: relative;

          .progress-tip {
            position: absolute;
            left: 0;
            right: 0;
            top: 20rpx;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20rpx;

            text {
              &:nth-child(1) {
                font-size: 22rpx;
                color: #999999;
              }

              &:nth-child(2) {
                font-size: 36rpx;
                color: #1a1a1a;
              }

              &:nth-child(3) {
                font-size: 22rpx;
                color: #666666;
              }
            }
          }
        }

        .detail {
          flex-grow: 1;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 40rpx;

          .item {
            display: flex;
            align-items: center;

            .value {
              display: flex;
              flex-direction: column;
              margin-right: 70rpx;

              text {
                &:nth-child(1) {
                  color: #999999;
                  font-size: 24rpx;
                  margin-bottom: 10rpx;
                }

                &:nth-child(2) {
                  color: #1a1a1a;
                  font-size: 30rpx;
                }
              }
            }

            image {
              width: 28rpx;
            }
          }
        }
      }

      .line {
        margin: 30rpx 0;
        height: 2rpx;
        background: #f6f7fb;
      }

      .bmi {
        .value1 {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;

          text {
            &:nth-child(1) {
              font-weight: 500;
              font-size: 28rpx;
              color: #1a1a1a;
              margin-right: 20rpx;
            }

            &:nth-child(2) {
              width: 60rpx;
              height: 32rpx;
              background: #ffa537;
              border-radius: 16rpx;
              font-size: 22rpx;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }

        .value2 {
          display: flex;
          align-items: center;

          text {
            font-size: 22rpx;

            &:nth-child(1) {
              color: #999999;
            }

            &:nth-child(2) {
              color: #ffa537;
            }
          }
        }
      }
    }

    .plan {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20rpx;
      margin-bottom: 54rpx;

      view {
        width: 274rpx;
        height: 85rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        color: #ffffff;
        border-radius: 20rpx;

        &:nth-child(1) {
          background: #ffa537;
        }

        &:nth-child(2) {
          background: #0abf92;
        }
      }
    }

    .chart2-box,
    .chart3-box {
      margin-bottom: 52rpx;

      .chart-title {
        font-weight: 500;
        font-size: 30rpx;
        color: #1a1a1a;
        margin-bottom: 30rpx;
      }

      .chart {
        background: #ffffff;
        border-radius: 20rpx;
        padding: 50rpx 20rpx;
      }
    }
  }

  .update-weight-data-dialog {
    background: #ffffff;
    width: 589rpx;
    border-radius: 30rpx;
    padding: 40rpx 0;
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

    .input-box {
      width: 410rpx;
      height: 103rpx;
      background: #ffffff;
      border-radius: 20rpx;
      border: 2px solid #f4f4f4;
      display: flex;
      align-items: center;
      color: #111111;
      margin-bottom: 50rpx;

      input {
        font-weight: 500;
        width: 260rpx;
        font-size: 48rpx;
        text-align: center;
      }

      text {
        flex-grow: 1;
        font-size: 30rpx;
      }
    }

    .submit {
      width: 410rpx;
      height: 90rpx;
      background: #0abf92;
      border-radius: 45rpx;
      font-size: 30rpx;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close {
      position: absolute;
      right: 20rpx;
      top: 30rpx;
    }
  }
}
</style>
