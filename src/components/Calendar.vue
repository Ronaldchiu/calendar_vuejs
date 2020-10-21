<template>
  <div class="calendar">
      <div class="container">
          <div class="scroll-date">{{curYear}}年{{scrollMonth}}月</div>
          <!-- 日历面板 -->
          <div class="calendarPanel">
              <div class="weekPanel">
                  <div v-for="item in weekList" :key="item">{{item}}</div>
              </div>
              <div class="dayPanel" ref="scrollList" @scroll="handleScroll">
                    <div class="daySeciton">
                        <div v-for="(month, monIndex) in date" :key="monIndex" ref="monItem">
                            <div class="monthName" ref="monTitle" :style="{ marginLeft: month.lastWidth + 'px'}">{{monIndex + 1}}月</div>
                            <ul v-for="(day, dayIndex) in month.dates" :key="dayIndex" :class="day.class">
                                <li>{{day.day}}</li>
                            </ul>
                        </div>
                    </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'Calendar',
  data () {
    return {
      weekList: ['日', '一', '二', '三', '四', '五', '六'], // 星期数组
      curYear: new Date().getFullYear(),
      curMonth: new Date().getMonth() + 1,
      dates: [],
      date: [],
      scrollMonth: 10
    }
  },
  mounted () {
    this.createCurDate()
    for (let i = 1; i <= 12; i++) {
      this.createCurMonth(i)
      const arr = this.dates.filter((item) => {
        return item.class === 'lastMonth'
      })
      this.date.push({
        dates: this.dates,
        lastWidth: arr.length * 108
      })
    }
    this.$nextTick(function () {
      this.initScroll()
    })
  },
  // 创建日历
  methods: {
    initScroll () { // 日历显示初始位置，即滚动到2020年10月份的
      const element = this.$refs.monItem
      let eleHeight = 0
      for (let i = 0; i < new Date().getMonth(); i++) {
        eleHeight += element[i].offsetHeight
      }
      if (this.curYear === new Date().getFullYear()) {
        this.$refs.scrollList.scrollTo(0, eleHeight)
      }
    },
    handleScroll (e) {
      console.log(e.target.scrollTop)
      if (e.target.scrollTop === 0) { // 如果滚动到顶部，就推到前一年的日历
        // console.log('sdada')
        this.$nextTick(function () {
          this.$refs.scrollList.scrollTo(0, e.target.scrollHeight - e.target.clientHeight)
          this.curYear--
        })
        this.date = []
        this.createCurDate()
        for (let i = 1; i <= 12; i++) {
          this.createCurMonth(i)
          const arr = this.dates.filter((item) => {
            return item.class === 'lastMonth'
          })
          this.date.push({
            dates: this.dates,
            lastWidth: arr.length * 108
          })
        }
      }
      if (e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight)) {
        e.target.scrollTop = 0
        this.curYear++
        this.date = []
        this.createCurDate()
        for (let i = 1; i <= 12; i++) {
          this.createCurMonth(i)
          const arr = this.dates.filter((item) => {
            return item.class === 'lastMonth'
          })
          this.date.push({
            dates: this.dates,
            lastWidth: arr.length * 108
          })
        }
      }
      const distance = e.target.scrollHeight - e.target.clientHeight
      this.scrollMonth = Math.abs(Math.ceil((e.target.scrollTop + 10) / (distance / 12)))
    },
    createCurDate () {
      const curMonthdays = new Date(this.curYear, this.curMonth, 0).getDate() // 获取当月的天数
      const lastMonthdays = new Date(this.curYear, this.curMonth - 1, 0).getDate() // 获取上个月天数
      const firstDay = new Date(this.curYear, this.curMonth - 1, 1).getDay() // 当月第一天的星期数
      this.dates = []

      for (let i = lastMonthdays - firstDay + 1; i <= lastMonthdays; i++) {
        this.dates.push({
          day: i,
          year: this.curYear,
          month: this.curMonth,
          class: 'lastMonth'
        })
      }

      for (let i = 1; i <= curMonthdays; i++) {
        this.dates.push({
          day: i,
          year: this.curYear,
          month: this.curMonth,
          class: 'curMonth'
        })
      }

      const nextDays = 7 - this.dates.length % 7 // 理解一下?
      if (nextDays < 7 && nextDays > 0) {
        let day = 0
        for (let i = 0; i < nextDays; i++) {
          this.dates.push({
            day: ++day,
            year: this.curYear,
            month: this.curMonth + 1,
            class: 'nextMonth'
          })
        }
      }
    },
    createCurMonth (month) {
      this.curMonth = month
      this.createCurDate()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/css/variable";
@import "../assets/css/mixin";
.calendar {
    position: relative;
    margin: 0 auto;
    margin-top: 50px;
}
.container {
    height: 1200px;
    @include font_size($font_small);
    border: 0.8px solid rgba(0, 0, 0, 0.4);
    border-top: 0
}
.weekPanel {
    border-bottom: 0.8px solid rgba(0, 0, 0, 0.4);
    margin-bottom: 30px;
    div {
        display: inline-block;
        width: 14%;
        height: 40px;
        text-align: center;
        line-height: 40px;
    }
}
.dayPanel {
    position: relative;
    height: 1100px;
    overflow: hidden;
    overflow-y: scroll;
    .monthName {
        font-weight: bold;
        @include font_size($font_large);
        text-align: left;
        padding: 10px;
        margin-bottom: 20px;
        margin-top: 20px;
        border-bottom: 0.8px solid rgba(0, 0, 0, 0.4);
    }
    ul {
        position: relative;
        display: inline-block;
        width: 14%;
        height: 60px;
        text-align: center;
        line-height: 60px;
        &.lastMonth,
        &.nextMonth {
            color: #bbbbbb;
        }
        li {
        font-weight: bold;
        @include font_size($font_medium);
        }
    }
}
.scroll-date {
    @include font_size($font_medium);
    text-align: center;
}

</style>
