<template>
  <view class="ai-chat-page">
    <view class="page-title">
      <text>{{ aiName }}</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <scroll-view class="chat-box" :scroll-y="true" :show-scrollbar="false" :scroll-top="scrollTop">
      <view class="chat-introduce">
        <view class="title">{{ aiTitle }}</view>

        <view class="question">
          <view class="question-title">猜你想说</view>
          <view class="question-list">
            <view class="question-item" v-for="item of questionList" :key="item.id" @click="selectQuestion(item)">
              {{ item.text }}
            </view>
          </view>
        </view>
      </view>

      <view class="chat-list">
        <view
          class="chat-item"
          :class="{ question: item.role === 1, answer: item.role === 2 }"
          v-for="item of chatList"
          :key="item.id"
        >
          <text v-if="item.role === 1">{{ item.content }}</text>
          <towxml v-else :nodes="item.content"></towxml>
        </view>
      </view>
    </scroll-view>

    <view class="message-box">
      <view class="input-box">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/aiChat/edit.png" />

        <input
          type="text"
          placeholder="说点什么..."
          :value="questionText"
          @input="questionText = $event.detail.value"
        />
      </view>

      <view class="send" :class="{ disabled: answering }" @click="sendMessage">发送</view>

      <view class="ai-tip"> 本服务为AI生成内容，结果仅供参考 </view>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';
import { concatenateArrayBuffers, verifyIsLogin } from '@/utils';

export default {
  name: 'aiChat',

  data() {
    return {
      agent_id: undefined,
      aiName: '',
      aiTitle: '',
      scrollTop: 99999,
      questionList: [],
      chatList: [],
      questionText: '',
      conversation_id: undefined,
      answering: false,
      thinkText: '正在思考，请稍等...',
    };
  },

  onLoad(options) {
    this.agent_id = options.agent_id;
    this.aiName = decodeURIComponent(options.name);
    this.getHistoryChat();

    if (this.agent_id === '10018') {
      this.aiTitle = '嗨~我是你的专属营养顾问，很高兴为您服务！';
      this.questionList = [
        {
          id: 1,
          text: '帮我生成一份减肥食谱',
        },
        {
          id: 2,
          text: '早餐吃什么？',
        },
        {
          id: 3,
          text: '营养午餐',
        },
        {
          id: 4,
          text: '晚餐吃什么既健康热量又不高？',
        },
      ];
    } else if (this.agent_id === '10019') {
      this.aiTitle = '嗨~我是你的专属营养师，很高兴为您服务！';
      this.questionList = [
        {
          id: 1,
          text: '该如何选择适合我的食物？',
        },
        {
          id: 2,
          text: '哪些食物营养健康',
        },
        {
          id: 3,
          text: '如何控制饮食？',
        },
        {
          id: 4,
          text: '健康饮食小知识',
        },
      ];
    } else if (this.agent_id === '10023') {
      this.aiTitle = '嗨~我能为你提供最合适您的饮食方案！';
      this.questionList = [
        {
          id: 1,
          text: '素食',
        },
        {
          id: 2,
          text: '喜欢吃夜宵',
        },
        {
          id: 3,
          text: '海鲜如何吃健康',
        },
        {
          id: 4,
          text: '怎么补充营养？',
        },
      ];
    } else if (this.agent_id === '10020') {
      this.aiTitle = '嗨~我是你的专属健身教练，很高兴为您服务！';
      this.questionList = [
        {
          id: 1,
          text: '如何开始健身计划',
        },
        {
          id: 2,
          text: '哪些运动项目适合我？',
        },
        {
          id: 3,
          text: '跑步',
        },
        {
          id: 4,
          text: '运动多久才能起到减肥效果？',
        },
      ];
    } else if (this.agent_id === '10021') {
      this.aiTitle = '嗨~我是你的专属食品配料表专家！';
      this.questionList = [
        {
          id: 1,
          text: '如何解读配料表中的成分',
        },
        {
          id: 2,
          text: '哪些成分对人体有害？',
        },
        {
          id: 3,
          text: '怎么判断食品是否健康？',
        },
        {
          id: 4,
          text: '哪些成分不能长期摄入？',
        },
      ];
    } else if (this.agent_id === '10024') {
      this.aiTitle = '嗨~可以为你提供准确的 BMI 值和相关健康建议！';
      this.questionList = [
        {
          id: 1,
          text: '身高170CM体重55kg，BMI值是多少？',
        },
        {
          id: 2,
          text: 'BMI偏低如何增加体重？',
        },
        {
          id: 3,
          text: 'BMI偏高，如何运动降低体重？',
        },
        {
          id: 4,
          text: '怎样平衡BMI？',
        },
      ];
    } else if (this.agent_id === '10025') {
      this.aiTitle = '嗨~我可以为你提供准确的基础代谢率结果和建议！';
      this.questionList = [
        {
          id: 1,
          text: '身高170CM体重55kg，我的基础代谢率是多少？',
        },
        {
          id: 2,
          text: '基础代谢率对身体有什么影响？',
        },
        {
          id: 3,
          text: '如何调整基础代谢率？',
        },
        {
          id: 4,
          text: '什么是基础代谢率？',
        },
      ];
    } else if (this.agent_id === '10022') {
      this.aiTitle = '嗨~我是热量计算器，可以帮你计算准确的热量！';
      this.questionList = [
        {
          id: 1,
          text: '每天摄入多少热量合适？',
        },
        {
          id: 2,
          text: '热量摄入过多怎么消耗热量？',
        },
        {
          id: 3,
          text: '哪些食物是高热量食物？',
        },
        {
          id: 4,
          text: '如何有效消耗热量？',
        },
      ];
    } else if (this.agent_id === '10026') {
      this.aiTitle = '嗨~我能为你计算精准的热量缺口！';
      this.questionList = [
        {
          id: 1,
          text: '如何确定我的活动水平？',
        },
        {
          id: 2,
          text: '我想减肥，应该设置多大的热量缺口？',
        },
        {
          id: 3,
          text: '热量缺口的大小根据什么来定?',
        },
        {
          id: 4,
          text: '热量缺口过大会怎么样？',
        },
      ];
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
    getHistoryChat() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/baseai/chat-records', {
          order_type: 1,
          pageIndex: 1,
          pageSize: 20,
          agent_id: this.agent_id,
        })
        .then((res) => {
          uni.hideLoading();

          if (res.data.Items && res.data.Items.length) {
            this.conversation_id = res.data.Items[0].conversation_id;
            this.chatList = res.data.Items.reverse();

            res.data.Items.forEach((item) => {
              if (item.role === 2) {
                item.content = this.$towxml(item.content, 'markdown');
              }
            });
          }

          this.$nextTick(() => {
            this.scrollTop += 1;
          });
        });
    },

    selectQuestion(item) {
      this.questionText = item.text;
      this.sendMessage();
    },

    sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    },

    sendMessage() {
      verifyIsLogin();

      if (this.answering) {
        return;
      }

      if (!this.questionText) {
        uni.showToast({
          title: '问题不能为空',
          icon: 'none',
        });

        return;
      }

      this.answering = true;

      this.chatList.push({
        id: Math.round().toString(),
        role: 1,
        content: this.questionText,
      });

      let answerObj = {
        id: Math.round().toString(),
        role: 2,
        content: this.$towxml(this.thinkText, 'markdown'),
      };

      this.chatList.push(answerObj);

      this.$nextTick(() => {
        this.scrollTop += 1;
      });

      const requestTask = uni.request({
        url: process.env.VUE_APP_REQUEST_BASE_API_URL + 'api/baseai/agent-chat',
        method: 'POST',
        header: {
          Accept: 'text/event-stream',
          token: uni.getStorageSync('foodDiaryToken').value,
        },
        data: {
          agent_id: this.agent_id,
          message: this.questionText,
          conversation_id: this.conversation_id,
        },
        enableChunked: true,
        responseType: 'arraybuffer',
        success: (res) => {
          console.log('Data received 数据接受完毕:', res.data);
        },
        fail: (error) => {
          console.log('打印***error 错误处理', error);
        },
        complete: (complete) => {
          console.log('打印***complete 完成接收', complete);

          // conversation_id为空的情况下重新获取conversation_id
          if (!this.conversation_id) {
            setTimeout(() => {
              $http
                .post('api/baseai/chat-records', {
                  order_type: 1,
                  pageIndex: 1,
                  pageSize: 20,
                  agent_id: this.agent_id,
                })
                .then((res) => {
                  if (res.data.Items && res.data.Items.length) {
                    this.conversation_id = res.data.Items[0].conversation_id;
                  }
                });
            }, 500);
          }
        },
      });

      let chunkLength = 0;
      let resList = [];

      requestTask.onChunkReceived(async (res) => {
        chunkLength += 1;
        let currentChunk = chunkLength;
        resList.push(res);

        const uint8Array = new Uint8Array(concatenateArrayBuffers(...resList.map((item) => item.data)));
        let text = String.fromCharCode.apply(null, uint8Array);

        try {
          let result = JSON.parse(text);

          if (result.Code) {
            answerObj.content = this.$towxml(result.Msg, 'markdown');

            this.$nextTick(() => {
              this.scrollTop += 1;
            });

            return;
          }
        } catch (e) {}

        const arr = text.split('\n\n').filter(Boolean);
        let content = '';

        for (let i = 0; i < arr.length; i++) {
          if (arr[i] === 'event: end\n' + 'data: {}') {
            break;
          }

          const jsonStr = arr[i].slice(6); // 去掉前缀

          try {
            const data = JSON.parse(jsonStr);
            await this.sleep(20);

            for (let j = 0; j < data.text.length; j++) {
              await this.sleep(20);

              if (currentChunk !== chunkLength) {
                content = '';
                answerObj.content = this.$towxml(content, 'markdown');
                return;
              } else {
                content += data.text[j];
                answerObj.content = this.$towxml(content, 'markdown');
              }

              this.$nextTick(() => {
                this.scrollTop += 1;
              });
            }
          } catch (e) {}
        }

        this.answering = false;
      });

      this.questionText = '';
    },
  },
};
</script>

<style lang="scss">
page {
  height: 100%;
  background: #f6f7fb;
}
</style>

<style scoped lang="scss">
.ai-chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/aiChat/bg1.png') left top/100% auto
    no-repeat;

  .page-title {
  }

  .banner {
    flex-shrink: 0;
    padding: calc(var(--page-title-height)) 0 0;
  }

  .chat-box {
    padding: 104rpx 30rpx 50rpx;
    flex-grow: 1;
    overflow: auto;

    .chat-introduce {
      background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/aiChat/bg3.png') left top/100% 100%
        no-repeat;
      padding: 84rpx 22rpx 50rpx;
      margin-bottom: 43rpx;

      .title {
        font-size: 26rpx;
        color: #111111;
        margin-bottom: 73rpx;
        padding-left: 103rpx;
        white-space: nowrap;
      }

      .question {
        .question-title {
          font-weight: bold;
          font-size: 26rpx;
          color: #111111;
          margin-bottom: 33rpx;
        }

        .question-list {
          display: flex;
          flex-direction: column;
          gap: 10rpx;

          .question-item {
            height: 60rpx;
            background: #ffffff;
            border-radius: 30rpx;
            padding: 0 30rpx;
            display: flex;
            align-items: center;
            font-size: 24rpx;
            color: #333333;
          }
        }
      }
    }

    .chat-list {
      display: flex;
      flex-direction: column;
      gap: 43rpx;

      .chat-item {
        max-width: 90%;
        white-space: wrap;
        word-break: break-word;
        line-height: 40rpx;
        font-size: 26rpx;

        &.question {
          padding: 18rpx 24rpx;
          background: #0abf92;
          border-radius: 25rpx 5rpx 25rpx 25rpx;
          color: #ffffff;
          align-self: flex-end;
        }

        &.answer {
          padding: 0 24rpx;
          min-width: 50%;
          background: #ffffff;
          border-radius: 5rpx 25rpx 25rpx 25rpx;
          color: #111111;
          align-self: flex-start;
        }
      }
    }
  }

  .message-box {
    flex-shrink: 0;
    padding: 0 30rpx 60rpx;
    height: 160rpx;
    background: #ffffff;
    display: flex;
    align-items: center;
    position: relative;

    .input-box {
      flex-grow: 1;
      height: 80rpx;
      padding: 0 30rpx;
      background: #f8f8f8;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      margin-right: 20rpx;

      image {
        width: 32rpx;
        margin-right: 14rpx;
      }

      input {
        flex-grow: 1;
        font-size: 26rpx;
      }
    }

    .send {
      flex-shrink: 0;
      width: 180rpx;
      height: 80rpx;
      background: #0abf92;
      border-radius: 40rpx;
      font-weight: 500;
      font-size: 32rpx;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;

      &.disabled {
        background: #aaaaaa;
        color: #ffffff;
      }
    }

    .ai-tip {
      position: absolute;
      bottom: 30rpx;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 20rpx;
      color: #cccccc;
    }
  }
}
</style>
