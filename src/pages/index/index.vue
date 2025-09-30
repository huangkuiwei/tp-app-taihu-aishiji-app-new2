<template>
  <view class="index-page">
    <view class="banner">
      <view class="progress-container">
        <view class="progress chart-progress" v-if="homeWeightPlanData && homeWeightPlanData.state === 1">
          <view class="title">
            <text class="title-text">体重管理方案</text>

            <view class="time">
              <text>第</text>
              <text>{{ homeWeightPlanData.useWeek }}/{{ homeWeightPlanData.totalWeek }}</text>
              <text>周</text>
            </view>
          </view>

          <view class="chart">
            <view class="left">
              <text>{{ homeWeightPlanData.plan_initial_weight.toFixed(2) }}</text>
              <text>初始</text>
            </view>

            <view class="center">
              <text v-if="isWeightLoss">{{
                ((homeWeightPlanData && homeWeightPlanData.weight_loss) || 0).toFixed(2)
              }}</text>
              <text v-else>{{ ((homeWeightPlanData && -homeWeightPlanData.weight_loss) || 0).toFixed(2) }}</text>
              <text>{{ isWeightLoss ? '「已减去」' : '「已增肌」' }}（公斤）</text>
            </view>

            <view class="right">
              <text>{{ homeWeightPlanData.plan_target_weight.toFixed(2) }}</text>
              <text>目标</text>
            </view>

            <view class="chart-box">
              <l-echart ref="chartRef" @finished="initChart" />
            </view>
          </view>

          <image
            @click="goWeightManage"
            class="btn2"
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/index/btn2.png"
          />
        </view>

        <view class="progress" style="height: 727rpx" v-else>
          <image
            class="banner1-img"
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/index/banner1.png"
          />

          <image
            @click="addPlan"
            class="btn1"
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/index/btn1.png"
          />
        </view>
      </view>
    </view>

    <view class="get-way-btn">
      <view class="imgs">
        <!-- TODO 跳转事件 -->
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/index/adv1.png" />
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/index/adv2.png" />
      </view>
    </view>

    <view class="ai">
      <view class="ai-content">
        <view class="ai-title">
          <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/index/ai-icon.png" />
        </view>

        <view class="ai-list">
          <view class="item1">
            <view v-for="item of aiChartList.slice(0, 2)" :key="item.id" @click="jumpAi(item)">
              <text>{{ item.name }}</text>
              <image mode="widthFix" :src="item.logo" />
            </view>
          </view>

          <view class="item2">
            <view v-for="item of aiChartList.slice(2, 8)" :key="item.id" @click="jumpAi(item)">
              <text>{{ item.name }}</text>
              <image mode="widthFix" :src="item.logo" />
            </view>
          </view>

          <view class="item3">
            <view v-for="item of aiChartList.slice(8, 9)" :key="item.id" @click="jumpAi(item)">
              <text class="name">{{ item.name }}</text>
              <text class="title">专属营养方案</text>
              <image mode="widthFix" :src="item.logo" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';
import { verifyIsLogin } from '@/utils';

let chart = null;

export default {
  name: 'indexPage',

  data() {
    return {
      aiChartList: [],
      jkzsChat: {},
      homeWeightPlanData: null,
      recordData: null,
      option: {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 12,
            itemStyle: {
              color: '#7DBF2A',
              shadowColor: 'transparent',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
            progress: {
              show: true,
              roundCap: true,
              width: 10,
            },
            pointer: {
              show: false,
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 10,
                color: [[1, '#EEEEEE']],
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
                value: 0,
              },
            ],
          },
        ],
      },
    };
  },

  onShow() {
    this.initData();
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),
    ...mapGetters('app', ['isLogin']),

    isWeightLoss() {
      if (!this.homeWeightPlanData) {
        return true;
      }

      return this.homeWeightPlanData.plan_initial_weight - this.homeWeightPlanData.plan_target_weight > 0;
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
    ...mapActions('app', ['_getUserDetailInfo']),

    /**
     * 初始化数据
     */
    async initData() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      this.getAiChartList();
      await this.getHomeWeightPlan().catch(() => {});
      await this._getUserDetailInfo().catch(() => {});

      uni.hideLoading();
    },

    /**
     * 初始化进度条图表数据
     */
    async initChart() {
      // chart 图表实例不能存在data里
      chart = await this.$refs.chartRef.init(echarts);
      chart.setOption(this.option);
    },

    /**
     * 获取首页体重相关数据
     */
    getHomeWeightPlan() {
      return $http.get('api/diet-info/weight-plan/home').then((res) => {
        if (res.data) {
          let totalWeek =
            (new Date(res.data.end_date.replace(/-/g, '/')) - new Date(res.data.start_date.replace(/-/g, '/'))) /
            (1000 * 3600 * 24 * 7);
          let useWeek = (new Date() - new Date(res.data.start_date.replace(/-/g, '/'))) / (1000 * 3600 * 24 * 7);
          res.data.totalWeek = Math.ceil(totalWeek);
          res.data.useWeek = Math.ceil(useWeek);
        }

        this.homeWeightPlanData = res.data;

        if (this.homeWeightPlanData) {
          // 更新图表
          let allWeight = this.homeWeightPlanData.plan_initial_weight - this.homeWeightPlanData.plan_target_weight;
          let yetWeight = this.homeWeightPlanData.weight_loss;
          let ratio = Math.floor((yetWeight / allWeight) * 100);

          if (ratio < 0) {
            ratio = 0;
          } else if (ratio > 100) {
            ratio = 100;
          }

          this.option.series[0].data[0].value = ratio;

          setTimeout(() => {
            chart.setOption(this.option);
          }, 500);
        } else {
          this.option.series[0].data[0].value = 0;

          setTimeout(() => {
            chart.setOption(this.option);
          }, 500);
        }
      });
    },

    /**
     * 获取 ai 搭子列表
     */
    getAiChartList() {
      $http
        .get('api/baseai/agent-list')
        .then((res) => {
          let jkzsChatIndex = res.data.findIndex((item) => item.id === 10000);

          if (jkzsChatIndex !== -1) {
            this.jkzsChat = res.data[jkzsChatIndex];
          }

          res.data.splice(jkzsChatIndex, 1);
          this.aiChartList = res.data;
        })
        .catch(() => {
          this.aiChartList = [];
        });
    },

    /**
     * 跳转创建计划页
     */
    addPlan() {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      // 创建计划
      this.$toRouter('/pages/addPlan/addPlan');
    },

    /**
     * 跳转计划管理页
     */
    goWeightManage() {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      if (!this.homeWeightPlanData || this.homeWeightPlanData.state !== 1) {
        this.$toRouter('/pages/addPlan/addPlan');
        return;
      }

      this.$toRouter('/pages/weightManagementPlan/weightManagementPlan');
    },

    /**
     * 跳转 AI 搭子聊天界面
     */
    jumpAi(item) {
      // verifyIsLogin();

      if (item.id === 10000) {
        this.$toRouter('/pages/healthAssistant/healthAssistant', `agent_id=${item.id}&name=${item.name}`);
        return;
      }

      this.$toRouter('/pages/aiChat/aiChat', `agent_id=${item.id}&name=${item.name}`);
    },
  },
};
</script>

<style scoped lang="scss">
.index-page {
  background: #f2f3ee url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/index/bg.png') left top/100%
    auto no-repeat;
  padding-bottom: 40rpx;

  .banner {
    margin-bottom: 30rpx;

    .progress-container {
      padding: 200rpx 30rpx 0;

      .progress {
        padding: 0 0 30rpx;
        background: #ffffff;
        border-radius: 30rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;

        .banner1-img {
          position: absolute;
          top: -110rpx;
          width: 564rpx;
          margin-bottom: 30rpx;
        }

        .btn1 {
          position: absolute;
          bottom: 30rpx;
          width: 497rpx;
        }
      }

      .chart-progress {
        padding: 34rpx;

        .title {
          align-self: stretch;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .title-text {
            font-weight: bold;
            font-size: 32rpx;
            color: #404141;
          }

          .time {
            font-weight: 500;
            font-size: 29rpx;
            color: #404141;
            display: flex;
            align-items: center;

            text {
              &:nth-child(2) {
                margin: 0 10rpx;
                padding: 2rpx 10rpx;
                background: #e3ffbf;
                border-radius: 10rpx;
                font-weight: bold;
              }
            }
          }
        }

        .chart {
          align-self: stretch;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          padding-top: 148rpx;
          margin-bottom: 89rpx;

          .left,
          .right,
          .center {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18rpx;

            &.center {
              text {
                &:nth-child(1) {
                  font-size: 47rpx;
                }
              }
            }

            text {
              color: #000000;

              &:nth-child(1) {
                font-weight: 500;
                font-size: 40rpx;
              }

              &:nth-child(2) {
                font-size: 25rpx;
              }
            }
          }

          .chart-box {
            position: absolute;
            top: -70rpx;
            left: 140rpx;
            width: 340rpx;
          }
        }

        .btn2 {
          width: 497rpx;
          position: relative;
          z-index: 9;
        }
      }
    }
  }

  .get-way-btn {
    margin-bottom: 30rpx;

    .imgs {
      padding: 0 30rpx;
      display: flex;
      align-items: center;
      gap: 10rpx;
      overflow: auto;

      image {
        flex-shrink: 0;
        width: 556rpx;
      }
    }
  }

  .ai {
    padding: 0 30rpx;

    .ai-content {
      padding: 35rpx;
      background: #ffffff;
      border-radius: 30rpx;

      .ai-title {
        margin-bottom: 38rpx;

        image {
          width: 181rpx;
        }
      }

      .ai-list {
        .item1 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20rpx;
          margin-bottom: 20rpx;

          view {
            flex-grow: 1;
            height: 129rpx;
            padding: 0 20rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 10rpx;

            &:nth-child(1) {
              background: #f6f9ff;
            }

            &:nth-child(2) {
              background: #fcf6f4;
            }

            text {
              font-size: 24rpx;
              color: #000000;
            }

            image {
              width: 83rpx;
              flex-shrink: 0;
            }
          }
        }

        .item2 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20rpx;
          flex-wrap: wrap;
          margin-bottom: 20rpx;

          view {
            width: calc(33.3% - 14rpx);
            height: 129rpx;
            padding: 0 14rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 10rpx;

            &:nth-child(1) {
              background: #fef7ef;
            }

            &:nth-child(2) {
              background: #f7f2f8;
            }

            &:nth-child(3) {
              background: #f3fdff;
            }

            &:nth-child(4) {
              background: #f2fff4;
            }

            &:nth-child(5) {
              background: #fdfaf3;
            }

            &:nth-child(6) {
              background: #fff6f5;
            }

            text {
              font-size: 24rpx;
              color: #000000;
              line-height: 33rpx;
            }

            image {
              flex-shrink: 0;
              width: 75rpx;
            }
          }
        }

        .item3 {
          view {
            width: 100%;
            height: 129rpx;
            padding: 0 30rpx;
            display: flex;
            align-items: center;
            background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/index/bg2.png') left top/100%
              100% no-repeat;

            .name {
              font-size: 24rpx;
              color: #000000;
              margin-right: 30rpx;
            }

            .title {
              font-size: 22rpx;
              color: #b3b5b5;
            }
          }
        }
      }
    }
  }
}
</style>
