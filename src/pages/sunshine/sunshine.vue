<template>
  <view class="sunshine-page">
    <view class="page-title">攒阳光</view>

    <view class="banner">
      <view class="container">
        <view class="tree">
          <image
            mode="widthFix"
            :src="treeInfo.url"
            :style="{ width: treeInfo.width + 'rpx', top: treeInfo.top + 'rpx' }"
          />
        </view>

        <view class="progress">
          <text class="progress-title">{{ treeInfo.levelName }}</text>
          <view class="progress-box">
            <text class="progress" :style="{ width: pointsProgress + '%' }" />
            <text class="tip" v-if="accountInfo.tree_level <= 5">
              成长值：{{ Math.round(accountInfo.flowers * 500 + accountInfo.points) || 0 }}/{{
                treeInfo.levelPoints || 0
              }}
            </text>
          </view>
        </view>

        <view class="sun-list">
          <view
            class="sun-item"
            :style="{ top: '-' + item.top + 'rpx', left: item.left + 'rpx' }"
            v-for="(item, index) of roundSunshine"
            :key="index"
            @click="collectSun(item)"
          >
            <image
              :style="{ opacity: item.isCollect ? 0 : 1 }"
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/sum2.png"
            />
          </view>
        </view>
      </view>

      <image
        class="rule-icon"
        mode="widthFix"
        @click="openRuleDialog"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/rule-icon.png"
      />

      <view class="points">
        <image
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/points-icon.png"
        />

        <text>{{ accountInfo.points || 0 }}</text>
      </view>

      <view class="flowers">
        <image
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/exchangeCenter/icon1.png"
        />

        <text>{{ accountInfo.flowers || 0 }}</text>
      </view>

      <image
        class="recode-icon"
        @click="openRecodeDialog"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/recode-icon.png"
      />

      <image
        class="exchange-icon"
        @click="goExchangeCenter"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/exchange-icon.png"
      />
    </view>

    <view class="get-points">
      <view class="sign-in">
        <view class="title">每天连续签到，可随机额外获取奖励</view>

        <view class="days">
          <text>已连续签到</text>
          <text>{{ accountInfo.sign_continuous_days }}</text>
          <text>天</text>
        </view>

        <view class="day-list">
          <view
            class="day-item"
            :class="{ 'sign-in-item': item.signIn }"
            v-for="item of signInDayList"
            :key="item.index"
          >
            <view class="icon">
              <image
                mode="heightFix"
                :src="
                  item.signIn
                    ? 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/checked.png'
                    : 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/sum.png'
                "
              />

              <text>+{{ item.points }}</text>
            </view>

            <text class="day">{{ item.signIn ? '已签到' : `第${item.index}天` }}</text>
          </view>
        </view>

        <view class="sign-in-btn" :class="{ 'has-sign-in': hasSignIn }" @click="signIn">
          {{ hasSignIn ? '已签到' : '立即签到' }}
        </view>
      </view>

      <view class="task">
        <template v-if="isLogin">
          <view class="task-item" v-for="item of taskStatusData" :key="item.task_id">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/sum2.png"
            />

            <view class="points-info">
              <view class="title">{{ item.task_name }}（{{ item.completed_count }}/{{ item.max_daily_times }}）</view>

              <view class="tip">
                <text>
                  {{ item.description }}
                  <text v-if="item.base_points">，</text>
                </text>
                <text v-if="item.base_points">得{{ item.base_points }}个积分</text>
              </view>
            </view>

            <view
              class="get-btn"
              :class="{ finish: item.completed_count === item.max_daily_times }"
              @click="completeTask(item)"
            >
              {{ item.completed_count === item.max_daily_times ? '已完成' : '去完成' }}
            </view>
          </view>
        </template>

        <template v-else>
          <view class="login" @click="$toRouter('/packageLogin/pages/login/login')">登录后查看任务</view>
        </template>
      </view>
    </view>

    <rule-dialog ref="ruleDialog" />
    <recode-dialog ref="recodeDialog" />
  </view>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import RuleDialog from '@/pages/sunshine/ruleDialog.vue';
import RecodeDialog from '@/pages/sunshine/recodeDialog.vue';
import $http from '@/utils/http';
import { verifyIsLogin } from '@/utils';

export default {
  name: 'sunshinePage',

  components: {
    RecodeDialog,
    RuleDialog,
  },

  data() {
    return {
      taskStatusData: [],
      accountInfo: {},
      roundSunshine: [],
      signInDayList: [
        {
          index: 1,
          signIn: false,
          points: 5,
        },
        {
          index: 2,
          signIn: false,
          points: 5,
        },
        {
          index: 3,
          signIn: false,
          points: 10,
        },
        {
          index: 4,
          signIn: false,
          points: 10,
        },
        {
          index: 5,
          signIn: false,
          points: 30,
        },
        {
          index: 6,
          signIn: false,
          points: 30,
        },
        {
          index: 7,
          signIn: false,
          points: 30,
        },
      ],
      link: 'https://mp.weixin.qq.com/s/TsRPYgh5yjosYiIGK7_XtA',
    };
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),
    ...mapGetters('app', ['isLogin']),

    hasSignIn() {
      let signInTask = this.taskStatusData.find((item) => item.task_name === '每日签到');

      if (signInTask) {
        return signInTask.completed_count === 1;
      }

      return false;
    },

    treeInfo() {
      if (this.accountInfo.tree_level === 1) {
        if (this.accountInfo.points === 0) {
          return {
            url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/tree01.png',
            width: 91,
            top: -26,
            levelPoints: 100,
            levelName: '树苗',
          };
        }

        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/tree02.png',
          width: 261,
          top: -26,
          levelPoints: 100,
          levelName: '树苗',
        };
      } else if (this.accountInfo.tree_level === 2) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/tree02.png',
          width: 261,
          top: -26,
          levelPoints: 200,
          levelName: '树苗',
        };
      } else if (this.accountInfo.tree_level === 3) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/tree03.png',
          width: 277,
          top: -10,
          levelPoints: 300,
          levelName: '小树',
        };
      } else if (this.accountInfo.tree_level === 4) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/tree03.png',
          width: 351,
          top: 0,
          levelPoints: 400,
          levelName: '小树',
        };
      } else if (this.accountInfo.tree_level === 5) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/tree04.png',
          width: 369,
          top: 0,
          levelPoints: 500,
          levelName: '小树',
        };
      } else if (this.accountInfo.tree_level > 5) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/tree05.png',
          width: 369,
          top: 0,
          levelPoints: 600,
          levelName: '大树',
        };
      }

      return {
        url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/tree01.png',
        width: 91,
        top: -26,
        levelPoints: 100,
        levelName: '树苗',
      };
    },

    pointsProgress() {
      let progress = ((this.accountInfo.flowers * 500 + this.accountInfo.points) / this.treeInfo.levelPoints) * 100;

      if (progress > 100) {
        progress = 100;
      } else if (progress < 0) {
        progress = 0;
      }

      return progress;
    },
  },

  onShow() {
    this.initData(true);
    this._getUserDetailInfo();
    this.getRoundSunshine();

    if (uni.getStorageSync('hasClickSubscribe')) {
      this.getHasSubscribe();
      uni.removeStorageSync('hasClickSubscribe');
    }

    let goSignIn = uni.getStorageSync('goSignIn');

    if (goSignIn) {
      uni.removeStorageSync('goSignIn');

      uni.pageScrollTo({
        scrollTop: 300,
        duration: 300,
      });
    }
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

    async initData(showToast) {
      if (showToast) {
        uni.showLoading({
          title: '加载中...',
          mask: true,
        });
      }

      await this.getTaskStatusData().catch(() => {});
      await this.getAccountInfo().catch(() => {});

      if (showToast) {
        uni.hideLoading();
      }
    },

    getTaskStatusData() {
      return $http.get('api/sunshine/task-status').then((res) => {
        this.taskStatusData = res.data;
      });
    },

    getAccountInfo() {
      return $http.get('api/sunshine/account-info').then((res) => {
        this.accountInfo = res.data;

        if (this.accountInfo.sign_continuous_days > 0) {
          this.signInDayList.forEach((item, index) => {
            item.signIn = index < this.accountInfo.sign_continuous_days;
          });
        }
      });
    },

    getRoundSunshine() {
      $http.get('api/sunshine/random-sunshine').then((res) => {
        let arr = [0, 1, 2, 3, 4];

        // 写入随机位置
        res.data.forEach((item) => {
          let index = arr[Math.floor(Math.random() * arr.length)];

          if (index <= 2) {
            item.top = 80 + index * (30 + 10 * Math.random());
          } else {
            item.top = 160 - (index - 2) * (30 + 10 * Math.random());
          }

          item.left = 150 + index * (90 + 10 * Math.random());

          arr.splice(
            arr.findIndex((x) => x === index),
            1,
          );

          item.isCollect = false;
        });

        this.roundSunshine = res.data;
      });
    },

    signIn() {
      verifyIsLogin();

      if (this.hasSignIn) {
        return;
      }

      uni.showLoading({
        title: '签到中...',
        mask: true,
      });

      $http.get('api/sunshine/sign-in').then((res) => {
        uni.hideLoading();

        uni.showToast({
          title: `签到成功，获取${res.data.points}阳光`,
          icon: 'none',
        });

        this.initData();
      });
    },

    collectSun(item) {
      uni.showLoading({
        title: '收集中...',
        mask: true,
      });

      $http
        .post('api/sunshine/collect-sunshine', {
          item_id: item.id,
        })
        .then((res) => {
          uni.hideLoading();
          item.isCollect = true;

          uni.showToast({
            title: `收集成功，获取${res.data.points}阳光`,
            icon: 'none',
          });

          this.initData();
        });
    },

    completeTask(item) {
      if (item.completed_count === item.max_daily_times) {
        return;
      }

      if (item.task_name === '每日签到') {
        this.signIn();
      } else if (item.task_name === '每日记录') {
        this.$toSwitch('/pages/recode/recode');
      } else if (item.task_name === '记录体重') {
        if (!this.userDetailInfo) {
          verifyIsLogin();

          this.$toRouter('/pages/evaluation/evaluation');
        } else {
          this.$toRouter('/pages/weightData/weightData');
        }
      } else if (item.task_name === '广告激励') {
        // 广告激励 暂时不做
      } else if (item.task_name === '关注账号') {
        uni.setStorageSync('hasClickSubscribe', true);
        this.$toRouter('/pages/webview/webview', `src=${encodeURIComponent(this.link)}`);
      }
    },

    getHasSubscribe() {
      $http
        .post(
          'api/sunshine/complete-task',
          {
            task_type: 5,
          },
          {
            hiddenErrorMessage: true,
          },
        )
        .then(() => {
          this.initData();
        });
    },

    openRuleDialog() {
      this.$refs.ruleDialog.open();
    },

    openRecodeDialog() {
      verifyIsLogin();
      this.$refs.recodeDialog.open();
    },

    goExchangeCenter() {
      verifyIsLogin();
      this.$toRouter('/pages/exchangeCenter/exchangeCenter', `hasSignIn=${this.hasSignIn}`);
    },
  },
};
</script>

<style scoped lang="scss">
.sunshine-page {
  background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/bg.png') left top/100% auto
    no-repeat;

  .page-title {
    color: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height) + 209rpx) 0 95rpx;
    position: relative;

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;

      .tree {
        height: 476rpx;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        margin-bottom: 75rpx;

        image {
          position: relative;
        }
      }

      .progress {
        position: relative;
        width: 481rpx;
        height: 68rpx;
        background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/progress.png') left
          top/100% 100% no-repeat;
        padding: 0 10rpx 0 24rpx;
        display: flex;
        align-items: center;

        .progress-title {
          font-size: 26rpx;
          color: #7b5740;
          padding-right: 14rpx;
        }

        .progress-box {
          flex-grow: 1;
          height: 48rpx;
          font-size: 26rpx;
          color: #7b5740;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;

          .progress {
            position: absolute;
            height: 100%;
            max-width: 100%;
            left: 0;
            bottom: 0;
            background: linear-gradient(to bottom, #fe9843, #fe4e05);
            border-radius: 24rpx;
            top: -4rpx;
          }

          .tip {
            position: relative;
            z-index: 9;
            top: -4rpx;
          }
        }
      }

      .sun-list {
        .sun-item {
          position: absolute;
          animation: move 2.5s infinite linear;

          @keyframes move {
            0% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(10rpx);
            }

            100% {
              transform: translateY(0);
            }
          }

          image {
            width: 107rpx;
            transition: all 0.5s ease-in-out;
          }
        }
      }
    }

    .rule-icon {
      position: absolute;
      top: 193rpx;
      left: 30rpx;
      width: 88rpx;
    }

    .points,
    .flowers {
      position: absolute;
      top: 193rpx;
      right: 0;
      width: 165rpx;
      height: 71rpx;
      border-radius: 36rpx 0 0 36rpx;
      background: #ffffffaa;
      padding-right: 30rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &.flowers {
        top: 275rpx;

        image {
          margin-left: 10rpx;
          width: 48rpx;
        }
      }

      image {
        width: 74rpx;
        margin-right: 24rpx;
      }

      text {
        font-weight: 500;
        font-size: 34rpx;
        color: #ff9300;
      }
    }

    .recode-icon {
      position: absolute;
      top: 411rpx;
      left: 30rpx;
      width: 88rpx;
    }

    .exchange-icon {
      position: absolute;
      top: 400rpx;
      right: 30rpx;
      width: 101rpx;
    }
  }

  .get-points {
    background: #5bbb59;
    padding: 12rpx 14rpx 44rpx;

    .sign-in {
      background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/get-points-bg.png') left
        top/100% 100% no-repeat;
      padding: 30rpx 30rpx 32rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 26rpx;

      .title {
        font-size: 24rpx;
        color: #999999;
        align-self: flex-end;
        margin-bottom: 40rpx;
      }

      .days {
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 34rpx;
        color: #111111;
        margin-bottom: 40rpx;

        text {
          &:nth-child(2) {
            color: #44c014;
            padding: 0 4rpx;
          }
        }
      }

      .day-list {
        display: flex;
        align-items: center;
        gap: 18rpx;
        margin-bottom: 38rpx;

        .day-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          &.sign-in-item {
            .icon {
              background: #bef05430;

              text {
                color: #3abc14;
              }
            }

            .day {
              color: #666666;
            }
          }

          .icon {
            width: 78rpx;
            height: 110rpx;
            background: #f6f6f6;
            border-radius: 10rpx;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-bottom: 10rpx;

            image {
              height: 38rpx;
              margin-bottom: 20rpx;
            }

            text {
              font-size: 28rpx;
              color: #666666;
            }
          }

          .day {
            font-size: 22rpx;
            color: #999999;
          }
        }
      }

      .sign-in-btn {
        width: 482rpx;
        height: 88rpx;
        background: linear-gradient(90deg, #fe9f49 0%, #fe4c03 100%);
        border-radius: 44rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 34rpx;
        color: #ffffff;

        &.has-sign-in {
          background: #d9d9d9;
          color: #ffffff;
        }
      }
    }

    .task {
      background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/sunshine/get-points-bg2.png') left
        top/100% 100% no-repeat;
      padding: 131rpx 32rpx 44rpx;
      height: 910rpx;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      .task-item {
        display: flex;
        align-items: center;
        background: #ffffff;
        border-radius: 20rpx;
        padding: 26rpx 13rpx 26rpx 0;

        image {
          width: 90rpx;
          margin-right: 10rpx;
        }

        .points-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 12rpx;

          .title {
            font-weight: 500;
            font-size: 32rpx;
            color: #222222;
          }

          .tip {
            text {
              font-size: 24rpx;

              &:nth-child(1) {
                color: #999999;
              }

              &:nth-child(2) {
                color: #fe6625;
              }
            }
          }
        }

        .get-btn {
          width: 160rpx;
          height: 60rpx;
          background: linear-gradient(90deg, #fe9f49 0%, #fe4c03 100%);
          border-radius: 30rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30rpx;
          color: #ffffff;

          &.finish {
            background: #d9d9d9;
            color: #ffffff;
          }
        }
      }

      .login {
        font-size: 28rpx;
        padding-top: 200rpx;
        text-align: center;
        color: #aaaaaa;
      }
    }
  }
}
</style>
