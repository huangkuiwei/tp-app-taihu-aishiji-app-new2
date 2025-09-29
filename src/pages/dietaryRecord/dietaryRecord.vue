<template>
  <view class="dietary-record-page">
    <view class="page-title">
      <text>添加饮食</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="container">
      <view class="dialogue">
        <template v-if="url">
          <view class="url">
            <image mode="widthFix" :src="url" />
          </view>
        </template>

        <template v-else>
          <view v-for="(text, index) of textList" :key="index">{{ text }}</view>
        </template>

        <view>
          <text v-if="isFinished">分析完成！以下为分析结果</text>
          <text v-else>{{ loadingText }}</text>
        </view>
      </view>

      <view class="res1" v-if="isFinished">
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

      <view class="res3" v-if="isFinished">
        <view class="title">摄入食物</view>

        <view class="food-list" v-if="foodList.length">
          <view class="food-item" v-for="(item, index) of foodList" :key="index">
            <image class="left" mode="widthFix" :src="item.img_path" />

            <view class="middle">
              <view>{{ item.name }}</view>

              <view>{{ item.weight }}克</view>

              <view>
                <text>{{ item.carbohydrate }}克</text>
                <text>{{ item.protein }}克</text>
                <text>{{ item.fat }}克</text>
              </view>
            </view>

            <view class="right">
              <view> {{ item.calorie }}千卡 </view>

              <view>
                <image
                  mode="widthFix"
                  src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/dietaryRecord/edit.png"
                  @click="modifyFood(item)"
                />

                <image
                  @click="deleteFood(index)"
                  mode="widthFix"
                  src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/dietaryRecord/delete.png"
                />
              </view>
            </view>
          </view>
        </view>

        <view class="add-food" @click="$refs.addFoodRecodeDialog.open()">
          <uni-icons color="#0ABF92" type="plus-filled" size="22"></uni-icons>
          <text>继续添加食物</text>
        </view>
      </view>
    </view>

    <view class="save" @click="saveRecode">保存记录</view>

    <add-food-recode-dialog ref="addFoodRecodeDialog" @addRecode="addRecode" :type="type" />

    <modify-food-dialog ref="modifyFoodPopup" :currentFood="currentFood" @modifyFood="modifyFoodSubmit" />
  </view>
</template>

<script>
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';
import AddFoodRecodeDialog from '@/pages/recode/addFoodRecodeDialog.vue';
import ModifyFoodDialog from '@/pages/dietaryRecord/modifyFoodDialog.vue';

let chart = null;

export default {
  name: 'dietaryRecord',

  components: {
    ModifyFoodDialog,
    AddFoodRecodeDialog,
  },

  data() {
    return {
      textList: [],
      url: undefined,
      type: undefined,
      input_type: undefined,
      isFinished: false,
      loadingText: '正在分析，请稍等...',
      foodList: [],
      currentFood: {},
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
    };
  },

  onLoad(options) {
    if (options.text) {
      this.textList = [decodeURIComponent(options.text)];
    }

    if (options.url) {
      this.url = decodeURIComponent(options.url);
    }

    this.type = options.type;
    this.input_type = options.input_type;
    this.date_time = options.date_time;

    if (this.url) {
      $http.upload('api/baseai/image-analysis', this.url, 'image').then((res) => {
        if (res.data && !res.data.length) {
          this.loadingText = '未检出到食物，请重新输入';

          uni.showModal({
            title: '温馨提示',
            content: '未检出到食物，请重新输入',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                uni.setStorageSync('showAddFoodDialog', true);
                this.$toBack();
              }
            },
          });

          return;
        }

        this.textList = res.data.map((item) => `${item.name}(${item.weight})`);
        this.analysisData();
      });
    } else {
      this.analysisData();
    }
  },

  computed: {
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

      // eslint-disable-next-line vue/no-async-in-computed-properties
      setTimeout(() => {
        chart && chart.setOption(this.option);
      }, 500);

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

    analysisData() {
      let part1 = this.date_time.slice(0, 11);
      let part2 = new Date().format().slice(11);
      let date_time = part1 + part2;

      $http
        .post(
          'api/diet-info/food-analysis',
          {
            text: this.textList.join('，'),
            input_type: this.input_type,
            type: this.type,
            date_time: date_time,
          },
          {
            timeout: 90000,
          },
        )
        .then((res) => {
          // 未检测到食物，返回上一级
          if (res.data && !res.data.length) {
            this.loadingText = '未检出到食物，请重新输入';

            uni.showModal({
              title: '温馨提示',
              content: '未检出到食物，请重新输入',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  uni.setStorageSync('showAddFoodDialog', true);
                  this.$toBack();
                }
              },
            });

            return;
          }

          res.data.forEach((item) => {
            // 给默认图片
            if (!item.img_path) {
              item.img_path = 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/dietaryRecord/food.png';
            }
          });

          this.isFinished = true;
          this.foodList = res.data;
        })
        .catch((error) => {
          this.loadingText = error.Msg || error.msg;
        });
    },

    modifyFood(item) {
      this.currentFood = item;
      this.$refs.modifyFoodPopup.open();
    },

    deleteFood(index) {
      if (this.foodList.length === 1) {
        uni.showModal({
          title: '温馨提示',
          content: '清空食品将退出当前页面',
          success: (res) => {
            if (res.confirm) {
              this.$toBack();
            }
          },
        });

        return;
      }

      uni.showModal({
        title: '温馨提示',
        content: '确定要删除吗？',
        success: (res) => {
          if (res.confirm) {
            this.foodList.splice(index, 1);
          }
        },
      });
    },

    addRecode(event) {
      this.$refs.addFoodRecodeDialog.close();
      this.textList.push(event.text);
      this.isFinished = false;
      this.analysisData();
    },

    saveRecode() {
      if (!this.isFinished) {
        uni.showToast({
          title: '分析未完成',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post(
          'api/diet-info/create-batch',
          {
            food_batch: this.foodList,
          },
          {
            timeout: 90000,
          },
        )
        .then(() => {
          uni.hideLoading();
          this.$toRouter('/pages/foodAnalysis/foodAnalysis', `type=${this.type}&time=${this.date_time}`);
        });
    },

    modifyFoodSubmit($event) {
      Object.assign(this.currentFood, $event);
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
.dietary-record-page {
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
    padding: 27rpx 29rpx 27rpx;

    .dialogue {
      display: flex;
      flex-direction: column;
      gap: 44rpx;
      margin-bottom: 39rpx;

      .url {
        align-self: flex-end;

        image {
          width: 260rpx;
          border-radius: 10rpx;
        }
      }

      view {
        &:not(.url) {
          padding: 18rpx 22rpx;
          max-width: 400rpx;
          font-size: 26rpx;
          line-height: 40rpx;

          &:not(:last-child) {
            background: #0abf92;
            border-radius: 25rpx 5rpx 25rpx 25rpx;
            color: #ffffff;
            align-self: flex-end;
            word-break: break-all;
          }

          &:last-child {
            background: #ffffff;
            border-radius: 5rpx 25rpx 25rpx 25rpx;
            color: #111111;
          }
        }
      }
    }

    .res1 {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 0 15rpx;
      margin-bottom: 20rpx;

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

    .res3 {
      padding: 30rpx;
      background: #ffffff;
      border-radius: 20rpx;
      margin-bottom: 40rpx;

      .title {
        font-size: 28rpx;
        color: #111111;
        margin-bottom: 40rpx;
      }

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

              &:nth-child(3) {
                font-size: 22rpx;
                color: #999999;
                display: flex;
                align-items: center;
                gap: 40rpx;

                text {
                  position: relative;
                  padding-left: 24rpx;

                  &:after {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 2rpx;
                    width: 18rpx;
                    height: 18rpx;
                  }

                  &:nth-child(1) {
                    &:after {
                      background: #bef054;
                    }
                  }

                  &:nth-child(2) {
                    &:after {
                      background: #fe5b1f;
                    }
                  }

                  &:nth-child(3) {
                    &:after {
                      background: #ffb66e;
                    }
                  }
                }
              }
            }
          }

          .right {
            align-self: stretch;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            view {
              &:nth-child(1) {
                font-size: 22rpx;
                color: #999999;

                text {
                  color: #0abf92;
                }
              }

              &:nth-child(2) {
                align-self: flex-end;
                display: flex;
                align-items: center;
                gap: 30rpx;

                image {
                  width: 26rpx;
                }
              }
            }
          }
        }
      }

      .add-food {
        font-weight: 500;
        font-size: 28rpx;
        color: #0abf92;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10rpx;
      }
    }
  }

  .save {
    width: 590rpx;
    margin: 40rpx auto 60rpx;
    height: 100rpx;
    background: #0abf92;
    border-radius: 50rpx;
    font-weight: 500;
    font-size: 32rpx;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
