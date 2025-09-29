<template>
  <view class="food-analysis-page">
    <view class="page-title">
      <text>每餐分析</text>

      <view class="back" @click="$toSwitch('/pages/recode/recode')">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="container" v-if="analysisData">
      <view class="res1">
        <view class="header">
          <view>
            {{ typeName }}建议
            <text>{{ calorieAnalysis.min }}~{{ calorieAnalysis.max }}</text>
            千卡
          </view>
          <template v-if="foodComponentInfo.calorie">
            <view v-if="foodComponentInfo.calorie > calorieAnalysis.max">吃多了</view>
            <view
              v-else-if="
                foodComponentInfo.calorie <= calorieAnalysis.max && foodComponentInfo.calorie >= calorieAnalysis.min
              "
            >
              合适
            </view>
            <view v-else>吃少了</view>
          </template>
        </view>

        <view class="line"></view>

        <view class="chart-box">
          <view class="chart">
            <l-echart ref="chartRef" @finished="init" />
            <view class="number">
              <text>{{ foodComponentInfo.calorie }}</text>
              <text>千卡</text>
            </view>
          </view>
          <view class="component">
            <view class="item">
              <text></text>
              <text>碳水化合物</text>
              <text>{{ foodComponentInfo.carbohydrateR }}%</text>
              <text>{{ foodComponentInfo.carbohydrate }}克</text>
            </view>

            <view class="item">
              <text></text>
              <text>蛋白质</text>
              <text>{{ foodComponentInfo.proteinR }}%</text>
              <text>{{ foodComponentInfo.protein }}克</text>
            </view>

            <view class="item">
              <text></text>
              <text>脂肪</text>
              <text>{{ foodComponentInfo.fatR }}%</text>
              <text>{{ foodComponentInfo.fat }}克</text>
            </view>
          </view>
        </view>
      </view>

      <view class="res2">
        <view class="title">
          <text>{{ typeName }}评价</text>
          <text>{{ scoreList[analysisData.score - 1] }}</text>
        </view>

        <view class="measure">
          <view class="line">
            <view class="line-item" v-for="(item, index) of scoreList" :key="item">
              <text></text>
              <text :style="{ visibility: analysisData.score - 1 === index ? '' : 'hidden' }"></text>
              <text>{{ item }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="res3">
        <view class="food-list" v-if="foodList.length">
          <view class="food-item" v-for="(item, index) of foodList" :key="index">
            <image class="left" mode="widthFix" :src="item.img_path" />

            <view class="middle">
              <view>{{ item.name }}</view>
              <view>{{ item.weight }}克</view>
            </view>

            <view class="right">
              {{ item.advice }}
            </view>
          </view>
        </view>

        <view class="summarize">
          <view v-for="item of evaluationList" :key="item.title">
            <text class="title">{{ item.title }}</text>
            <text>{{ item.content }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="know-btn" @click="$toSwitch('/pages/recode/recode')">我知道了</view>
  </view>
</template>

<script>
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';

let chart = null;

export default {
  name: 'foodAnalysis',

  data() {
    return {
      type: undefined,
      foodList: [],
      analysisData: null,
      evaluationList: [],
      dailyCalorie: {},
      option: {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: false,
        },
        color: ['#BEF054', '#FE5B1F', '#FFB66E'],
        series: [
          {
            type: 'pie',
            radius: ['100%', '90%'],
            label: {
              show: false,
            },
            emphasis: {
              show: false,
            },
            labelLine: {
              show: false,
            },
            data: [],
          },
        ],
      },
      scoreList: ['较差', '一般', '良好', '优秀', '非常优秀'],
    };
  },

  computed: {
    typeName() {
      let type = Number(this.type);

      if (type === 1) {
        return '早餐';
      } else if (type === 2) {
        return '早加餐';
      } else if (type === 3) {
        return '午餐';
      } else if (type === 4) {
        return '午加餐';
      } else if (type === 5) {
        return '晚餐';
      } else if (type === 6) {
        return '晚加餐';
      }

      return '';
    },

    foodComponentInfo() {
      let calorie = 0;
      let carbohydrate = 0;
      let protein = 0;
      let fat = 0;

      this.foodList.forEach((item) => {
        calorie += item.calorie;
        carbohydrate += item.carbohydrate;
        protein += item.protein;
        fat += item.fat;
      });

      let total = carbohydrate + protein + fat;

      let carbohydrateR = ((carbohydrate / total) * 100).toFixed(2);
      let proteinR = ((protein / total) * 100).toFixed(2);
      let fatR = ((fat / total) * 100).toFixed(2);

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.option.series[0].data = [
        { name: '', value: carbohydrateR },
        { name: '', value: proteinR },
        { name: '', value: fatR },
      ];

      return {
        calorie,
        carbohydrate: carbohydrate.toFixed(2),
        protein: protein.toFixed(2),
        fat: fat.toFixed(2),
        carbohydrateR,
        proteinR,
        fatR,
      };
    },

    calorieAnalysis() {
      let min = 0;
      let max = 0;
      let type = Number(this.type);
      let total = this.dailyCalorie.calorie_requirement;

      if (type === 1) {
        min = 0.25;
        max = 0.3;
      } else if (type === 2) {
        min = 0.05;
        max = 0.1;
      } else if (type === 3) {
        min = 0.3;
        max = 0.35;
      } else if (type === 4) {
        min = 0.05;
        max = 0.1;
      } else if (type === 5) {
        min = 0.25;
        max = 0.3;
      } else if (type === 6) {
        min = 0.05;
        max = 0.1;
      }

      return {
        min: Math.round(total * min),
        max: Math.round(total * max),
      };
    },
  },

  onLoad(options) {
    this.type = options.type;
    this.time = options.time;
    this.getAnalysisData();
    this.getDailyCalorie();
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

    getAnalysisData() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post(
          'api/diet-info/meal-report',
          {
            type: this.type,
            date_time: this.time || new Date().format(),
          },
          {
            timeout: 90000,
          },
        )
        .then((res) => {
          uni.hideLoading();
          this.analysisData = res.data;

          res.data.die_list.forEach((item) => {
            // 给默认图片
            if (!item.img_path) {
              item.img_path = 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/dietaryRecord/food.png';
            }
          });

          this.foodList = res.data.die_list;

          this.evaluationList = res.data.evaluation.split('\n').map((item) => {
            return {
              title: item.slice(0, 3),
              content: item.slice(3),
            };
          });
        });
    },

    getDailyCalorie() {
      return $http
        .post('api/diet-info/daily-calorie', {
          date: this.time || new Date().format(),
        })
        .then((res) => {
          this.dailyCalorie = res.data;
        });
    },
  },
};
</script>

<style>
page {
  background: #f6f7fb;
  height: 100%;
}
</style>

<style scoped lang="scss">
.food-analysis-page {
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

  .container {
    flex-grow: 1;
    overflow: auto;
    padding: 27rpx 29rpx 0;

    .res1 {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 0 15rpx;
      margin-bottom: 20rpx;

      .header {
        padding: 30rpx 15rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        view {
          font-size: 28rpx;

          &:nth-child(1) {
            color: #111111;

            text {
              color: #fe5b1f;
            }
          }

          &:nth-child(2) {
            color: #fe5b1f;
          }
        }
      }

      .line {
        height: 2rpx;
        width: 100%;
        background: #f5f5f6;
      }

      .chart-box {
        padding: 22rpx 15rpx;
        display: flex;
        align-items: center;

        .chart {
          width: 160rpx;
          height: 160rpx;
          margin-right: 56rpx;
          position: relative;

          .number {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18rpx;

            text {
              &:nth-child(1) {
                font-weight: 500;
                font-size: 34rpx;
                color: #111111;
              }

              &:nth-child(2) {
                font-size: 22rpx;
                color: #999999;
              }
            }
          }
        }

        .component {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 25rpx;

          .item {
            display: flex;
            align-items: center;

            &:nth-child(1) {
              text {
                &:nth-child(1) {
                  background: #bef054;
                }
              }
            }

            &:nth-child(2) {
              text {
                &:nth-child(1) {
                  background: #fe5b1f;
                }
              }
            }

            &:nth-child(3) {
              text {
                &:nth-child(1) {
                  background: #ffb66e;
                }
              }
            }

            text {
              font-size: 24rpx;
              color: #666666;

              &:nth-child(1) {
                width: 15rpx;
                height: 15rpx;
                border-radius: 2rpx;
                margin-right: 12rpx;
              }

              &:nth-child(2) {
                width: 46%;
              }

              &:nth-child(3) {
                flex-grow: 1;
              }
            }
          }
        }
      }
    }

    .res2 {
      padding: 30rpx;
      background: #ffffff;
      border-radius: 20rpx;
      margin-bottom: 20rpx;

      .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;

        text {
          font-size: 28rpx;

          &:nth-child(1) {
            color: #111111;
          }

          &:nth-child(2) {
            color: #fe5b1f;
          }
        }
      }

      .measure {
        .line {
          display: flex;
          align-items: center;

          .line-item {
            width: 20%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;

            text {
              &:nth-child(1) {
                width: 100%;
                height: 6rpx;
              }

              &:nth-child(2) {
                border-left: 16rpx solid transparent;
                border-right: 16rpx solid transparent;
                border-top: 16rpx solid transparent;
                border-bottom: 16rpx solid #ffb66e;
                margin-bottom: 16rpx;
              }

              &:nth-child(3) {
                font-size: 20rpx;
                color: #bfbfbf;
                white-space: nowrap;
              }
            }

            &:nth-child(1) {
              text {
                &:nth-child(1) {
                  background: #fe5b1f;
                }
              }
            }

            &:nth-child(2) {
              text {
                &:nth-child(1) {
                  background: #ffb66e;
                }
              }
            }

            &:nth-child(3) {
              text {
                &:nth-child(1) {
                  background: #bef054;
                }
              }
            }

            &:nth-child(4) {
              text {
                &:nth-child(1) {
                  background: #ffb66e;
                }
              }
            }

            &:nth-child(5) {
              text {
                &:nth-child(1) {
                  background: #fe5b1f;
                }
              }
            }
          }
        }
      }
    }

    .res3 {
      padding: 30rpx;
      background: #ffffff;
      border-radius: 20rpx;
      margin-bottom: 40rpx;

      .food-list {
        display: flex;
        flex-direction: column;
        gap: 50rpx;
        margin-bottom: 50rpx;

        .food-item {
          display: flex;
          align-items: center;

          .left {
            width: 105rpx;
            margin-right: 20rpx;
            border-radius: 20rpx;
          }

          .middle {
            display: flex;
            flex-direction: column;
            gap: 16rpx;
            flex-grow: 1;

            view {
              &:nth-child(1) {
                font-size: 28rpx;
                color: #111111;
              }

              &:nth-child(2) {
                font-size: 22rpx;
                color: #999999;
              }
            }
          }

          .right {
            align-self: stretch;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22rpx;
            color: #0abf92;
          }
        }
      }

      .summarize {
        display: flex;
        flex-direction: column;
        gap: 40rpx;

        view {
          font-size: 24rpx;
          color: #111111;

          text {
            line-height: 40rpx;
          }

          &:nth-child(1) {
            .title {
              color: #0abf92;
            }
          }

          &:nth-child(2) {
            .title {
              color: #fe5b1f;
            }
          }

          &:nth-child(3) {
            .title {
              color: #8995ff;
            }
          }
        }
      }
    }
  }

  .know-btn {
    flex-shrink: 0;
    width: 592rpx;
    height: 103rpx;
    background: #0abf92;
    border-radius: 52rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 32rpx;
    color: #ffffff;
    margin: 10px auto 40px;
  }
}
</style>
