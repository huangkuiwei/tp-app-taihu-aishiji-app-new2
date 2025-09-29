<template>
  <custom-dialog ref="recodeDialog" title="阳光记录" :shop-close="false">
    <view class="content">
      <view class="recode-list">
        <template v-if="recodeList.length">
          <view class="recode-item" v-for="(item, index) of recodeList" :key="index">
            <text>{{ item.change_reason }}{{ item.change_points }}</text>
            <text>{{ item.change_time.slice(0, 10) }}</text>
          </view>
        </template>

        <view class="empty-recode" v-else> 暂无记录 </view>
      </view>
    </view>

    <template #footer>
      <view class="btn">
        <text @click="close">知道了</text>
      </view>
    </template>
  </custom-dialog>
</template>

<script>
import customDialog from '@/components/customDialog.vue';
import $http from '@/utils/http';

export default {
  name: 'recodeDialog',

  components: {
    customDialog,
  },

  data() {
    return {
      recodeList: [],
    };
  },

  methods: {
    getRecodeList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/sunshine/points-record', {
          pageIndex: 1,
          pageSize: 9999,
        })
        .then((res) => {
          uni.hideLoading();

          this.recodeList = res.data.Items;
        });
    },

    open() {
      this.getRecodeList();
      this.$refs.recodeDialog.open();
    },

    close() {
      this.$refs.recodeDialog.close();
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  .recode-list {
    display: flex;
    flex-direction: column;
    margin-bottom: 50rpx;

    .empty-recode {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #aaaaaa;
      padding: 30rpx 0;
    }

    .recode-item {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        padding-bottom: 22rpx;
        margin-bottom: 22rpx;
        border-bottom: 1px solid #f5f5f5;
      }

      text {
        &:nth-child(1) {
          font-size: 24rpx;
          color: #111111;
          flex-grow: 1;
        }

        &:nth-child(2) {
          font-size: 22rpx;
          color: #999999;
        }
      }
    }
  }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    width: 284rpx;
    height: 80rpx;
    background: #0abf92;
    color: #ffffff;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
