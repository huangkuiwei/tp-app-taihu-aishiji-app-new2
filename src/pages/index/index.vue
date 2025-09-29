<template>
  <view class="index-page">
    <view class="page-title">首页</view>

    <view class="banner">
      <view class="score">
        <view class="left">
          <view class="number">
            <text v-if="isWeightLoss">{{ (homeWeightPlanData && homeWeightPlanData.weight_loss) || 0 }}</text>
            <text v-else>{{ (homeWeightPlanData && -homeWeightPlanData.weight_loss) || 0 }}</text>
            <text>公斤</text>
          </view>

          <view class="tip">{{ isWeightLoss ? '「已减重」' : '「已增肌」' }}</view>
        </view>

        <view class="right">
          <view v-if="!isLogin" class="add-plan" @click="addPlan">
            <text class="add-text">请先登录</text>
            <view class="tip">
              <text>登录账号后</text>
              <text>获取专属减脂方案</text>
            </view>
          </view>

          <template v-else-if="homeWeightPlanData">
            <view v-if="homeWeightPlanData.state === 1" class="detail" @click="goWeightManage">
              <view class="item">
                <text>{{ homeWeightPlanData.plan_countdown }}天</text>
                <text>计划倒计时</text>
              </view>

              <view class="item">
                <text>{{ homeWeightPlanData.plan_target_weight }}KG</text>
                <text>目标体重</text>
              </view>
            </view>

            <view v-else-if="homeWeightPlanData.state === 2" class="add-plan" @click="addPlan">
              <text class="add-icon">+</text>

              <text class="add-text">创建下阶段计划</text>
              <view class="tip">
                <text>恭喜达成</text>
                <text>继续趁热打铁</text>
              </view>
            </view>

            <view v-else-if="homeWeightPlanData.state === 3" class="add-plan" @click="addPlan">
              <text class="add-icon">+</text>

              <text class="add-text">创建下阶段计划</text>
              <view class="tip">
                <text>计划已过期</text>
                <text>请重新创建</text>
              </view>
            </view>
          </template>

          <view v-else class="add-plan" @click="addPlan">
            <text class="add-icon">+</text>

            <template v-if="userDetailInfo">
              <text class="add-text">创建计划</text>
              <view class="tip">
                <text>科学合理的计划</text>
                <text>是减脂成功的第一步哦</text>
              </view>
            </template>

            <template v-else>
              <text class="add-text">补充信息</text>
              <view class="tip">
                <text>补充信息后</text>
                <text>获取专属减脂方案</text>
              </view>
            </template>
          </view>
        </view>
      </view>

      <view class="progress-container" @click="jumpAi(jkzsChat)">
        <view class="progress">
          <view class="img">
            <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/home/doctor2.png" />
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/home/tip-btn2.png"
            />
          </view>

          <view class="current">当前</view>
          <view class="target">目标</view>
        </view>

        <view class="progress-chart">
          <view style="width: 750rpx">
            <l-echart ref="chartRef" @finished="initChart" />
          </view>
        </view>
      </view>
    </view>

    <view class="get-way-btn" @click="goWeightManage">
      <image
        v-if="homeWeightPlanData && homeWeightPlanData.state === 1"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/home/get-way-btn2.png"
      />

      <image
        v-else
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/home/get-way-btn.png"
      />
    </view>

    <view class="ai">
      <view class="ai-title">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/home/ai-icon.png" />
      </view>

      <view class="ai-list">
        <view class="item1">
          <view
            :style="{
              background: `url(${item.logo}) left top/100% auto no-repeat`,
            }"
            v-for="item of aiChartList.slice(0, 3)"
            :key="item.id"
            @click="jumpAi(item)"
          >
            <text>{{ item.name }}</text>
          </view>
        </view>

        <view class="item2">
          <view v-for="item of aiChartList.slice(3)" :key="item.id" @click="jumpAi(item)">
            <text>{{ item.name }}</text>
            <image mode="widthFix" :src="item.logo" />
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
            startAngle: 210,
            endAngle: -30,
            min: 0,
            max: 100,
            splitNumber: 12,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#0ABF92', // 起始颜色
                },
                {
                  offset: 1,
                  color: '#9AE9CC', // 结束颜色
                },
              ]),
              shadowColor: 'transparent',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
            progress: {
              show: true,
              roundCap: true,
              width: 16,
            },
            pointer: {
              show: false,
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 16,
                color: [[1, '#9AE9CC']],
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
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height) + 35rpx) 0 37rpx;
    background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/home/banner-bg.png') left top/100% auto
      no-repeat;

    .score {
      padding: 0 30rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 22rpx;

      .left {
        display: flex;
        flex-direction: column;
        align-items: center;

        .number {
          margin-bottom: 20rpx;
          font-weight: bold;
          color: #111111;

          text {
            &:nth-child(1) {
              font-size: 170rpx;
            }

            &:nth-child(2) {
              font-size: 32rpx;
            }
          }
        }

        .tip {
          font-size: 36rpx;
          color: #1a1a1a;
          font-weight: 500;
        }
      }

      .right {
        background: #ffffff;
        width: 240rpx;
        height: 240rpx;
        border-radius: 20rpx;
        position: relative;

        .login {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          color: #aaaaaa;
        }

        .detail {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 44rpx;

          .item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            text {
              &:nth-child(1) {
                font-size: 28rpx;
                color: #111111;
                font-weight: 500;
                margin-bottom: 16rpx;
              }

              &:nth-child(2) {
                font-size: 22rpx;
                color: #999999;
              }
            }
          }
        }

        .add-plan {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24rpx;

          .add-icon {
            background: #bef054;
            border-radius: 50%;
            width: 39rpx;
            height: 39rpx;
            font-size: 28rpx;
            color: #333333;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .add-text {
            font-size: 28rpx;
            color: #111111;
            font-weight: 500;
          }

          .tip {
            font-size: 22rpx;
            color: #999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            text {
              line-height: 29rpx;
            }
          }
        }
      }
    }

    .progress-container {
      padding: 64rpx 68rpx 0;
      position: relative;

      .progress {
        position: relative;
        padding-bottom: 14rpx;

        .img {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          image {
            &:nth-child(1) {
              width: 284rpx;
            }

            &:nth-child(2) {
              width: 384rpx;
            }
          }
        }

        .current,
        .target {
          position: absolute;
          bottom: 0;
          width: 96rpx;
          height: 50rpx;
          border-radius: 25rpx;
          font-size: 28rpx;
          display: flex;
          align-items: center;
          justify-content: center;

          &.current {
            left: 0;
            color: #111111;
            background: #9ae9cc;
          }

          &.target {
            right: 0;
            color: #ffffff;
            background: #0abf92;
          }
        }
      }

      .progress-chart {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        overflow: hidden;
      }
    }
  }

  .get-way-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;

    image {
      width: 690rpx;
    }
  }

  .ai {
    background: linear-gradient(0deg, #fcfcfc 0%, #f3f7fa 100%);
    box-shadow: 0 0 40rpx 0 rgba(236, 237, 233, 0.77);
    border-radius: 50rpx 50rpx 0 0;
    border: 2px solid #ffffff;
    padding: 40rpx 52rpx;

    .ai-title {
      margin-bottom: 38rpx;

      image {
        width: 180rpx;
      }
    }

    .ai-list {
      font-weight: 500;

      .item1 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;

        view {
          width: 202rpx;
          height: 180rpx;
          text-align: center;

          text {
            position: relative;
            top: 124rpx;
            font-size: 28rpx;
            color: #1a1a1a;
          }
        }
      }

      .item2 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;

        view {
          width: 314rpx;
          height: 130rpx;
          padding: 0 30rpx 0 34rpx;
          background: #ffffff;
          border-radius: 20rpx;
          margin-bottom: 20rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;

          text {
            font-size: 28rpx;
            color: #1a1a1a;
          }

          image {
            width: 64rpx;
          }
        }
      }
    }
  }
}
</style>
