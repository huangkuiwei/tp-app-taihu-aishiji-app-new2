<template>
  <uni-popup ref="addRecodePopup" type="bottom" :safe-area="false">
    <view class="add-recode-dialog">
      <view class="title">
        <text class="title-text">饮食记录</text>
        <uni-icons type="closeempty" color="#999999" size="24" @click="$refs.addRecodePopup.close()" />
      </view>

      <view class="input-box">
        <view class="recording-tip" v-if="recording">正在说话中</view>

        <textarea
          :value="foodText"
          @input="foodText = $event.detail.value"
          :maxlength="-1"
          placeholder="都吃了些什么？ 例如：1个鸡蛋、1杯豆浆、2片土司"
        />

        <view class="tools">
          <image
            class="icon1"
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/icon1.png"
            @click="selectImage"
          />

          <view class="recording">
            <view class="tip">长按说话</view>

            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/icon3.png"
              :style="{ width: recording ? '100rpx' : '90rpx' }"
              @touchstart="handleTouchStart"
              @touchend="handleTouchEnd"
            />

            <view
              v-if="progress"
              class="progress-ring"
              :style="{ background: `conic-gradient(#0abf92 calc(${progress} * 0.6deg), #0abf9220 0)` }"
            />
          </view>

          <image
            class="icon2"
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/icon2.png"
            @click="takePhoto"
          />
        </view>
      </view>

      <view class="recode-list" v-if="!type">
        <view class="recode-item" v-for="(item, index) in recodeList" :key="index" @click="onTypeChange(item)">
          <picker
            v-if="item.type === 2 || item.type === 4 || item.type === 6"
            mode="selector"
            range-key="text"
            :range="addMealList"
            :value="addMealList.findIndex((x) => x.type === item.type)"
            @change="onAddMealChange(item, $event)"
            @cancel="onAddMeaCancel(item)"
          >
            <view class="recode-item-content">
              <image mode="heightFix" :src="item.icon" />
              <text class="text">{{ item.text }}</text>
              <text v-if="item.type === selectRecode.type" class="line"></text>
            </view>
          </picker>

          <view class="recode-item-content" v-else>
            <image mode="heightFix" :src="item.icon" />
            <text class="text">{{ item.text }}</text>
            <text v-if="item.type === selectRecode.type" class="line"></text>
          </view>
        </view>
      </view>

      <view class="submit" @click="submit">确定</view>
    </view>
  </uni-popup>
</template>

<script>
import $http from '@/utils/http';

let recorderManager = null;

export default {
  name: 'addFoodRecodeDialog',

  props: {
    type: {
      type: [String, Number],
    },
  },

  data() {
    return {
      foodText: '',
      recodeList: [
        {
          type: 1,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon1.png',
          text: '早餐',
        },

        {
          type: 3,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon2.png',
          text: '午餐',
        },

        {
          type: 5,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon3.png',
          text: '晚餐',
        },
        {
          type: 2,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon1.png',
          text: '加餐',
        },
      ],
      addMealList: [
        {
          type: 2,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon1.png',
          text: '早加餐',
        },
        {
          type: 4,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon2.png',
          text: '午加餐',
        },
        {
          type: 6,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon3.png',
          text: '晚加餐',
        },
      ],
      selectRecode: {},
      recording: false,
      progress: 0,
    };
  },

  methods: {
    open() {
      if (this.type) {
        this.selectRecode = this.recodeList.find((item) => Number(item.type) === Number(this.type));
      } else {
        let type = this.selectRecode.type;

        if (type) {
          if (type === 1 || type === 3 || type === 5) {
            this.recodeList.splice(3, 1, {
              type: 2,
              icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/recode/food-icon1.png',
              text: '加餐',
            });
          }
        } else {
          this.selectRecode = this.recodeList[0];
        }
      }

      this.$refs.addRecodePopup.open();
    },

    close() {
      this.$refs.addRecodePopup.close();
    },

    onTypeChange(item) {
      if (item.type === 2 || item.type === 4 || item.type === 6) {
      }

      this.selectRecode = item;
    },

    onAddMealChange(item, event) {
      let value = event.detail.value;
      Object.assign(item, this.addMealList[value]);
    },

    onAddMeaCancel(item) {
      let index = this.addMealList.findIndex((x) => x.type === item.type);
      Object.assign(item, this.addMealList[index]);
    },

    submit() {
      if (!this.selectRecode.type) {
        uni.showToast({
          title: '请选择饮食类型',
          icon: 'none',
        });

        return;
      }

      if (!this.foodText.trim()) {
        uni.showToast({
          title: '请填写记录',
          icon: 'none',
        });

        return;
      }

      let type = this.selectRecode.type;

      this.$emit('addRecode', {
        text: this.foodText,
        type: type,
        input_type: 1,
      });
    },

    selectImage() {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album'],
        success: (res) => {
          let filePath = res.tempFiles[0].tempFilePath;

          this.$emit('addImageRecode', {
            url: filePath,
            type: this.selectRecode.type,
            input_type: 2,
          });
        },
      });
    },

    takePhoto() {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera'],
        success: (res) => {
          let filePath = res.tempFiles[0].tempFilePath;

          this.$emit('addImageRecode', {
            url: filePath,
            type: this.selectRecode.type,
            input_type: 2,
          });
        },
      });
    },

    handleTouchStart() {
      let timer = null;

      recorderManager = uni.getRecorderManager();

      recorderManager.onStart(() => {
        timer = setInterval(() => {
          if (this.progress >= 600) {
            clearInterval(timer);
            recorderManager.stop();
          } else {
            this.progress += 1;
          }
        }, 100);
      });

      recorderManager.onStop((res) => {
        this.recording = false;
        timer && clearInterval(timer);

        uni.showLoading({
          title: this.progress >= 600 ? '单次录音最高60秒，正在识别...' : '正在识别...',
          mask: true,
        });

        this.progress = 0;

        $http
          .upload('api/baseai/speech-to-text', res.tempFilePath, 'file', {
            sampleRate: 16000,
          })
          .then((res) => {
            uni.hideLoading();

            if (res.data && res.data.text) {
              this.foodText += res.data.text.join('');
            } else {
              uni.showToast({
                title: '未识别到语音，请重新录入',
                icon: 'none',
              });
            }
          });
      });

      recorderManager.onError((res) => {
        this.recording = false;
        this.progress = 0;
        timer && clearInterval(timer);

        if (res.errMsg === 'operateRecorder:fail auth deny') {
          uni.showModal({
            title: '提示',
            content: '您没有授权麦克风权限，无法使用该功能，请跳转到设置页面打开麦克风权限',
            showCancel: true,
            success: (res) => {
              if (res.confirm) {
                uni.openSetting({
                  success(res) {
                    console.log(res.authSetting);
                  },
                });
              } else if (res.cancel) {
                console.log('用户点击取消');
              }
            },
          });

          return;
        }

        uni.showToast({
          title: res.errMsg,
          icon: 'none',
        });
      });

      recorderManager.start();
      this.recording = true;
    },

    handleTouchEnd() {
      recorderManager.stop();
    },
  },
};
</script>

<style scoped lang="scss">
.add-recode-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx 35rpx 46rpx;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .title-text {
      font-weight: 500;
      font-size: 32rpx;
      color: #111111;
    }
  }

  .input-box {
    height: 540rpx;
    background: #f8f8f8;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    padding: 32rpx 20rpx 0;
    margin-bottom: 60rpx;
    position: relative;

    .recording-tip {
      position: absolute;
      top: -54rpx;
      left: 140rpx;
      font-size: 22rpx;
      color: #999999;
    }

    textarea {
      width: 100%;
      flex-grow: 1;
      font-size: 26rpx;
      line-height: 40rpx;
    }

    .tools {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 10rpx;

      .icon1,
      .icon2 {
        width: 50rpx;
      }

      .recording {
        width: 120rpx;
        height: 120rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .tip {
          font-size: 22rpx;
          color: #bfbfbf;
          position: absolute;
          top: -34rpx;
          left: 18rpx;
        }

        .progress-ring {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          &::after {
            content: '';
            position: absolute;
            width: 116rpx;
            height: 116rpx;
            background: #f8f8f8;
            border-radius: 50%;
          }
        }

        image {
          position: relative;
          z-index: 9;
        }
      }
    }
  }

  .recode-list {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;

    .recode-item {
      width: 25%;

      .recode-item-content {
        width: 100%;
        margin-bottom: 40rpx;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;

        image {
          height: 48rpx;
          margin-bottom: 14rpx;
        }

        .text {
          font-size: 24rpx;
          color: #1a1a1a;
          white-space: nowrap;
        }

        .line {
          width: 60rpx;
          height: 5rpx;
          background: #0abf92;
          border-radius: 3rpx;
          position: absolute;
          bottom: -12rpx;
        }
      }
    }
  }

  .submit {
    width: 590rpx;
    margin: 0 auto;
    height: 100rpx;
    background: #0abf92;
    border-radius: 50rpx;
    font-weight: 500;
    font-size: 32rpx;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
