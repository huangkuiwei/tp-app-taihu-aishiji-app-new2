<template>
  <view class="calendar-com">
    <!-- 年月标题与切换按钮 -->
    <view class="calendar-header">
      <text class="time">{{ currentMonth }}</text>

      <view class="toggle">
        <uni-icons @click="prevMonth" color="#999999" type="left" size="16"></uni-icons>
        <uni-icons @click="nextMonth" color="#999999" type="right" size="16"></uni-icons>
      </view>
    </view>

    <!-- 星期行 -->
    <view class="calendar-weekdays">
      <view v-for="day in weekDays" :key="day" class="weekday">{{ day }}</view>
    </view>

    <!-- 日期展示 -->
    <view class="calendar-days">
      <view
        v-for="day in calendarDays"
        :key="day.date"
        class="calendar-day"
        :class="{
          disabled: day.disabled,
          selected: day.selected,
          today: day.isToday,
        }"
        @click="selectDay(day)"
      >
        <text>{{ day.value }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'calendar',

  props: {
    initialWeight: {
      type: Number,
    },

    targetWeight: {
      type: Number,
    },
  },

  data() {
    return {
      currentDate: new Date().getTime(), // 当前显示月份的时间戳
      selectedDate: null, // 选中日期的时间戳
      minSelectableDate: null, // 最小可选日期（明天）
      weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    };
  },

  computed: {
    currentMonth() {
      const date = new Date(this.currentDate);
      return `${date.getFullYear()}年${date.getMonth() + 1}月`;
    },

    calendarDays() {
      const date = new Date(this.currentDate);
      const year = date.getFullYear();
      const month = date.getMonth();

      const firstDay = new Date(year, month, 1); // 本月第一天
      const lastDay = new Date(year, month + 1, 0); // 本月最后一天
      const totalDays = lastDay.getDate(); // 总天数
      const startDay = firstDay.getDay(); // 第一天是星期几（0=周日）

      const days = [];
      const today = new Date(); // 当前时间
      const minDate = this.minSelectableDate;

      // 补齐前面空白的格子（周一为第一列）
      const offset = (startDay + 6) % 7; // 调整成周一为第一天
      for (let i = 0; i < offset; i++) {
        days.push({ value: '', disabled: true });
      }

      // 添加当月的每一天
      for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}/${month + 1 > 9 ? month + 1 : `0${month + 1}`}/${day > 9 ? day : `0${day}`}`;
        const currDate = new Date(year, month, day).getTime();
        const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
        const isSelected = this.selectedDate && dateStr === this.selectedDate;
        let isDisabled = currDate <= minDate;

        if (this.initialWeight && this.targetWeight) {
          let now = Date.now();
          let day = Math.ceil((currDate - now) / (1000 * 60 * 60 * 24));
          let week = day / 7;

          if (this.initialWeight > this.targetWeight) {
            // 禁选平均一周减肥超过1斤的日期
            isDisabled =
              Number(((this.initialWeight - this.targetWeight) / week).toFixed(2)) > 1 || currDate <= minDate;
          } else {
            // 禁选平均一周增重超过1斤的日期
            isDisabled =
              Number(((this.targetWeight - this.initialWeight) / week).toFixed(2)) > 1 || currDate <= minDate;
          }
        }

        days.push({
          dateStr,
          value: day,
          date: currDate,
          isToday,
          disabled: isDisabled,
          selected: isSelected,
        });
      }

      // 补齐最后一行（最多补6个空格）
      const totalCells = offset + totalDays;
      const fillCount = (7 - (totalCells % 7)) % 7;
      for (let i = 0; i < fillCount; i++) {
        days.push({ value: '', disabled: true });
      }

      return days;
    },
  },

  watch: {
    selectedDate(value) {
      this.$emit('selectDayChange', value);
    },
  },

  created() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    this.minSelectableDate = tomorrow.getTime();
  },

  methods: {
    prevMonth() {
      const date = new Date(this.currentDate);
      date.setMonth(date.getMonth() - 1);
      this.currentDate = date.getTime();
    },

    nextMonth() {
      const date = new Date(this.currentDate);
      date.setMonth(date.getMonth() + 1);
      this.currentDate = date.getTime();
    },

    selectDay(day) {
      if (day.disabled || !day.value) return;
      this.selectedDate = day.dateStr;
    },
  },
};
</script>

<style scoped lang="scss">
.calendar-com {
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 54rpx;

    .time {
      font-weight: 500;
      font-size: 38rpx;
      color: #333333;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 60rpx;
    }
  }

  .calendar-weekdays {
    display: flex;
    justify-content: space-between;
    text-align: center;
    margin-bottom: 20rpx;

    .weekday {
      font-size: 26rpx;
      color: #999999;
      flex-grow: 1;
      text-align: center;
    }
  }

  .calendar-days {
    display: flex;
    flex-wrap: wrap;

    .calendar-day {
      width: calc(100% / 7);
      padding: 2rpx 0;
      cursor: pointer;
      font-size: 26rpx;
      color: #333333;
      display: flex;
      align-items: center;
      justify-content: center;

      &.selected {
        color: #ffffff;

        text {
          background: #0abf92;
        }
      }

      &.disabled {
        color: #999999;
      }

      text {
        width: 58rpx;
        height: 58rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
