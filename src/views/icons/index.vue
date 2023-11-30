<template>
  <div class="chat-gpt">
    <div id="chat-dialog" class="chat-dialog" ref="chatDialogRef">
      <div id="chat-list" class="chat-list" ref="chatListRef">
        <div v-for="(item, index) in chatList" :key="index">
          <img
            v-if="item.status && index % 2 == 0"
            src="../../../public/chat.png"
            alt=""
          />
          <div :class="index % 2 == 0 ? 'odd' : 'even'">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      textCount: 0,
      timer: null,
      chatBaseList: [
        "以今日5辆满电无人车，运输5小时能运完50吨货物的标准，已知每辆无人车运输1小时耗电10%，运输效率是多少，每辆无人车耗电多少？花费多长时间？",
        "运输效率：50吨/5小时=10顿/小时，每辆无人车耗电：10%×5小时=50%，需花费5小时。",
        "以现有运输效率前提下，再增加5辆无人运输车，完成共计150吨物资的运输任务，整体效率会提高到多少？每辆无人车耗电又是多少？共花费多长时间？",
        "增加到10辆无人车，完成共计150吨物资运输任务，整体效率会提高到15顿/小时，每辆无人车耗电百分比是15%。运完150吨的话，总共要耗用1.5小时。",
        "我来想想是否确认执行此调配操作？",
        "您好，请您慎重考虑。我们将根据您的确认来决定是否执行此调配操作。",
        "是",
      ],
      chatList: [],
    };
  },
  mounted() {
    this.initGPT();
  },
  methods: {
    // 延时函数
    sleep(delaytime = 10000) {
      return new Promise((resolve) => setTimeout(resolve, delaytime));
    },
    // 同步遍历，自定义延时时间
    async delayDo(
      iterList,
      callback = (data) => console.log(`数据：${data}`),
      delaytimeList
    ) {
      let len = iterList.length;
      for (let i = 0; i < len; i++) {
        callback(iterList[i], i);

        await this.sleep(delaytimeList[i]);
      }
    },
    // 逐字显示内容
    getChatContent(text, index) {
      this.timer = setInterval(() => {
        this.textCount++;

        if (this.textCount == text.length + 1) {
          this.textCount = 0;
          this.chatList.splice(index, 1, { content: text, status: false });
          clearInterval(this.timer);

          return;
        }

        // 取字符串子串
        let nowStr = text.substring(0, this.textCount);
        this.chatList.splice(index, 1, { content: nowStr, status: true });
      }, 200);
    },
    // 点击开始聊天
    initGPT() {
      // const delaytimeList = [11000, 8000, 6000, 15000, 4000];
      const delaytimeList = [16000, 11000, 16000, 16000, 5000, 7000];

      this.delayDo(
        this.chatBaseList,
        (item, i) => {
          this.getChatContent(item, i);
        },
        delaytimeList
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.chat-gpt {
  width: 33rem;
  height: 43rem;

  .chat-dialog {
    position: relative;
    height: 43rem;
    // background: 0/33rem url("../../../public/tusd.png") no-repeat;
    overflow: hidden;

    .close-icon {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 3.4rem;
      height: 3.4rem;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .chat-list {
      display: flex;
      flex-direction: column;
      width: 90%;
      margin: 0 auto;
      margin-top: 2rem;
      overflow: auto;

      > div {
        display: flex;
        margin-top: 1rem;

        > div {
          max-width: 19rem;
          padding: 0.6rem;
          opacity: 0.8;

          font-size: 0.9rem;
          font-family: FZLanTingHei-L-GBK;
          font-weight: 400;
          color: #c5e7ff;
          text-align: start;
        }

        .odd {
          align-self: flex-start;
          background: #435e6f;
          border-radius: 0px 16px 16px 16px;
        }

        .even {
          align-self: flex-end;
          background: #31b8c8;
          border-radius: 16px 0px 16px 16px;
        }

        img {
          width: 2rem;
          height: 2rem;
          margin-right: 1rem;
        }
      }

      > div:nth-of-type(odd) {
        align-self: flex-start;
      }

      > div:nth-of-type(even) {
        align-self: flex-end;
      }
    }
  }

  .chat-tips {
    display: flex;
    height: 5.82rem;
    margin-top: 1rem;

    .gpt-icon {
      height: 100%;

      img {
        height: 100%;
      }
    }
  }
}
</style>
