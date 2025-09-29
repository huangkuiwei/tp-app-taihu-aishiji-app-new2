<template>
  <custom-dialog ref="exchangeDialog" title="兑换记录" :shop-close="false">
    <view class="content">
      <view class="recode-list" v-if="exchangeList.length">
        <view class="recode-item" v-for="item of exchangeList" :key="item.id">
          <text>{{ item.name }}</text>
          <text>{{ item.exchange_time.slice(6, 10) }}</text>
        </view>
      </view>

      <view class="empty-recode">暂无兑换记录</view>
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
  name: 'exchangeDialog',

  components: {
    customDialog,
  },

  data() {
    return {
      exchangeList: [],
    };
  },

  methods: {
    getExchangeList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/sunshine/exchange-records', {
          pageIndex: 1,
          pageSize: 9999,
        })
        .then((res) => {
          uni.hideLoading();

          this.exchangeList = res.data.Items;
        });
    },

    open() {
      this.getExchangeList();
      this.$refs.exchangeDialog.open();
    },

    close() {
      this.$refs.exchangeDialog.close();
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

  .empty-recode {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #aaaaaa;
    padding: 30rpx 0 60rpx;
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
