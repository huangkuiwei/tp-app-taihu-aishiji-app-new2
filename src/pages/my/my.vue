<template>
  <view class="my-page">
    <view class="page-title">个人中心</view>

    <view class="banner">
      <view class="info">
        <view class="left">
          <view class="username" v-if="isLogin">
            <text class="name">{{ userInfo.uname }}</text>

            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/edit-icon.png"
            />

            <text class="edit" @click="goProfile">编辑资料</text>
          </view>

          <view class="no-login" v-else @click="$toRouter('/packageLogin/pages/login/login')">
            <text class="name">登录/注册</text>
            <text class="tip">点击登录/注册</text>
          </view>

          <template v-if="isLogin">
            <view class="time" v-if="isVip">
              <text>会员到期：{{ userInfo.vip_info.vip_end_time.slice(0, 10) }}</text>
              <text class="renewal" @click="$toRouter('/pages/renewalManage/renewalManage')">续订管理</text>
            </view>
            <view class="time" v-else>普通用户</view>
          </template>
        </view>

        <view class="right">
          <image
            mode="aspectFill"
            :src="
              userInfo.avatar_url || 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/my/default_head.png'
            "
          />
        </view>
      </view>

      <view class="vip-icon" @click="!isVip && $toRouter('/pages/vip/vip')">
        <image
          mode="widthFix"
          :src="
            isVip
              ? 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/my/vip-icon2.png'
              : 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/vip-icon.png'
          "
        />
      </view>

      <view class="data">
        <view class="item" @click="previewDataPage('/pages/dataStatistics/dataStatistics')">
          <view class="data-title">数据统计</view>
          <view class="number">
            <text>{{ recodeSummary.weekly_caloric_diff || 0 }}</text>
            <text>千卡</text>
          </view>
          <view class="tip">近7天的热量缺口数据</view>

          <view class="arrow">
            <uni-icons color="#C0C0C0" type="right" size="14"></uni-icons>
          </view>
        </view>

        <view class="item" @click="previewDataPage('/pages/weightData/weightData')">
          <view class="data-title">体重数据</view>
          <view class="number">
            <text>
              {{ (isWeightLoss ? recodeSummary.weight_loss || 0 : -recodeSummary.weight_loss || 0).toFixed(2) || 0 }}
            </text>
            <text>公斤</text>
          </view>
          <view class="tip" v-if="isWeightLoss">累计减重（公斤）</view>
          <view class="tip" v-else>累计增肌（公斤）</view>

          <view class="arrow">
            <uni-icons color="#C0C0C0" type="right" size="14"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <view class="nav-container">
      <view class="nav">
        <view class="nav-item" @click="goUserCenter">
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/nav-icon01.png"
          />
          <text class="nav-title">我的数据</text>
          <uni-icons color="#999999" type="right" size="14"></uni-icons>
        </view>

        <view class="nav-item" @click="previewDataPage('/pages/dataReport/dataReport')">
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/nav-icon02.png"
          />
          <text class="nav-title">数据报告</text>
          <uni-icons color="#999999" type="right" size="14"></uni-icons>
        </view>

        <!--<view class="nav-item" @click="jumpAuthPage('/pages/setReminder/setReminder')">-->
        <!--  <image-->
        <!--    mode="widthFix"-->
        <!--    src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/nav-icon03.png"-->
        <!--  />-->
        <!--  <text class="nav-title">提醒设置</text>-->
        <!--  <uni-icons color="#999999" type="right" size="14"></uni-icons>-->
        <!--</view>-->

        <view class="nav-item" @click="showRedemptionDialog">
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/nav-icon04.png"
          />
          <text class="nav-title">兑换码</text>
          <uni-icons color="#999999" type="right" size="14"></uni-icons>
        </view>

        <view class="nav-item" @click="jumpAuthPage('/pages/feedback/feedback')">
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/nav-icon05.png"
          />
          <text class="nav-title">意见和反馈</text>
          <uni-icons color="#999999" type="right" size="14"></uni-icons>
        </view>

        <view class="nav-item">
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/nav-icon06.png"
          />
          <button class="nav-title" @click="openContact">联系客服</button>
          <uni-icons color="#999999" type="right" size="14"></uni-icons>
        </view>
      </view>
    </view>

    <redemption-dialog ref="redemptionDialog" @success="success" />
  </view>
</template>

<script>
import RedemptionDialog from '@/pages/my/redemptionDialog.vue';
import { verifyIsLogin } from '@/utils';
import $http from '@/utils/http';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'myPage',

  data() {
    return {
      recodeSummary: {},
      homeWeightPlanData: null,
    };
  },

  computed: {
    ...mapState('app', ['userInfo', 'userDetailInfo']),
    ...mapGetters('app', ['isLogin', 'isVip']),

    isWeightLoss() {
      if (!this.isLogin || !this.userDetailInfo) {
        return true;
      }

      return this.userDetailInfo.initial_weight - this.userDetailInfo.target_weight > 0;
    },
  },

  onShow() {
    this._getUserInfo();
    this._getUserDetailInfo();
    this.getRecodeSummary();
    this.getHomeWeightPlan();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  components: {
    RedemptionDialog,
  },

  methods: {
    ...mapActions('app', ['_getUserDetailInfo', '_getUserInfo']),

    /**
     * 获取首页体重相关数据
     */
    getHomeWeightPlan() {
      return $http.get('api/diet-info/weight-plan/home').then((res) => {
        this.homeWeightPlanData = res.data;
      });
    },

    /**
     * 获取用户信息数据
     */
    getRecodeSummary() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .get(
          'api/diet-info/record-summary',
          {},
          {
            hiddenErrorMessage: true,
          },
        )
        .then((res) => {
          uni.hideLoading();
          this.recodeSummary = res.data;
        })
        .catch((err) => {
          if (err.Msg === '未找到健康档案，请先完成健康评估') {
            this.recodeSummary = {};
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

    previewDataPage(url) {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      // if (!this.homeWeightPlanData || this.homeWeightPlanData.state !== 1) {
      //   this.$toRouter('/pages/addPlan/addPlan');
      //   return;
      // }

      this.$toRouter(url);
    },

    openContact() {
      uni.openCustomerServiceChat({
        corpId: 'wwa09afa94a53c191b',
        extInfo: {
          url: 'https://work.weixin.qq.com/kfid/kfc4d6f5ec87ef53883',
        },
      });
    },

    jumpAuthPage(url) {
      verifyIsLogin();
      this.$toRouter(url);
    },

    showRedemptionDialog() {
      verifyIsLogin();
      this.$refs.redemptionDialog.open();
    },

    goProfile() {
      verifyIsLogin();
      this.$toRouter('/pages/profile/profile');
    },

    goUserCenter() {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      this.$toRouter('/pages/userCenter/userCenter');
    },

    success() {
      this._getUserInfo();
      this._getUserDetailInfo();
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
.my-page {
  padding-bottom: 60rpx;

  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height) + 43rpx) 30rpx 20rpx;
    background: linear-gradient(180deg, rgba(204, 255, 238, 0.9) 0%, #f6f7fb 100%);

    .info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30rpx;

      .left {
        display: flex;
        flex-direction: column;
        gap: 32rpx;

        .username {
          display: flex;
          align-items: center;

          .name {
            font-weight: bold;
            font-size: 32rpx;
            color: #1a1a1a;
          }

          image {
            width: 26rpx;
            margin: 0 8rpx 0 24rpx;
          }

          .edit {
            font-size: 22rpx;
            color: #555555;
          }
        }

        .no-login {
          display: flex;
          flex-direction: column;
          gap: 30rpx;

          .name {
            font-weight: bold;
            font-size: 32rpx;
            color: #1a1a1a;
          }

          .tip {
            font-size: 26rpx;
            color: #1a1a1a;
          }
        }

        .time {
          font-size: 26rpx;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 20rpx;

          .renewal {
            width: 105rpx;
            height: 35rpx;
            background: #0abf92;
            border-radius: 18rpx;
            font-size: 20rpx;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .right {
        image {
          width: 135rpx;
          height: 135rpx;
          border-radius: 50%;
          display: block;
        }
      }
    }

    .vip-icon {
      width: 100%;
      margin-bottom: 20rpx;

      image {
        width: 100%;
      }
    }

    .data {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .item {
        width: 335rpx;
        height: 160rpx;
        background: #ffffff;
        border-radius: 25rpx;
        padding: 20rpx 30rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;

        .data-title {
          font-size: 28rpx;
          color: #1a1a1a;
          font-weight: 500;
        }

        .number {
          display: flex;
          align-items: center;

          text {
            &:nth-child(1) {
              font-size: 34rpx;
              color: #0abf92;
              margin-right: 6rpx;
            }

            &:nth-child(2) {
              font-size: 26rpx;
              color: #333333;
            }
          }
        }

        .tip {
          font-size: 22rpx;
          color: #999999;
        }

        .arrow {
          position: absolute;
          top: 26rpx;
          right: 16rpx;
        }
      }
    }
  }

  .nav-container {
    padding: 0 30rpx;

    .nav {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 40rpx 30rpx;
      display: flex;
      flex-direction: column;

      .nav-item {
        display: flex;
        align-items: center;

        &:not(:last-child) {
          padding-bottom: 34rpx;
          margin-bottom: 34rpx;
          border-bottom: 2rpx solid #f2f2f2;
        }

        image {
          width: 60rpx;
          margin-right: 20rpx;
        }

        .nav-title {
          font-weight: 500;
          font-size: 26rpx;
          color: #1a1a1a;
          flex-grow: 1;
        }

        button {
          text-align: left;
          background: transparent;
          padding: 0 0 0 2rpx;
          margin: 0;

          &:after {
            border: none;
          }
        }
      }
    }
  }
}
</style>
