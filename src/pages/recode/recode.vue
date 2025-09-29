<template>
  <view class="recode-page">
    <view class="page-title">记录</view>

    <view class="banner">
      <view class="date">
        <view
          class="item"
          :class="{ active: selectDate.currentDate === item.currentDate }"
          v-for="item of dateList"
          :key="item.day"
          @click="selectDay(item)"
        >
          <text>{{ item.day }}</text>
          <text>{{ item.date }}</text>
        </view>
      </view>
    </view>

    <view class="container">
      <view class="manage">
        <view class="top">每日热量管理</view>

        <template v-if="!isLogin">
          <view class="add-info" @click="addUserDetailInfo">
            <view>请先<text class="highlight">登录</text></view>
            <text>登录后您将获得推荐热量缺口</text>
          </view>
        </template>

        <template v-else-if="userDetailInfo">
          <view class="bottom">
            <view class="item">
              <text>{{ dailyCalorie.calorie_requirement || 0 }}</text>
              <text>热量推荐</text>
            </view>

            <view class="item">
              <text>{{ dailyCalorie.calorie_intake || 0 }}</text>
              <text>已摄入</text>
            </view>

            <view class="item">
              <text>{{ dailyCalorie.calorie_burn || 0 }}</text>
              <text>已消耗</text>
            </view>

            <view class="line"></view>

            <view class="item">
              <text>
                {{ canEatCalorie }}
              </text>
              <text>今日可吃</text>
            </view>
          </view>
        </template>

        <template v-else>
          <view class="add-info" @click="addUserDetailInfo">
            <view>请先<text class="highlight">完善个人基本信息</text></view>
            <text>完善后您将获得推荐热量缺口</text>
          </view>
        </template>
      </view>

      <view class="recode-box" v-if="!modify">
        <view class="toggle-btn" @click="changeRatio">修改碳蛋脂比例</view>

        <view class="title">每日饮食记录</view>
        <view class="used">
          <text v-if="userDetailInfo">已摄入：{{ dailyCalorie.calorie_intake || 0 }}千卡</text>
        </view>

        <view class="recode-list">
          <view v-for="(item, index) in foodRecodeList" :key="index" @click="selectRecodeItem = item">
            <image mode="heightFix" :src="item.icon" />
            <text class="text">{{ item.text }}</text>
            <text v-if="selectRecodeItem.type === item.type" class="line"></text>
          </view>
        </view>

        <view class="line"></view>

        <view class="food-list" v-if="selectRecodeItem.foodList && selectRecodeItem.foodList.length">
          <view
            v-for="(item, index) of selectRecodeItem.foodList"
            :key="index"
            @click="$toRouter('/pages/foodAnalysis/foodAnalysis', `type=${item.type}&time=${item.date_time}`)"
          >
            <text>{{ item.name }}</text>
            <text>{{ item.weight }}克</text>
            <text>{{ item.calorie }}千卡</text>
          </view>
        </view>

        <view v-else class="empty-recode">
          <text>暂无{{ selectRecodeItem.text }}记录</text>
        </view>
      </view>

      <view class="modify-ratio" v-else>
        <view class="toggle-btn" @click="changeRatio">每日饮食记录</view>

        <view class="title">修改碳蛋脂比例</view>

        <view class="ratio-list">
          <view class="ratio-item">
            <view class="ratio-tip">
              <text>碳水化合物</text>
              <text>{{ dailyCalorie.carbohydrate_ratio }}%</text>
            </view>

            <slider
              :value="dailyCalorie.carbohydrate_ratio"
              activeColor="#78F788"
              backgroundColor="#78F78815"
              :block-size="20"
              :min="0"
              :max="100"
              :step="1"
              @changing="onRateChanging($event, 'carbohydrate_ratio')"
            />
          </view>

          <view class="ratio-item">
            <view class="ratio-tip">
              <text>蛋白质</text>
              <text>{{ dailyCalorie.protein_ratio }}%</text>
            </view>

            <slider
              :value="dailyCalorie.protein_ratio"
              activeColor="#FF7542"
              backgroundColor="#FF754215"
              :block-size="20"
              :min="0"
              :max="100"
              :step="1"
              @changing="onRateChanging($event, 'protein_ratio')"
            />
          </view>

          <view class="ratio-item">
            <view class="ratio-tip">
              <text>脂肪</text>
              <text>{{ dailyCalorie.fat_ratio }}%</text>
            </view>

            <slider
              :value="dailyCalorie.fat_ratio"
              activeColor="#FFD78F"
              backgroundColor="#FFD78F15"
              :block-size="20"
              :min="0"
              :max="100"
              :step="1"
              @changing="onRateChanging($event, 'fat_ratio')"
            />
          </view>
        </view>

        <view class="submit" @click="modifyRatio">
          <text>确认修改</text>
        </view>
      </view>

      <view class="exercises" v-if="isVip && isToday">
        <view class="exercises-title">今日训练</view>

        <view class="exercises-list" v-if="exercisesPlanData.length">
          <view class="exercises-item" v-for="item of exercisesPlanData" :key="item.id">
            <view class="point">·</view>
            <view class="name">{{ item.name }}</view>
            <view class="content">{{ item.content }}</view>
            <view class="calorie">{{ item.calorie }}千卡</view>

            <view @click.capture.stop="onCheckboxClick(item)">
              <checkbox-group>
                <checkbox value="1" :checked="item.is_completed.includes('1')" />
              </checkbox-group>
            </view>
          </view>
        </view>

        <view v-else class="empty-recode">
          <text>暂无训练记录</text>
        </view>
      </view>

      <view class="other-info">
        <view class="left" @click="goWeightData">
          <view class="title">体重</view>

          <template v-if="!isLogin">
            <view class="login">登录后查看</view>
          </template>

          <template v-else-if="userDetailInfo">
            <view class="update" v-if="updateTime">
              <text v-if="updateTime === 1">今天更新</text>
              <text v-else>{{ updateTime - 1 }}天前更新</text>
            </view>

            <view class="number">
              <text>{{ userDetailInfo.current_weight }}</text>
              <text>kg</text>
            </view>
          </template>

          <view class="add">+</view>
        </view>

        <view class="right" @click="showAddMotionRecodeDialog">
          <view class="title">运动</view>

          <view class="motion-list">
            <template v-if="!isLogin">
              <view class="login">登录后查看</view>
            </template>

            <template v-else-if="motionRecodeList.length">
              <view class="item" v-for="(item, index) of motionRecodeList" :key="index">
                <text>·{{ item.name }}</text>
                <text>{{ item.quantity }}分钟</text>
                <text>-{{ item.calorie }}千卡</text>
              </view>
            </template>

            <view v-else class="empty-recode"> 暂无运动记录 </view>
          </view>

          <template v-if="isLogin">
            <view class="total">总消耗{{ motionTotalCalorie }}千卡</view>
          </template>

          <view class="add">+</view>
        </view>
      </view>
    </view>

    <image
      @click="showAddFoodRecodeDialog"
      class="add-recode"
      mode="widthFix"
      src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/add-icon.png"
    />

    <add-food-recode-dialog ref="addFoodRecodeDialog" @addRecode="addRecode" @addImageRecode="addImageRecode" />
    <add-motion-recode-dialog ref="addMotionRecodeDialog" @addRecode="addMotionRecode" />
  </view>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { getRecentWeekDates, verifyIsLogin } from '@/utils';
import $http from '@/utils/http';
import AddMotionRecodeDialog from '@/pages/recode/addMotionRecodeDialog.vue';
import AddFoodRecodeDialog from '@/pages/recode/addFoodRecodeDialog.vue';

export default {
  name: 'recodePage',

  components: {
    AddFoodRecodeDialog,
    AddMotionRecodeDialog,
  },

  data() {
    return {
      dateList: [],
      selectDate: {},
      dailyCalorie: {},
      foodRecodeList: [
        {
          type: 1,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon1.png',
          text: '早餐',
          foodList: [],
        },

        {
          type: 3,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon2.png',
          text: '午餐',
          foodList: [],
        },

        {
          type: 5,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon3.png',
          text: '晚餐',
          foodList: [],
        },
        {
          type: 2,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon1.png',
          text: '早加餐',
          foodList: [],
        },
        {
          type: 4,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon2.png',
          text: '午加餐',
          foodList: [],
        },
        {
          type: 6,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon3.png',
          text: '晚加餐',
          foodList: [],
        },
      ],
      motionRecodeList: [],
      selectRecodeItem: {},
      modify: false,
      exercisesPlanData: [],
    };
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),
    ...mapGetters('app', ['isLogin', 'isVip']),

    updateTime() {
      if (this.userDetailInfo) {
        let date = new Date().format().slice(0, 10);
        let day =
          new Date(date + ' 23:59:59').getTime() -
          new Date(this.userDetailInfo.weight_recode_date.replace(/-/g, '/')).getTime();
        return Math.ceil(day / (24 * 60 * 60 * 1000));
      }

      return undefined;
    },

    motionTotalCalorie() {
      let total = 0;

      this.motionRecodeList.forEach((item) => {
        total += item.calorie;
      });

      return total;
    },

    isToday() {
      return this.selectDate.numberDay === new Date().getDay();
    },

    canEatCalorie() {
      let number =
        this.dailyCalorie.calorie_requirement + this.dailyCalorie.calorie_burn - this.dailyCalorie.calorie_intake;

      if (number < 0) {
        return 0;
      }

      return Number(number.toFixed(2)) || 0;
    },
  },

  async onLoad() {
    this.selectRecodeItem = this.foodRecodeList[0];
    this.dateList = getRecentWeekDates();

    for (const date of this.dateList) {
      if (date.numberDay === new Date().getDay()) {
        this.selectDate = date;
        break;
      }
    }
  },

  onShow() {
    this._getUserDetailInfo();
    this.getDailyFoods();
    this.getDailyCalorie();
    this.getExercises();

    let showAddFoodDialog = uni.getStorageSync('showAddFoodDialog');

    if (showAddFoodDialog) {
      uni.removeStorageSync('showAddFoodDialog');
      this.$refs.addFoodRecodeDialog.open();
    }
  },

  watch: {
    async selectDate() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      await this.getDailyFoods().catch(() => {});
      await this.getDailyCalorie().catch(() => {});

      uni.hideLoading();
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

    getDailyFoods() {
      return $http
        .post('api/diet-info/daily-list', {
          date: this.selectDate.currentDate.format(),
        })
        .then((res) => {
          this.foodRecodeList.forEach((item) => {
            let current = res.data.find((item1) => item1.type === item.type);

            item.foodList = (current && current.die_list) || [];

            if (item.type === this.selectRecodeItem.type) {
              this.selectRecodeItem = item;
            }
          });

          let motionItem = res.data.find((item1) => item1.type === 7);

          this.motionRecodeList = (motionItem && motionItem.die_list) || [];
        });
    },

    getDailyCalorie() {
      return $http
        .post(
          'api/diet-info/daily-calorie',
          {
            date: this.selectDate.currentDate.format(),
          },
          {
            hiddenErrorMessage: true,
          },
        )
        .then((res) => {
          res.data.carbohydrate_ratio = Math.round(res.data.carbohydrate_ratio * 100);
          res.data.protein_ratio = Math.round(res.data.protein_ratio * 100);
          res.data.fat_ratio = Math.round(res.data.fat_ratio * 100);

          this.dailyCalorie = res.data;
        })
        .catch((err) => {
          if (err.Msg === '未找到健康档案，请先完成健康评估') {
            this.dailyCalorie = {};
          } else {
            if (err.Code !== -100) {
              uni.showToast({
                title: err.Msg,
                icon: 'none',
                mask: true,
              });
            }
          }
        });
    },

    getExercises() {
      $http
        .post('api/diet-info/daily-exercises', {
          date: new Date().format(),
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
                  this.getDailyFoods();
                  this.getDailyCalorie();
                });
            }
          },
        });
      }
    },

    addUserDetailInfo() {
      verifyIsLogin();

      this.$toRouter('/pages/evaluation/evaluation');
    },

    selectDay(item) {
      if (item.currentDate.getTime() > new Date().getTime()) {
        uni.showToast({
          title: '暂无数据',
          icon: 'none',
        });

        return;
      }

      this.selectDate = item;
    },

    changeRatio() {
      if (!this.userDetailInfo) {
        verifyIsLogin();

        this.$toRouter('/pages/evaluation/evaluation');
      } else {
        this.modify = !this.modify;
      }
    },

    onRateChanging(event, filed) {
      this.dailyCalorie[filed] = event.detail.value;

      // 保持总比例为100%
      if (filed === 'carbohydrate_ratio') {
        if (Number(this.dailyCalorie.protein_ratio)) {
          this.dailyCalorie.protein_ratio =
            100 - Number(this.dailyCalorie.carbohydrate_ratio) - Number(this.dailyCalorie.fat_ratio);
        } else {
          this.dailyCalorie.fat_ratio =
            100 - Number(this.dailyCalorie.carbohydrate_ratio) - Number(this.dailyCalorie.protein_ratio);
        }
      } else if (filed === 'protein_ratio') {
        if (Number(this.dailyCalorie.fat_ratio)) {
          this.dailyCalorie.fat_ratio =
            100 - Number(this.dailyCalorie.carbohydrate_ratio) - Number(this.dailyCalorie.protein_ratio);
        } else {
          this.dailyCalorie.carbohydrate_ratio =
            100 - Number(this.dailyCalorie.protein_ratio) - Number(this.dailyCalorie.fat_ratio);
        }
      } else if (filed === 'fat_ratio') {
        if (Number(this.dailyCalorie.carbohydrate_ratio)) {
          this.dailyCalorie.carbohydrate_ratio =
            100 - Number(this.dailyCalorie.protein_ratio) - Number(this.dailyCalorie.fat_ratio);
        } else {
          this.dailyCalorie.protein_ratio =
            100 - Number(this.dailyCalorie.carbohydrate_ratio) - Number(this.dailyCalorie.fat_ratio);
        }
      }
    },

    modifyRatio() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/macronutrient/update', {
          carbs_ratio: Number((this.dailyCalorie.carbohydrate_ratio / 100).toFixed(2)),
          protein_ratio: Number((this.dailyCalorie.protein_ratio / 100).toFixed(2)),
          fat_ratio: Number((this.dailyCalorie.fat_ratio / 100).toFixed(2)),
        })
        .then(() => {
          uni.hideLoading();

          uni.showToast({
            title: '修改成功',
            icon: 'none',
          });

          this.getDailyFoods();
          this.getDailyCalorie();
        });
    },

    goWeightData() {
      if (!this.userDetailInfo) {
        verifyIsLogin();

        this.$toRouter('/pages/evaluation/evaluation');
      } else {
        this.$toRouter('/pages/weightData/weightData');
      }
    },

    showAddMotionRecodeDialog() {
      if (!this.userDetailInfo) {
        verifyIsLogin();

        this.$toRouter('/pages/evaluation/evaluation');
      } else {
        this.$refs.addMotionRecodeDialog.open();
      }
    },

    showAddFoodRecodeDialog() {
      if (!this.userDetailInfo) {
        verifyIsLogin();

        this.$toRouter('/pages/evaluation/evaluation');
      } else {
        this.$refs.addFoodRecodeDialog.open();
      }
    },

    addRecode(event) {
      this.$refs.addFoodRecodeDialog.close();

      this.$toRouter(
        '/pages/dietaryRecord/dietaryRecord',
        `text=${encodeURIComponent(event.text)}&type=${event.type}&input_type=${
          event.input_type
        }&date_time=${this.selectDate.currentDate.format()}`,
      );
    },

    addImageRecode(event) {
      this.$refs.addFoodRecodeDialog.close();

      this.$toRouter(
        '/pages/dietaryRecord/dietaryRecord',
        `text=&url=${encodeURIComponent(event.url)}&type=${event.type}&input_type=${
          event.input_type
        }&date_time=${this.selectDate.currentDate.format()}`,
      );
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

              this.getDailyFoods();
              this.getDailyCalorie();
            });
        });
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
.recode-page {
  .page-title {
    background: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height) + 45rpx) 0 15rpx;
    background: #ffffff;
    border-radius: 0 0 30rpx 30rpx;

    .date {
      display: flex;
      align-items: center;
      justify-content: space-around;

      .item {
        &.active {
          text {
            &:nth-child(1) {
              color: #000000;
            }

            &:nth-child(2) {
              background: #0abf92;
              color: #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }

        text {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          &:nth-child(1) {
            color: #999999;
            font-size: 22rpx;
            margin-bottom: 30rpx;
          }

          &:nth-child(2) {
            width: 45rpx;
            height: 45rpx;
            color: #111111;
            font-size: 26rpx;
          }
        }
      }
    }
  }

  .container {
    padding: 22rpx 30rpx 140rpx;

    .manage {
      background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/recode-bg1.png') left top/100%
        100% no-repeat;
      padding: 30rpx 40rpx 60rpx;
      display: flex;
      flex-direction: column;
      position: relative;
      margin-bottom: 20rpx;

      .top {
        width: 191rpx;
        height: 64rpx;
        background: #111111;
        border-radius: 32rpx;
        font-weight: bold;
        font-size: 26rpx;
        color: #fafcff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 52rpx;
      }

      .bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text {
            &:nth-child(1) {
              font-weight: bold;
              font-size: 36rpx;
              color: #ffffff;
              margin-bottom: 24rpx;
            }

            &:nth-child(2) {
              font-size: 26rpx;
              color: #ffffff;
            }
          }
        }

        .line {
          align-self: stretch;
          border-right: 2px dashed #ffffff;
        }
      }

      .add-info {
        position: relative;
        top: -20rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        padding-bottom: 26rpx;
        font-size: 26rpx;

        .highlight {
          color: #bef054;
        }

        text {
          line-height: 40rpx;
        }
      }
    }

    .recode-box {
      background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/reocde-box-bg.png') left
        top/100% 100% no-repeat;
      padding: 30rpx 32rpx 44rpx;
      border-radius: 20rpx;
      position: relative;
      margin-bottom: 20rpx;

      .toggle-btn {
        position: absolute;
        top: 20rpx;
        right: 30rpx;
        font-size: 28rpx;
        color: #b88646;
      }

      .title {
        font-size: 30rpx;
        color: #1a1a1a;
        font-weight: 500;
        margin-bottom: 20rpx;
      }

      .used {
        font-size: 26rpx;
        height: 26rpx;
        color: #999999;
        margin-bottom: 60rpx;
      }

      .recode-list {
        display: flex;
        width: 100%;
        overflow: auto;

        view {
          width: 20%;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;

          image {
            height: 48rpx;
            margin-bottom: 14rpx;
          }

          .text {
            font-size: 24rpx;
            color: #1a1a1a;
            margin-bottom: 10rpx;
          }

          .line {
            width: 60rpx;
            height: 5rpx;
            background: #0abf92;
            border-radius: 3rpx;
          }
        }
      }

      .line {
        width: 100%;
        height: 4rpx;
        background: #f5f5f6;
        margin-bottom: 42rpx;
      }

      .food-list {
        display: flex;
        flex-direction: column;
        gap: 24rpx;

        view {
          display: flex;
          align-items: center;

          text {
            &:nth-child(1) {
              font-size: 26rpx;
              color: #333333;
              font-weight: 500;
              margin-right: 6rpx;
            }

            &:nth-child(2) {
              font-size: 24rpx;
              color: #999999;
              flex-grow: 1;
            }

            &:nth-child(3) {
              font-size: 24rpx;
              color: #999999;
            }
          }
        }
      }
    }

    .exercises {
      background: linear-gradient(180deg, rgba(204, 255, 238, 0.9) 0%, rgba(255, 255, 255, 0.93) 31%, #ffffff 100%);
      border-radius: 25rpx;
      padding: 30rpx 28rpx;
      margin-bottom: 20rpx;
      position: relative;

      .exercises-title {
        font-weight: 500;
        font-size: 30rpx;
        color: #1a1a1a;
        margin-bottom: 20rpx;
      }

      .exercises-list {
        display: flex;
        flex-direction: column;
        gap: 22rpx;

        .exercises-item {
          display: flex;
          align-items: center;

          .point {
            color: #555555;
            margin-right: 10rpx;
          }

          .name {
            font-size: 26rpx;
            color: #555555;
            margin-right: 30rpx;
          }

          .content {
            color: #999999;
            font-size: 22rpx;
            margin-right: 10rpx;
          }

          .calorie {
            color: #ffa537;
            font-size: 22rpx;
            flex-grow: 1;
          }

          checkbox {
            transform: scale(0.6);
          }
        }
      }
    }

    .modify-ratio {
      background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/reocde-box-bg.png') left
        top/100% 100% no-repeat;
      padding: 30rpx 32rpx 44rpx;
      border-radius: 20rpx;
      position: relative;
      margin-bottom: 20rpx;

      .toggle-btn {
        position: absolute;
        top: 20rpx;
        right: 30rpx;
        font-size: 28rpx;
        color: #b88646;
      }

      .title {
        font-size: 30rpx;
        color: #1a1a1a;
        font-weight: 500;
        margin-bottom: 62rpx;
      }

      .ratio-list {
        display: flex;
        flex-direction: column;
        gap: 30rpx;
        margin-bottom: 54rpx;

        .ratio-item {
          display: flex;
          flex-direction: column;

          .ratio-tip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20rpx;
            margin-bottom: 10rpx;

            text {
              &:nth-child(1) {
                font-size: 26rpx;
                color: #666666;
              }

              &:nth-child(2) {
                font-size: 22rpx;
                color: #999999;
              }
            }
          }

          slider {
            width: 100%;
            margin: 0;
            padding: 0;
          }
        }
      }

      .submit {
        display: flex;
        align-items: center;
        justify-content: center;

        text {
          width: 550rpx;
          height: 80rpx;
          background: #0abf92;
          border-radius: 40rpx;
          font-weight: 500;
          font-size: 28rpx;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .other-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .left,
      .right {
        width: 334rpx;
        height: 336rpx;

        &.left {
          background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/recode-bg2.png') left
            top/100% 100% no-repeat;
          padding: 32rpx 28rpx 40rpx 26rpx;
          display: flex;
          flex-direction: column;
          position: relative;

          .title {
            font-size: 30rpx;
            color: #1a1a1a;
            font-weight: 500;
            margin-bottom: 18rpx;
          }

          .update {
            font-size: 24rpx;
            color: #666666;
            flex-grow: 1;
          }

          .number {
            display: flex;
            align-items: center;

            text {
              &:nth-child(1) {
                font-weight: bold;
                font-size: 48rpx;
                color: #1a1a1a;
              }

              &:nth-child(2) {
                font-size: 24rpx;
                color: #1a1a1a;
                position: relative;
                top: 6rpx;
              }
            }
          }
        }

        &.right {
          background: #ffffff;
          border-radius: 25rpx;
          padding: 32rpx 28rpx 20rpx 26rpx;
          display: flex;
          flex-direction: column;
          position: relative;

          .title {
            font-size: 30rpx;
            color: #1a1a1a;
            font-weight: 500;
            margin-bottom: 37rpx;
          }

          .motion-list {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: 24rpx;

            .item {
              display: flex;
              align-items: center;

              text {
                &:nth-child(1) {
                  color: #333333;
                  font-size: 26rpx;
                  font-weight: 500;
                  margin-right: 10rpx;
                }

                &:nth-child(2) {
                  color: #666666;
                  font-size: 24rpx;
                  flex-grow: 1;
                }

                &:nth-child(3) {
                  font-size: 22rpx;
                  color: #666666;
                }
              }
            }
          }

          .total {
            align-self: center;
            width: 212rpx;
            height: 48rpx;
            background: #0abf92;
            border-radius: 24rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            color: #ffffff;
          }
        }

        .add {
          position: absolute;
          top: 15rpx;
          right: 28rpx;
          width: 54rpx;
          height: 54rpx;
          background: #efefef;
          border-radius: 50%;
          font-size: 36rpx;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }

  .add-recode {
    position: fixed;
    bottom: 0;
    right: 10rpx;
    width: 124rpx;
  }
}

.login {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #aaaaaa;
}

.empty-recode {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #aaaaaa;
  padding: 30rpx 0;
}
</style>
