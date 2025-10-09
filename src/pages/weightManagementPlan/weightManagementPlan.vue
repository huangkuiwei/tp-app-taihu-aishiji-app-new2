<template>
  <view class="weight-management-plan-page">
    <view class="plan-title">
      <view>已为你生成</view>
      <view>专属健康方案</view>
      <view>体重管理方案</view>
    </view>

    <view class="plan-box">
      <view class="plan-box-title">卡路里缺口 完成计划所需每天消耗或摄入的卡路里</view>

      <!-- TODO 缺少字段 -->
      <view class="plan-data">
        <text>-770</text>
        <text>千卡/天</text>
      </view>

      <!-- TODO 缺少字段 -->
      <view class="suggest">
        <view class="suggest-item">
          <view>建议食物摄入</view>
          <view>
            <text>1090</text>
            <text>千卡/天</text>
          </view>
        </view>

        <view class="suggest-item">
          <view>碳水</view>
          <view>123克</view>
        </view>

        <view class="suggest-item">
          <view>蛋白质</view>
          <view>85克</view>
        </view>

        <view class="suggest-item">
          <view>脂肪</view>
          <view>30克</view>
        </view>
      </view>

      <view class="suggest2">
        <image
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/head.png"
        />

        <!-- TODO 缺少字段 -->
        <view class="content">
          你的目标是91天从69.8公斤减到60公斤，每天需770大卡缺口，难度适中。饮食选高蛋白(瘦肉、鱼虾、蛋)、高纤维蔬菜，控精制糖和高油，按建议摄入碳水123g、蛋白82g、脂肪每30g。每天加30-45分钟有氧(快走/慢跑)，一周2次力量训练肌肉。坚持住，你一定能达成!
        </view>
      </view>

      <view class="chart-box">
        <view class="chart-item2">
          <image
            class="recode"
            @click="$toRouter('/pages/weightData/weightData')"
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/btn1.png"
          />

          <view class="options">
            <image
              @click="
                $toRouter(
                  '/pages/resetPlan/resetPlan',
                  `plan_id=${lastPlanData.plan_id}&plan_initial_weight=${lastPlanData.plan_initial_weight}&plan_target_weight=${lastPlanData.plan_target_weight}&start_date=${lastPlanData.start_date}&end_date=${lastPlanData.end_date}`,
                )
              "
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/btn2.png"
            />

            <image
              @click="deletePlan"
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/btn3.png"
            />
          </view>
        </view>
      </view>
    </view>

    <view class="cookbook">
      <view class="cookbook-title">
        <image
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/word1.png"
        />
      </view>

      <view class="cookbook-box">
        <view class="time-nav">
          <view
            class="time-item"
            :class="{ active: selectDateKey === key }"
            v-for="(item, key, index) of dateList"
            :key="key"
            @click="selectDateKey = key"
          >
            <text class="date">第{{ index + 1 }}天</text>
          </view>
        </view>

        <view class="cookbook-list">
          <!-- TODO 缺少餐饮icon 时间段 -->
          <view class="cookbook-item" v-for="(item, key) of dateList[selectDateKey]" :key="key">
            <view class="cookbook-title">
              <image
                mode="widthFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/head.png"
              />
              <text class="name">{{ currentFoodData(item, key).typeName }}</text>
              <text class="total">总摄入 {{ currentFoodData(item).currentCalorie }}千卡</text>
            </view>

            <view class="food-list">
              <view class="food-item" v-for="(item1, key1) of item" :key="key1">
                <text>{{ item1.name }}</text>
                <text>{{ item1.weight }}克</text>
                <text>{{ item1.calorie }}千卡</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="plan-item motion-plan" :class="{ vip: isVip }">
      <view class="plan-name">
        <image
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/word2.png"
        />
      </view>

      <view class="plan-detail1" v-if="isVip">
        <view class="progress-tip">
          <view>运动打卡连续</view>
          <view>
            第
            <text>{{ exercisesProgress.finishDay }}/{{ exercisesProgress.totalDay }}</text>
            天
          </view>
        </view>

        <view class="time-nav">
          <view
            class="time-item"
            :class="{ active: selectDateKey1 === key }"
            v-for="(item, key) of dateList"
            :key="key"
            @click="selectDateKey1 = key"
          >
            <text class="date">{{ isToday(key) ? '今日' : key.slice(5, 10).replace('-', '.') }}</text>
          </view>
        </view>

        <view class="exercises-list">
          <view
            class="exercises-item"
            :class="{ notStart: item.is_completed.includes('1') }"
            v-for="item of exercisesPlanData"
            :key="item.id"
          >
            <image mode="widthFix" :src="item.image_url" />
            <view class="name">{{ item.name }}</view>
            <text class="content">{{ item.content }}/{{ item.calorie }}千卡</text>

            <template v-if="isNotStart">
              <view class="no-start">未开始</view>
            </template>

            <view @click.capture.stop="onCheckboxClick(item)" v-else>
              <checkbox-group>
                <checkbox color="#3DBC08" value="1" :checked="item.is_completed.includes('1')" />
              </checkbox-group>
            </view>
          </view>
        </view>
      </view>

      <view class="no-permission" v-else>
        <image
          class="img1"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/word3.png"
        />

        <image
          class="img2"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/btn4.png"
        />
      </view>
    </view>

    <view class="plan-item life-plan" :class="{ vip: isVip }">
      <view class="plan-name">
        <image
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/word4.png"
        />
      </view>

      <view class="plan-detail2" v-if="isVip">
        <view class="left-title">
          <text>今日生活计划</text>
          <text class="replace" @click="refreshLife">换一换</text>
        </view>

        <view class="life-list">
          <!-- TODO 接口数据结构要修改 -->
          <view class="life-item" v-for="item of lifestylePlanData" :key="item.category">
            <view class="name">{{ item.benefit }}</view>

            <view class="info">
              <view class="info-item">{{ item.benefit }}</view>
              <view class="info-item">{{ item.benefit }}</view>
              <view class="info-item">{{ item.benefit }}</view>
            </view>
          </view>
        </view>
      </view>

      <view class="no-permission" v-else>
        <image
          class="img1"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/word3.png"
        />

        <image
          class="img2"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/btn4.png"
        />
      </view>
    </view>

    <view class="unlock" v-if="isVip">
      <text @click="recode">去记录</text>
    </view>

    <add-motion-recode-dialog ref="addMotionRecodeDialog" @addRecode="addMotionRecode" />
  </view>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import $http from '@/utils/http';
import AddMotionRecodeDialog from '@/pages/recode/addMotionRecodeDialog.vue';

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

    /**
     * 获取最新一次计划数据
     */
    getLastPlanData() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      // TODO 后端接口只需要返回最近5天
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

<style scoped lang="scss">
.weight-management-plan-page {
  // TODO 背景切图有问题
  background: #f2f3ee url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/bg.png')
    left top/100% auto no-repeat;
  padding: 149rpx 46rpx 100rpx;

  .plan-title {
    padding: 0 22rpx;
    margin-bottom: 34rpx;

    view {
      &:nth-child(1) {
        font-size: 32rpx;
        color: #000000;
        margin-bottom: 20rpx;
      }

      &:nth-child(2) {
        font-weight: 500;
        font-size: 50rpx;
        color: #000000;
        margin-bottom: 120rpx;
      }

      &:nth-child(3) {
        font-weight: bold;
        font-size: 32rpx;
        color: #404141;
      }
    }
  }

  .plan-box {
    background: #ffffff;
    border-radius: 30rpx;
    padding: 48rpx 34rpx;
    margin-bottom: 53rpx;

    .plan-box-title {
      font-size: 24rpx;
      color: #000000;
      margin-bottom: 17rpx;
    }

    .plan-data {
      display: flex;
      align-items: center;
      margin-bottom: 60rpx;

      text {
        &:nth-child(1) {
          color: #7dbf2a;
          font-size: 47rpx;
          font-weight: bold;
        }

        &:nth-child(2) {
          color: #000000;
          font-size: 24rpx;
          position: relative;
          top: 6rpx;
        }
      }
    }

    .suggest {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 44rpx;

      .suggest-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8rpx;

        &:nth-child(1) {
          align-items: self-start;

          view {
            &:nth-child(2) {
              display: flex;
              align-items: center;

              text {
                &:nth-child(1) {
                  color: #fd1c61;
                  font-size: 47rpx;
                  font-weight: bold;
                }

                &:nth-child(2) {
                  color: #000000;
                  font-size: 24rpx;
                  position: relative;
                  top: 6rpx;
                }
              }
            }
          }
        }

        view {
          &:nth-child(1) {
            font-size: 24rpx;
            color: #000000;
          }

          &:nth-child(2) {
            font-weight: 600;
            font-size: 24rpx;
            color: #000000;
          }
        }
      }
    }

    .suggest2 {
      display: flex;
      margin-bottom: 37rpx;

      image {
        flex-shrink: 0;
        width: 90rpx;
        margin-right: 28rpx;
      }

      .content {
        font-size: 24rpx;
        color: #000000;
        line-height: 32rpx;
        position: relative;
        top: 19rpx;
      }
    }

    .chart-box {
      .chart-item2 {
        .recode {
          width: 100%;
          margin-bottom: 24rpx;
        }

        .options {
          display: flex;
          align-items: center;
          justify-content: space-between;

          image {
            width: 295rpx;
          }
        }
      }
    }
  }

  .cookbook {
    margin-bottom: 39rpx;

    .cookbook-title {
      padding-left: 18rpx;
      margin-bottom: 34rpx;

      image {
        width: 129rpx;
      }
    }

    .cookbook-box {
      background: #ffffff;
      border-radius: 30rpx;
      padding: 18rpx 27rpx;

      .time-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 34rpx;

        .time-item {
          width: 116rpx;
          height: 39rpx;
          background: rgba(61, 188, 8, 0);
          border-radius: 20rpx;
          border: 2rpx solid #898989;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #898989;

          &.active {
            background: rgb(61, 188, 8);
            color: #f4ffed;
          }

          .date {
            font-weight: 500;
            font-size: 21rpx;
          }
        }
      }

      .cookbook-list {
        display: flex;
        flex-direction: column;
        gap: 30rpx;

        .cookbook-item {
          .cookbook-title {
            display: flex;
            align-items: center;
            padding: 0 25rpx;
            margin-bottom: 22rpx;

            image {
              width: 35rpx;
              margin-right: 7rpx;
            }

            .name {
              font-weight: 500;
              font-size: 25rpx;
              color: #000000;
              flex-grow: 1;
            }

            .total {
              font-weight: 500;
              font-size: 23rpx;
              color: #000000;
            }
          }

          .food-list {
            background: #fafff6;
            border-radius: 10rpx;
            padding: 24rpx 30rpx;
            display: flex;
            flex-direction: column;
            gap: 53rpx;

            .food-item {
              display: flex;
              align-items: center;
              justify-content: space-between;

              text {
                font-size: 23rpx;
                color: #686868;

                &:nth-child(1) {
                  font-size: 25rpx;
                  color: #000000;
                  flex-grow: 1;
                }

                &:nth-child(3) {
                  width: 90rpx;
                  text-align: right;
                }
              }
            }
          }
        }
      }
    }
  }

  .plan-item {
    margin-bottom: 39rpx;

    .plan-name {
      padding-left: 18rpx;
      margin-bottom: 34rpx;

      image {
        width: 194rpx;
      }
    }

    .plan-detail1 {
      background: #ffffff;
      border-radius: 30rpx;
      padding: 26rpx 17rpx;

      .progress-tip {
        padding: 0 13rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 50rpx;

        view {
          color: #404141;
          font-size: 27rpx;

          &:nth-child(2) {
            text {
              margin: 0 10rpx;
              padding: 2rpx 10rpx;
              background: #e3ffbf;
              border-radius: 10rpx;
              font-weight: bold;
            }
          }
        }
      }

      .time-nav {
        padding: 0 6rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 35rpx;

        .time-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 26rpx;
          color: #333333;

          &.active {
            font-weight: 600;
            font-size: 26rpx;
            color: #3dbc08;
          }
        }
      }

      .exercises-list {
        display: flex;
        flex-direction: column;
        gap: 20rpx;

        .exercises-item {
          background: #eeeeee;
          padding: 10rpx 13rpx;
          display: flex;
          border-radius: 10rpx;
          align-items: center;
          border: 2px solid #eeeeee;

          &.notStart {
            background: #fafff6;
            border: 2px solid #3dbc08;
          }

          image {
            width: 60rpx;
            border-radius: 50%;
            margin-right: 11rpx;
          }

          .name {
            flex-grow: 1;
            font-size: 27rpx;
            color: #000000;
          }

          .content {
            font-size: 24rpx;
            color: #404141;
            margin-right: 26rpx;
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
      background: #ffffff;
      border-radius: 30rpx;
      padding: 26rpx 17rpx;

      .left-title {
        padding: 0 13rpx;
        font-size: 27rpx;
        color: #404141;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 39rpx;

        .replace {
          font-size: 27rpx;
          color: #3dbc08;
        }
      }

      .life-list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16rpx;

        .life-item {
          width: 201rpx;
          height: 233rpx;
          background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/weightManagementPlan/bg2.png')
            left top/100% 100% no-repeat;
          padding-top: 21rpx;
          display: flex;
          flex-direction: column;
          align-items: center;

          .name {
            font-weight: 500;
            font-size: 27rpx;
            color: #404141;
            margin-bottom: 35rpx;
          }

          .info {
            display: flex;
            flex-direction: column;
            gap: 20rpx;

            .name {
              font-size: 26rpx;
              color: #333333;
            }

            .info-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 20rpx;
              font-size: 21rpx;
              color: #404141;
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
      height: 474rpx;
      // TODO 背景图片修改
      background: #ffffff;
      border-radius: 30rpx;

      .img1 {
        width: 507rpx;
        margin-bottom: 59rpx;
      }

      .img2 {
        width: 390rpx;
      }
    }
  }

  .unlock {
    display: flex;
    align-items: center;
    justify-content: center;

    text {
      width: 497rpx;
      height: 96rpx;
      background: linear-gradient(0deg, #dcfc96 0%, #b5fe1a 100%);
      border-radius: 48rpx;
      font-weight: bold;
      font-size: 37rpx;
      color: #090706;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
