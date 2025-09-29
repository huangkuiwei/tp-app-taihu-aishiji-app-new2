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
            <text @click="$toRouter('/pages/historyPlan/historyPlan')">历史记录</text>
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

          <view class="chart">
            <l-echart ref="chartRef" @finished="init" />
          </view>

          <!--<view class="expected">-->
          <!--  <text>一周后</text>-->
          <!--  <text>的理想变化</text>-->
          <!--  <text>-{{ lastPlanData.weekly_loss_weight }}kg</text>-->
          <!--</view>-->

          <view class="recode" @click="$toRouter('/pages/weightData/weightData')">记录体重》</view>

          <view class="options">
            <text
              @click="
                $toRouter(
                  '/pages/resetPlan/resetPlan',
                  `plan_id=${lastPlanData.plan_id}&plan_initial_weight=${lastPlanData.plan_initial_weight}&plan_target_weight=${lastPlanData.plan_target_weight}&start_date=${lastPlanData.start_date}&end_date=${lastPlanData.end_date}`,
                )
              "
            >
              重置方案
            </text>
            <text @click="deletePlan">删除方案</text>
          </view>
        </view>
      </view>

      <view class="cookbook-box">
        <view class="cookbook-title">每日食谱</view>

        <view class="time-nav">
          <view class="time-item" v-for="(item, key) of dateList" :key="key" @click="selectDateKey = key">
            <text class="date">{{ key.slice(5, 10) }}</text>
            <text class="line" :style="{ background: selectDateKey === key ? '#0abf92' : 'translate' }"></text>
          </view>
        </view>

        <view class="cookbook-list">
          <view class="cookbook-item" v-for="(item, key) of dateList[selectDateKey]" :key="key">
            <view class="cookbook-title">
              <text>{{ currentFoodData(item, key).typeName }}</text>
              <text>{{ currentFoodData(item).currentCalorie }}千卡（{{ currentFoodData(item).ratio }}%）</text>
            </view>

            <view class="food-list">
              <view class="food-item" v-for="(item1, key1) of item" :key="key1">
                <text>{{ item1.name }}</text>
                <text>{{ item1.calorie }}千卡/{{ item1.weight }}克</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="plan-item motion-plan" :class="{ vip: isVip }">
        <view class="plan-name">定制化运动方案</view>

        <view class="plan-detail1" v-if="isVip">
          <view class="progress">
            <text :style="{ width: exercisesProgress.progress + '%' }"></text>
          </view>

          <view class="progress-tip">
            <text>减重计划</text>
            <text>第{{ exercisesProgress.finishDay }}/{{ exercisesProgress.totalDay }}天</text>
          </view>

          <view class="time-nav">
            <view class="time-item" v-for="(item, key) of dateList" :key="key" @click="selectDateKey1 = key">
              <text class="date">{{ isToday(key) ? '今日训练' : key.slice(5, 10) }}</text>
              <text class="line" :style="{ background: selectDateKey1 === key ? '#0abf92' : 'translate' }"></text>
            </view>
          </view>

          <view class="exercises-list">
            <view class="exercises-item" v-for="item of exercisesPlanData" :key="item.id">
              <image mode="widthFix" :src="item.image_url" />

              <view class="info">
                <view class="name">{{ item.name }}</view>

                <view class="content">
                  <text>{{ item.content }}</text>
                  <text>{{ item.calorie }}千卡</text>
                </view>
              </view>

              <template v-if="isNotStart">
                <view class="no-start">未开始</view>
              </template>

              <view @click.capture.stop="onCheckboxClick(item)" v-else>
                <checkbox-group>
                  <checkbox value="1" :checked="item.is_completed.includes('1')" />
                </checkbox-group>
              </view>
            </view>
          </view>
        </view>

        <view class="no-permission" v-else>
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/weightManagementPlan/lock.png"
          />

          <text>会员专享</text>
        </view>
      </view>

      <view class="plan-item life-plan" :class="{ vip: isVip }">
        <view class="plan-name">定制化生活方案</view>

        <view class="plan-detail2" v-if="isVip">
          <view class="replace" @click="refreshLife">换一换</view>

          <view class="left-title">今日生活计划</view>

          <view class="life-list">
            <view class="life-item" v-for="item of lifestylePlanData" :key="item.category">
              <image mode="widthFix" :src="item.image_url" />

              <view class="info">
                <view class="name">{{ item.content }}</view>
                <view class="content">{{ item.benefit }}</view>
              </view>
            </view>
          </view>
        </view>

        <view class="no-permission" v-else>
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/weightManagementPlan/lock.png"
          />

          <text>会员专享</text>
        </view>
      </view>

      <view class="unlock" v-if="!isVip">
        <text @click="$toRouter('/pages/vip/vip')">解锁会员体验更多功能</text>
      </view>

      <view class="unlock" v-else>
        <text @click="recode">去记录</text>
      </view>
    </view>

    <add-motion-recode-dialog ref="addMotionRecodeDialog" @addRecode="addMotionRecode" />
  </view>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';
import AddMotionRecodeDialog from '@/pages/recode/addMotionRecodeDialog.vue';

let chart = null;

export default {
  name: 'weightManagementPlan',

  components: {
    AddMotionRecodeDialog,
  },

  data() {
    return {
      lastPlanData: {},
      weighData: {},
      dateList: [],
      selectDateKey: null,
      selectDateKey1: null,
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
      exercisesPlanData: [],
    };
  },

  onShow() {
    this.getLastPlanData();
    this._getUserInfo();
    this._getLifestyle();
  },

  computed: {
    ...mapState('app', ['userInfo', 'lifestylePlanData']),
    ...mapGetters('app', ['isVip']),

    currentFoodData() {
      return (foodList, type) => {
        let allCalorie = 0;

        Object.keys(this.dateList[this.selectDateKey]).forEach((key) => {
          this.dateList[this.selectDateKey][key].forEach((item) => {
            allCalorie += item.calorie;
          });
        });

        let typeName = '';
        let currentCalorie = 0;

        if (type === '1') {
          typeName = '早餐';
        } else if (type === '2') {
          typeName = '早加餐';
        } else if (type === '3') {
          typeName = '午餐';
        } else if (type === '4') {
          typeName = '午加餐';
        } else if (type === '5') {
          typeName = '晚餐';
        }

        foodList.forEach((item) => {
          currentCalorie += item.calorie;
        });

        return {
          typeName,
          currentCalorie,
          ratio: Number(((currentCalorie / allCalorie) * 100).toFixed(2)),
        };
      };
    },

    isWeightLoss() {
      return this.lastPlanData.plan_initial_weight - this.lastPlanData.plan_target_weight > 0;
    },

    exercisesProgress() {
      if (!this.lastPlanData.end_date) {
        return {};
      }

      let total =
        new Date(this.lastPlanData.end_date.replace(/-/g, '/')) -
        new Date(this.lastPlanData.start_date.replace(/-/g, '/'));
      let totalDay = Math.ceil(total / (24 * 60 * 60 * 1000));

      let finish = new Date() - new Date(this.lastPlanData.start_date.replace(/-/g, '/'));
      let finishDay = Math.ceil(finish / (24 * 60 * 60 * 1000));

      let progress = (finishDay / totalDay) * 100;

      if (progress < 0) {
        progress = 0;
      } else if (progress > 100) {
        progress = 100;
      }

      return {
        totalDay,
        finishDay,
        progress: progress,
      };
    },

    isNotStart() {
      if (!this.selectDateKey1) {
        return undefined;
      }

      let time = new Date(this.selectDateKey1.replace(/-/g, '/')).getDate();
      let now = new Date().getDate();

      return time !== now;
    },

    isToday() {
      return (time) => {
        let time1 = new Date(time.replace(/-/g, '/')).getDate();
        let now = new Date().getDate();

        return time1 === now;
      };
    },
  },

  watch: {
    selectDateKey1(value) {
      this.getExercises(value);
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
    ...mapMutations('app', ['_setLifestyle']),
    ...mapActions('app', ['_getUserInfo', '_getLifestyle']),

    async init() {
      chart = await this.$refs.chartRef.init(echarts);
      chart.setOption(this.option);
    },

    /**
     * 获取最新一次计划数据
     */
    getLastPlanData() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http.get('api/diet-info/weight-plan/last').then((res) => {
        this.getRecodeWeightData(res.data.plan_id);

        let dateList = {};

        res.data.recipes_list.forEach((item) => {
          let date = item.date;

          if (dateList[date]) {
            dateList[date].push(item);
          } else {
            dateList[date] = [item];
          }
        });

        Object.keys(dateList).forEach((dateListKey, index) => {
          let foodList = {};
          let item = dateList[dateListKey];

          item.forEach((item) => {
            let type = item.type;

            if (foodList[type]) {
              foodList[type].push(item);
            } else {
              foodList[type] = [item];
            }
          });

          if (index === 0) {
            this.selectDateKey = dateListKey;
            this.selectDateKey1 = dateListKey;
          }

          dateList[dateListKey] = foodList;
        });

        this.lastPlanData = res.data;
        this.dateList = dateList;
      });
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
          uni.hideLoading();

          res.data.weight_list = res.data.weight_list || [];
          this.weighData = res.data;

          this.option.xAxis.data = res.data.weight_list.map((item) => item.date_time.slice(6, 10));
          this.option.series[0].data = res.data.weight_list.map((item) => item.weight);

          setTimeout(() => {
            chart.setOption(this.option);
          }, 500);
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
              title: '加载中...',
              mask: true,
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

    getExercises(time) {
      $http
        .post('api/diet-info/daily-exercises', {
          date: new Date(time.replace(/-/g, '/')).format(),
        })
        .then((res) => {
          res.data.forEach((item) => {
            if (item.is_completed) {
              item.is_completed = ['1'];
            } else {
              item.is_completed = [];
            }
          });

          this.exercisesPlanData = res.data;
        });
    },

    onCheckboxClick(item) {
      if (!item.is_completed.includes('1')) {
        uni.showModal({
          title: '温馨提示',
          content: '您确定完成了此项训练吗？',
          confirmText: '完成',
          success: (res) => {
            if (res.confirm) {
              item.is_completed = ['1'];

              uni.showLoading({
                title: '加载中...',
                mask: true,
              });

              $http
                .post('api/diet-info/complete-exercise', {
                  exercise_item_id: item.id,
                })
                .then(() => {
                  uni.hideLoading();

                  uni.showToast({
                    title: '操作成功',
                    icon: 'none',
                  });

                  this.getExercises();
                });
            }
          },
        });
      }
    },

    refreshLife() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post(
          'api/diet-info/regenerate-lifestyle-advices',
          {},
          {
            timeout: 90000,
          },
        )
        .then((res) => {
          uni.hideLoading();
          this._setLifestyle(res.data);
        });
    },

    recode() {
      this.$refs.addMotionRecodeDialog.open();
    },

    addMotionRecode(event) {
      this.$refs.addMotionRecodeDialog.close();

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post(
          'api/diet-info/exercise-analysis',
          {
            text: event.text,
            input_type: event.input_type,
            type: event.type,
            date_time: new Date().format(),
          },
          {
            timeout: 90000,
          },
        )
        .then((res) => {
          if (res.data && !res.data.length) {
            uni.hideLoading();

            uni.showModal({
              title: '温馨提示',
              content: '未检出到运动项目，请重新输入',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  this.$toBack();
                }
              },
            });

            return;
          }

          $http
            .post(
              'api/diet-info/create-batch',
              {
                food_batch: res.data,
              },
              {
                timeout: 90000,
              },
            )
            .then(() => {
              uni.hideLoading();

              uni.showToast({
                title: '添加成功',
                icon: 'none',
              });
            });
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

    .cookbook-box {
      padding: 43rpx 25rpx;
      align-self: stretch;
      background: #ffffff;
      border-radius: 20rpx;
      margin-bottom: 20rpx;

      .cookbook-title {
        font-weight: 500;
        font-size: 28rpx;
        color: #1a1a1a;
        margin-bottom: 33rpx;
      }

      .time-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18rpx;

        .time-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .date {
            font-size: 24rpx;
            color: #1a1a1a;
            padding-bottom: 14rpx;
          }

          .line {
            width: 60rpx;
            height: 5rpx;
          }
        }
      }

      .cookbook-list {
        display: flex;
        flex-direction: column;
        gap: 20rpx;

        .cookbook-item {
          background: #e1faff;
          border-radius: 20rpx;
          padding: 24rpx;

          .cookbook-title {
            display: flex;
            align-items: center;
            margin-bottom: 26rpx;

            text {
              &:nth-child(1) {
                font-size: 28rpx;
                color: #1a1a1a;
                margin-right: 14rpx;
              }

              &:nth-child(2) {
                font-size: 22rpx;
                color: #fe5b1f;
              }
            }
          }

          .food-list {
            display: flex;
            flex-direction: column;
            gap: 20rpx;

            .food-item {
              display: flex;
              align-items: center;
              justify-content: space-between;

              text {
                font-size: 22rpx;
                color: #1a1a1a;
              }
            }
          }
        }
      }
    }

    .plan-item {
      align-self: stretch;
      background: #ffffff;
      border-radius: 20rpx;
      padding: 40rpx 25rpx;
      margin-bottom: 20rpx;
      position: relative;

      &.life-plan {
        margin-bottom: 30rpx;
      }

      &.vip {
        background: linear-gradient(180deg, rgba(204, 255, 238, 0.9) 0%, rgba(255, 255, 255, 0.93) 25%, #ffffff 100%);
      }

      .plan-name {
        font-weight: 500;
        font-size: 28rpx;
        color: #1a1a1a;
      }

      .plan-detail1 {
        .progress {
          margin: 44rpx 0 25rpx;
          height: 18rpx;
          background: #f6f7fb;
          border-radius: 9rpx;
          position: relative;

          text {
            position: absolute;
            height: 18rpx;
            background: #0abf92;
            border-radius: 9rpx;
          }
        }

        .progress-tip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 50rpx;

          text {
            font-size: 26rpx;

            &:nth-child(1) {
              color: #333333;
            }

            &:nth-child(2) {
              color: #555555;
            }
          }
        }

        .time-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18rpx;

          .time-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .date {
              font-size: 24rpx;
              color: #1a1a1a;
              padding-bottom: 14rpx;
            }

            .line {
              width: 60rpx;
              height: 5rpx;
            }
          }
        }

        .exercises-list {
          display: flex;
          flex-direction: column;
          gap: 20rpx;

          .exercises-item {
            background: #f6f7fb;
            padding: 16rpx;
            display: flex;
            border-radius: 20rpx;
            align-items: center;

            image {
              width: 80rpx;
              border-radius: 20rpx;
              margin-right: 26rpx;
            }

            .info {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              gap: 15rpx;

              .name {
                font-size: 26rpx;
                color: #333333;
              }

              .content {
                text {
                  &:nth-child(1) {
                    color: #999999;
                    font-size: 22rpx;
                    margin-right: 10rpx;
                  }

                  &:nth-child(2) {
                    color: #ffa537;
                    font-size: 22rpx;
                  }
                }
              }
            }

            .no-start {
              font-size: 24rpx;
              color: #999999;
            }

            checkbox {
              transform: scale(0.6);
            }
          }
        }
      }

      .plan-detail2 {
        .replace {
          position: absolute;
          right: 20rpx;
          top: 42rpx;
          font-size: 24rpx;
          color: #0abf92;
        }

        .left-title {
          padding: 48rpx 0 30rpx;
          font-size: 26rpx;
          color: #333333;
        }

        .life-list {
          display: flex;
          flex-direction: column;
          gap: 20rpx;

          .life-item {
            display: flex;
            align-items: center;

            image {
              width: 80rpx;
              border-radius: 20rpx;
              margin-right: 26rpx;
            }

            .info {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              gap: 15rpx;

              .name {
                font-size: 26rpx;
                color: #333333;
              }

              .content {
                font-size: 22rpx;
                color: #999999;
              }
            }
          }
        }
      }

      .no-permission {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 50rpx 0;

        image {
          width: 60rpx;
          margin-bottom: 20rpx;
        }

        text {
          font-size: 26rpx;
          color: #333333;
        }
      }
    }

    .unlock {
      display: flex;
      align-items: center;
      justify-content: center;

      text {
        width: 590rpx;
        height: 100rpx;
        background: #0abf92;
        border-radius: 50rpx;
        font-size: 32rpx;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
