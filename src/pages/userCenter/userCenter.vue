<template>
  <view class="user-center-page">
    <view class="page-title">
      <text>个人信息</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="userinfo">
      <view class="box">
        <view class="item">
          <text class="label">性别</text>

          <picker
            mode="selector"
            range-key="text"
            :range="genderList"
            :value="userDetailInfo.gender"
            @change="userDetailInfo.gender = $event.detail.value"
          >
            <view class="value">
              <text class="filed">{{ genderList[userDetailInfo.gender].text }}</text>
              <uni-icons class="back" color="#999999" type="right" size="18"></uni-icons>
            </view>
          </picker>
        </view>

        <view class="item">
          <text class="label">出生年份</text>

          <picker
            mode="date"
            fields="year"
            :value="userDetailInfo.birth_year"
            @change="userDetailInfo.birth_year = $event.detail.value"
          >
            <view class="value">
              <text class="filed">{{ userDetailInfo.birth_year }}年</text>
              <uni-icons class="back" color="#999999" type="right" size="18"></uni-icons>
            </view>
          </picker>
        </view>

        <view class="item">
          <text class="label">身高</text>

          <picker
            mode="selector"
            :range="rulerLineList1"
            :value="userDetailInfo.height"
            @change="userDetailInfo.height = $event.detail.value"
          >
            <view class="value">
              <text class="filed">{{ rulerLineList1[userDetailInfo.height] }}厘米</text>
              <uni-icons class="back" color="#999999" type="right" size="18"></uni-icons>
            </view>
          </picker>
        </view>

        <view class="item">
          <text class="label">当前体重</text>

          <picker
            mode="selector"
            :range="rulerLineList2"
            :value="userDetailInfo.current_weight"
            @change="userDetailInfo.current_weight = $event.detail.value"
          >
            <view class="value">
              <text class="filed">{{ rulerLineList2[userDetailInfo.current_weight] || currentWeight }}公斤</text>
              <uni-icons class="back" color="#999999" type="right" size="18"></uni-icons>
            </view>
          </picker>
        </view>
      </view>

      <view class="box">
        <view class="item">
          <text class="label">目标体重</text>

          <picker
            mode="selector"
            :range="rulerLineList4"
            :value="userDetailInfo.target_weight"
            @change="userDetailInfo.target_weight = $event.detail.value"
          >
            <view class="value">
              <text class="filed">{{ rulerLineList4[userDetailInfo.target_weight] || targetWeight }}公斤</text>
              <uni-icons class="back" color="#999999" type="right" size="18"></uni-icons>
            </view>
          </picker>
        </view>
      </view>

      <view class="box">
        <view class="item">
          <text class="label">运动习惯</text>

          <picker
            mode="selector"
            :range="exerciseHabits.map((item) => item.text)"
            :value="userDetailInfo.exercise_habits"
            @change="userDetailInfo.exercise_habits = $event.detail.value"
          >
            <view class="value">
              <text class="filed">
                {{ exerciseHabits[userDetailInfo.exercise_habits].text }}
              </text>
              <uni-icons class="back" color="#999999" type="right" size="18"></uni-icons>
            </view>
          </picker>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';
import { mapActions } from 'vuex';

export default {
  name: 'userCenter',

  data() {
    let rulerLineList1 = [];
    let rulerLineList2 = [];
    let rulerLineList3 = [];
    let rulerLineList4 = [];

    for (let i = 90; i < 221; i++) {
      rulerLineList1.push(i);
    }

    for (let i = 30; i < 301; i++) {
      rulerLineList2.push(i);
      rulerLineList3.push(i);
      rulerLineList4.push(i);
    }

    return {
      userDetailInfo: {},
      currentWeight: 0,
      targetWeight: 0,
      genderList: [
        {
          value: 1,
          text: '男',
        },
        {
          value: 2,
          text: '女',
        },
      ],
      rulerLineList1: rulerLineList1,
      rulerLineList2: rulerLineList2,
      rulerLineList3: rulerLineList3,
      rulerLineList4: rulerLineList4,
      exerciseHabits: [
        {
          id: 0,
          value: 1,
          text: '几乎不动，长时间久坐',
          active: true,
        },
        {
          id: 1,
          value: 2,
          text: '偶尔活动，每周1-3天',
          active: false,
        },
        {
          id: 2,
          value: 3,
          text: '经常活动，每周3-5天',
          active: false,
        },
        {
          id: 3,
          value: 4,
          text: '活动频繁，每周6-7天',
          active: false,
        },
        {
          id: 4,
          value: 5,
          text: '高强度活动，长时间体力工作',
          active: false,
        },
      ],
    };
  },

  watch: {
    userDetailInfo: {
      handler(value, oldValue) {
        if (!oldValue.id) {
          return;
        }

        uni.showLoading({
          title: '更新中...',
        });

        if (Number(this.currentWeight) === Number(this.rulerLineList2[value.current_weight])) {
          $http
            .post('api/diet-info/user-info/update', {
              gender: this.genderList[value.gender].value,
              birth_year: new Date(value.birth_year.toString()).format(),
              height: this.rulerLineList1[value.height],
              initial_weight: this.rulerLineList3[value.initial_weight],
              target_weight: this.rulerLineList4[value.target_weight],
              exercise_habits: this.exerciseHabits[value.exercise_habits].value,
              begin_date: new Date(value.begin_date.replace(/-/g, '/')).format(),
              end_date: new Date(value.end_date.replace(/-/g, '/')).format(),
            })
            .then(() => {
              this.targetWeight = this.rulerLineList4[value.target_weight];

              uni.showToast({
                title: '更新成功',
                icon: 'none',
              });
            });
        } else {
          $http
            .post('api/diet-info/user-weight/update', {
              weight: this.rulerLineList2[value.current_weight],
            })
            .then(() => {
              this.currentWeight = this.rulerLineList2[value.current_weight];

              uni.showToast({
                title: '更新成功',
                icon: 'none',
              });
            });
        }
      },

      deep: true,
    },
  },

  onShow() {
    this.getUserDetailInfo();
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
     * 获取用户信息数据
     */
    getUserDetailInfo() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      this._getUserDetailInfo().then((res) => {
        uni.hideLoading();

        // 数据格式处理
        if (res.data.gender) {
          res.data.gender = this.genderList.findIndex((item) => item.value === res.data.gender);
        }

        if (res.data.birth_year) {
          res.data.birth_year = res.data.birth_year.slice(0, 4);
        }

        if (res.data.begin_date && res.data.end_date) {
          let currentDate1 = new Date(res.data.begin_date.replace(/-/g, '/'));
          let currentDate2 = new Date(res.data.end_date.replace(/-/g, '/'));

          const year1 = currentDate1.getFullYear();
          const month1 =
            currentDate1.getMonth() + 1 > 9 ? currentDate1.getMonth() + 1 : `0${currentDate1.getMonth() + 1}`;
          const date1 = currentDate1.getDate() > 9 ? currentDate1.getDate() : '0' + currentDate1.getDate();

          const year2 = currentDate2.getFullYear();
          const month2 =
            currentDate2.getMonth() + 1 > 9 ? currentDate2.getMonth() + 1 : `0${currentDate2.getMonth() + 1}`;
          const date2 = currentDate2.getDate() > 9 ? currentDate2.getDate() : '0' + currentDate2.getDate();

          res.data.begin_date = `${year1}-${month1}-${date1}`;
          res.data.end_date = `${year2}-${month2}-${date2}`;
        }

        if (res.data.height) {
          res.data.height = this.rulerLineList1.findIndex((item) => item === res.data.height);
        }

        if (res.data.current_weight) {
          // 备份一份当前体重
          this.currentWeight = res.data.current_weight;
          res.data.current_weight = this.rulerLineList2.findIndex((item) => item === res.data.current_weight);
        }

        if (res.data.initial_weight) {
          res.data.initial_weight = this.rulerLineList3.findIndex((item) => item === res.data.initial_weight);
        }

        if (res.data.target_weight) {
          // 备份一份目标体重
          this.targetWeight = res.data.target_weight;
          res.data.target_weight = this.rulerLineList4.findIndex((item) => item === res.data.target_weight);
        }

        if (res.data.exercise_habits) {
          res.data.exercise_habits = this.exerciseHabits.findIndex((item) => item.value === res.data.exercise_habits);
        }

        this.userDetailInfo = res.data;
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
.user-center-page {
  .page-title {
    background: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: #ffffff;
  }

  .userinfo {
    padding: 20rpx 30rpx 0;

    .box {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 30rpx 24rpx;
      margin-bottom: 20rpx;

      .item {
        display: flex;
        align-items: center;

        &:not(:last-child) {
          padding-bottom: 30rpx;
          margin-bottom: 30rpx;
          border-bottom: 1px solid #f6f7fb;
        }

        .label {
          font-size: 28rpx;
          color: #1a1a1a;
        }

        picker {
          flex-grow: 1;

          .value {
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .filed {
              font-size: 26rpx;
              color: #666666;
              margin-right: 10rpx;
            }
          }
        }
      }
    }
  }
}
</style>
