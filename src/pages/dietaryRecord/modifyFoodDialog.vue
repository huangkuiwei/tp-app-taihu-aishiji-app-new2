<template>
  <uni-popup ref="modifyFoodPopup" type="bottom" :safe-area="false">
    <view class="modify-food-dialog">
      <view class="time">{{ today }}</view>

      <view class="food-info">
        <image mode="widthFix" :src="currentFood.img_path" />

        <text class="name">{{ currentFood.name }}</text>

        <view class="carbohy">
          <input type="number" :value="calorie" @input="calorie = Number($event.detail.value)" />
          <text>千卡</text>
        </view>
      </view>

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

      <view class="weight">
        <input type="number" :value="weight" @input="weight = Number($event.detail.value)" />
        <text>克</text>
      </view>

      <view class="save" @click="modifyFood">保存</view>
    </view>
  </uni-popup>
</template>

<script>
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';

let chart = null;

export default {
  name: 'modifyFoodDialog',

  props: {
    currentFood: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      today: null,
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
      calorie: 0,
      weight: 0,
    };
  },

  computed: {
    foodComponentInfo() {
      if (!this.currentFood.food_id) {
        return {};
      }

      let calorie = this.currentFood.calorie;
      let carbohydrate = this.currentFood.carbohydrate;
      let protein = this.currentFood.protein;
      let fat = this.currentFood.fat;

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
        this.$refs.chartRef.resize({ width: 80, height: 80 });
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

  created() {
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');

    this.today = `${month}月${day}日`;
  },

  watch: {
    currentFood: {
      handler(value) {
        this.calorie = value.calorie;
        this.weight = value.weight;
      },

      deep: true,
    },
  },

  methods: {
    async init() {
      chart = await this.$refs.chartRef.init(echarts);
      chart.setOption(this.option);
      this.$refs.chartRef.resize({ width: 80, height: 80 });
    },

    open() {
      this.$refs.modifyFoodPopup.open();
    },

    close() {
      this.$refs.modifyFoodPopup.close();
    },

    modifyFood() {
      if (!Number.isInteger(this.calorie)) {
        uni.showToast({
          title: '食物热量须为整数，请修改',
          icon: 'none',
        });

        return;
      }

      if (!Number.isInteger(this.weight)) {
        uni.showToast({
          title: '食物重量须为整数，请修改',
          icon: 'none',
        });

        return;
      }

      this.$refs.modifyFoodPopup.close();

      setTimeout(() => {
        // calorie 和 weight 需保存为整型，后端只接受整型数值
        if (this.calorie !== this.currentFood.calorie) {
          this.currentFood.calorie = this.calorie;
        }

        if (this.weight !== this.currentFood.weight) {
          let r = this.weight / this.currentFood.weight;
          this.currentFood.weight = this.weight;

          this.currentFood.calorie = Number((r * this.currentFood.calorie).toFixed(0));
          this.currentFood.carbohydrate = Number((r * this.currentFood.carbohydrate).toFixed(2));
          this.currentFood.protein = Number((r * this.currentFood.protein).toFixed(2));
          this.currentFood.fat = Number((r * this.currentFood.fat).toFixed(2));
        }

        this.$emit('modifyFood', this.currentFood);
      }, 200);
    },
  },
};
</script>

<style scoped lang="scss">
.modify-food-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx 35rpx 46rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .time {
    font-size: 28rpx;
    color: #111111;
    margin-bottom: 60rpx;
  }

  .food-info {
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40rpx;

    image {
      width: 80rpx;
      border-radius: 20rpx;
      margin-right: 20rpx;
    }

    .name {
      flex-grow: 1;
      font-size: 32rpx;
      color: #111111;
    }

    .carbohy {
      display: flex;
      align-items: center;
      width: 200rpx;
      padding: 20rpx;
      border-radius: 20rpx;
      border: 2rpx solid #dddddd;

      input {
        flex-grow: 1;
      }

      text {
        font-size: 28rpx;
        color: #111111;
        flex-shrink: 0;
      }
    }
  }

  .chart-box {
    align-self: stretch;
    display: flex;
    align-items: center;
    padding: 40rpx 20rpx;
    border-radius: 20rpx;
    background: #efefef;
    margin-bottom: 40rpx;

    .chart {
      width: 80px;
      height: 80px;
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

  .weight {
    display: flex;
    align-items: center;
    width: 300rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    border: 2rpx solid #dddddd;
    margin-bottom: 40rpx;

    input {
      flex-grow: 1;
    }

    text {
      font-size: 28rpx;
      color: #111111;
      flex-shrink: 0;
    }
  }

  .save {
    width: 590rpx;
    margin: 0 auto 60rpx;
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
