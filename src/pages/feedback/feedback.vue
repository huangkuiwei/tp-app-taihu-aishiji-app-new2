<template>
  <view class="feedback-page">
    <view class="page-title">
      <text>意见反馈</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="feedback-container">
      <view class="feedback-box">
        <view class="feedback-title">我要反馈</view>

        <view class="input-box">
          <textarea
            placeholder="你想说点什么？"
            :maxlength="1000"
            :value="content"
            @input="content = $event.detail.value"
          />

          <view class="upload-box">
            <uni-file-picker
              :image-styles="{
                width: 50,
                height: 50,
                border: false,
              }"
              :value="imageValue"
              :auto-upload="false"
              :limit="5"
              file-mediatype="image"
              fileMediatype="image"
              mode="grid"
              @select="onSelect"
            >
              <view class="add">+</view>
            </uni-file-picker>
          </view>
        </view>

        <view class="feedback-title2">
          <text>联系方式</text>
          <text>注：手机号/微信/QQ</text>
        </view>

        <view class="input-box2">
          <input
            type="text"
            :value="contact_info"
            @input="contact_info = $event.detail.value"
            placeholder="请留下任意一个联系方式"
          />
        </view>
      </view>
    </view>

    <view class="submit" @click="submit">确认</view>
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'feedback',

  data() {
    return {
      content: '',
      contact_info: '',
      imageValue: [],
    };
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    onSelect($event) {
      this.imageValue.push(...$event.tempFiles);
      this.imageValue.slice(-5);
    },

    uploadFile(path) {
      return $http.upload('api/global/fileupload/upload', path, 'file').then((res) => {
        return res.data;
      });
    },

    async submit() {
      if (!this.content) {
        uni.showToast({
          title: '反馈内容不能为空',
          icon: 'none',
        });

        return;
      }

      if (!this.contact_info) {
        uni.showToast({
          title: '联系方式不能为空',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '正在提交...',
        mask: true,
      });

      let images = [];

      for (let i = 0; i < this.imageValue.length; i++) {
        let url = await this.uploadFile(this.imageValue[i].url);
        images.push(url);
      }

      $http
        .post('api/user/profile/submit-suggestion', {
          content: this.content,
          contact_info: this.contact_info,
          images: images,
        })
        .then(() => {
          uni.hideLoading();

          uni.showToast({
            title: '提交成功',
            icon: 'none',
            mask: true,
          });

          setTimeout(() => {
            this.$toBack();
          }, 1000);
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
.feedback-page {
  .page-title {
    background: #ffffff;
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    background: #ffffff;
  }

  .feedback-container {
    padding: 20rpx 30rpx;

    .feedback-box {
      padding: 34rpx 22rpx;
      border-radius: 20rpx;
      background: #ffffff;

      .feedback-title {
        font-weight: 500;
        font-size: 30rpx;
        color: #1a1a1a;
        margin-bottom: 30rpx;
      }

      .input-box {
        background: #f5f6fa;
        height: 500rpx;
        border-radius: 20rpx;
        padding: 30rpx 20rpx;
        display: flex;
        flex-direction: column;
        margin-bottom: 50rpx;

        textarea {
          background: #f5f6fa;
          width: 100%;
          flex-grow: 1;
          font-size: 26rpx;
          margin-bottom: 20rpx;
        }

        .upload-box {
          flex-shrink: 0;
          height: 50px;

          .add {
            width: 100%;
            height: 100%;
            border-radius: 20rpx;
            border: 1px dashed #bfbfbf;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 50rpx;
            color: #bfbfbf;
          }
        }
      }

      .feedback-title2 {
        display: flex;
        align-items: center;
        gap: 20rpx;
        margin-bottom: 30rpx;

        text {
          &:nth-child(1) {
            font-weight: 500;
            font-size: 30rpx;
            color: #1a1a1a;
          }

          &:nth-child(2) {
            font-size: 22rpx;
            color: #999999;
          }
        }
      }

      .input-box2 {
        background: #f5f6fa;
        height: 120rpx;
        border-radius: 20rpx;
        padding: 30rpx 20rpx;
        display: flex;
        align-items: center;

        input {
          width: 100%;
          font-size: 26rpx;
        }
      }
    }
  }

  .submit {
    margin: 100rpx auto 0;
    width: 592rpx;
    height: 103rpx;
    background: #0abf92;
    border-radius: 52rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 32rpx;
    color: #ffffff;
  }
}
</style>
