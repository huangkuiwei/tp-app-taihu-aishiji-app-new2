<template>
  <custom-dialog ref="redemptionDialog" title="兑换码" :shop-close="false">
    <view class="content">
      <view class="input-box">
        <input :disabled="true" :value="code" @input="code = $event.detail.value" placeholder="请复制兑换码" />

        <view class="options">
          <text @click="pasteCode">粘贴兑换码</text>
          <text class="line">|</text>
          <button @click="openContact">获取兑换码</button>
        </view>
      </view>
    </view>

    <template #footer>
      <view class="btn">
        <text @click="close">取消</text>
        <text @click="submit">确定</text>
      </view>
    </template>
  </custom-dialog>
</template>

<script>
import customDialog from '@/components/customDialog.vue';
import $http from '@/utils/http';

export default {
  name: 'redemptionDialog',

  components: {
    customDialog,
  },

  data() {
    return {
      code: '',
    };
  },

  methods: {
    open() {
      this.code = '';
      this.$refs.redemptionDialog.open();
    },

    close() {
      this.$refs.redemptionDialog.close();
    },

    openContact() {
      uni.openCustomerServiceChat({
        corpId: 'wwa09afa94a53c191b',
        extInfo: {
          url: 'https://work.weixin.qq.com/kfid/kfc4d6f5ec87ef53883',
        },
      });
    },

    pasteCode() {
      wx.getClipboardData({
        success: (res) => {
          uni.showModal({
            content: '立即粘贴文案',
            cancelColor: '#333333',
            confirmColor: '#0ABF92',
            success: (res1) => {
              if (res1.confirm) {
                this.code = res.data;

                if (!res.data) {
                  uni.showToast({
                    title: '粘贴板为空',
                    icon: 'none',
                  });
                }
              }
            },
          });
        },
      });
    },

    submit() {
      if (!this.code) {
        uni.showToast({
          title: '兑换码不能为空',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/user/profile/exchange-vip', {
          redeem_code: this.code,
        })
        .then(() => {
          this.close();
          uni.hideLoading();

          uni.showToast({
            title: '兑换成功',
            icon: 'none',
          });

          this.$emit('success');
        });
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  .input-box {
    margin-bottom: 54rpx;

    input {
      width: 100%;
      height: 103rpx;
      text-align: center;
      background: #f6f7fb;
      border-radius: 20rpx;
      margin-bottom: 40rpx;
    }

    .options {
      display: flex;
      align-items: center;
      justify-content: center;

      text {
        font-size: 30rpx;
        color: #333333;
      }

      .line {
        margin: 0 10rpx;
      }

      button {
        font-size: 30rpx;
        color: #333333;
        background: transparent;
        padding: 0;
        margin: 0;

        &:after {
          border: none;
        }
      }
    }
  }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: space-around;

  text {
    width: 284rpx;
    height: 90rpx;
    border-radius: 45rpx;
    font-size: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &:nth-child(1) {
      background: #ffffff;
      border: 2px solid #0abf92;
      color: #0abf92;
    }

    &:nth-child(2) {
      background: #0abf92;
      color: #ffffff;
    }
  }
}
</style>
