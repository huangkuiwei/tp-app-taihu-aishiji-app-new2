<template>
  <view class="data-statistics-page">
    <view class="page-title">
      <text>数据统计</text>

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

    <view class="data-charts">
      <view class="chart-item">
        <view class="chart-title">热量摄取和运动量</view>

        <view class="chart-box">
          <l-echart ref="chart1Ref" @finished="init1" />
        </view>
      </view>

      <view class="chart-item">
        <view class="chart-title">热量缺口</view>

        <view class="chart-box">
          <l-echart ref="chart2Ref" @finished="init2" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';

let chart1 = null;
let chart2 = null;

export default {
  name: 'dataStatistics',

  data() {
    return {
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
      option1: {
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
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
        yAxis: {
          type: 'value',
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        series: [
          {
            name: '热量摄取',
            type: 'bar',
            data: [],
            color: '#FFA537',
            barMaxWidth: 20,
          },
          {
            name: '运动量',
            type: 'bar',
            data: [],
            color: '#0ABF92',
            barMaxWidth: 20,
          },
        ],
      },
      option2: {
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
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
        yAxis: {
          type: 'value',
          position: 'top',
          splitLine: {
            lineStyle: {
              type: 'solid',
            },
          },
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        series: [
          {
            name: '热量缺口',
            type: 'bar',
            data: [],
            color: '#0ABF92',
            barMaxWidth: 20,
          },
        ],
      },
    };
  },

  watch: {
    selectedTime() {
      this.getDataStatistics();
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
    getDataStatistics() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/data-statistics', {
          report_type: this.selectedTime.value,
        })
        .then((res) => {
          uni.hideLoading();

          this.option1.xAxis.data = res.data.map((item) => item.date_time.slice(5, 10));
          this.option1.series[0].data = res.data.map((item) => item.calorie_intake);
          this.option1.series[1].data = res.data.map((item) => item.exercise_calorie);

          this.option2.xAxis.data = res.data.map((item) => item.date_time.slice(5, 10));
          this.option2.series[0].data = res.data.map((item) => ({
            value: item.daily_caloric_diff,
          }));

          setTimeout(() => {
            chart1.setOption(this.option1);
            chart2.setOption(this.option2);
          }, 500);
        });
    },

    async init1() {
      // chart 图表实例不能存在data里
      chart1 = await this.$refs.chart1Ref.init(echarts);
      chart1.setOption(this.option1);
    },

    async init2() {
      // chart 图表实例不能存在data里
      chart2 = await this.$refs.chart2Ref.init(echarts);
      chart2.setOption(this.option2);
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
.data-statistics-page {
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

  .data-charts {
    padding: 40rpx 30rpx;

    .chart-item {
      margin-bottom: 50rpx;

      .chart-title {
        font-weight: 500;
        font-size: 30rpx;
        color: #1a1a1a;
        margin-bottom: 28rpx;
      }

      .chart-box {
        background: #ffffff;
        border-radius: 20rpx;
        padding: 40rpx 20rpx 30rpx;
      }
    }
  }
}
</style>
