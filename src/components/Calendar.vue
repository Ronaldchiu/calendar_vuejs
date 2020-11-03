<template>
  <div class="calendar">
      <transition name="fade">
          <div v-show="isShow" class="title">当前选择的日期为：{{ displayYear }}年{{ displayMonth }}月{{ displayDay }}日 星期{{ displayWeek }}</div>
      </transition>
      <div class="weekPanel">
          <div v-for="item in weekList" :key="item">{{item}}</div>
      </div>
      <div class="container">
         <!-- 浮动日期 -->
        <transition name="fade">
          <div class="scroll-date" v-if="dispaly">{{scrollYear}}年{{scrollMonth}}月</div>
        </transition>
          <!-- 日历面板 -->
          <div class="calendarPanel">
              <div class="dayPanel" ref="scrollList" @scroll="handleScroll">
                    <div class="daySeciton">
                        <div v-for="(year, yearIndex) in yearData" :key="year.curYear" ref="yearItem">
                            <div v-for="(month, monIndex) in year.monthData" :key="month.month" ref="monItem">
                                <div :class="year.curYear === selectYear && month.month === selectMonth ? 'thisMonth': 'monthName'" :style="{ marginLeft: month.lastWidth + 'px'}">{{month.month}}月</div>
                                <ul v-for="(day, dayIndex) in month.dayData" :key="day.date"
                                :class="[day.class,
                                day.isActive ? 'active' : '',
                                day.day === selectToday && day.year === selectYear & day.class === 'curMonth' && day.month === selectMonth ? 'today' : '']"
                                @click="handleDayClick(day, dayIndex, monIndex, yearIndex)"
                                >
                                    <li ref="dayItem">{{day.day}}</li>
                                </ul>
                            </div>
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
      selectToday: new Date().getDate(),
      selectYear: new Date().getFullYear(),
      selectMonth: new Date().getMonth() + 1,
      dayData: [],
      monthData: [],
      yearData: [],
      scrollMonth: 1,
      scrollYear: 2019,
      dayWidth: 108,
      scrollTop: 0,
      oldscrollTop: 0,
      dispaly: true,
      yearArr: [],
      displayWeek: '',
      displayMonth: '',
      displayDay: '',
      displayYear: '',
      isShow: false,
      lastYear: new Date().getFullYear() - 1,
      nextYear: new Date().getFullYear(), // 2020
      bottom: 0
    }
  },
  mounted () {
    this.createCalendar()
    this.$nextTick(() => {
      this.dayWidth = this.$refs.dayItem[0].offsetWidth
      this.initScroll()
    })
  },
  watch: {
    // 监听滚动开始与结束
    scrollTop (newVal, oldVal) {
      setTimeout(() => {
        if (newVal === this.scrollTop) {
          console.log('滚动结束')
          this.oldscrollTop = newVal
          this.dispaly = false
          console.log(newVal)
        }
      }, 200)
      if (this.oldscrollTop === oldVal) {
        console.log('滚动开始')
        this.dispaly = true
        this.isShow = false
      }
      if (newVal < 400) {
        this.fillLastCalendar()
        console.log('滚动到顶部')
      }
      if (((this.$refs.scrollList.scrollHeight - this.$refs.scrollList.clientHeight) - newVal) < 700) {
        this.fillNextCalendar()
        console.log('滚动到底部')
      }
    }
  },
  // 创建日历
  methods: {
    // 日历面板初始化，得到yearData数据，层叠关系：yearData( monthData (dayData) )
    // 向上补充数据(增加的是yearArr与yearData的数据)
    fillLastCalendar () {
      const fillYear = this.lastYear - 1
      this.yearArr.unshift(fillYear) // 收集年份到yearArr数组
      this.yearArr.pop()
      this.curYear = fillYear
      for (let j = 1; j <= 12; j++) { // 月
        this.createCurMonth(j)
        const arr = this.dayData.filter((item) => {
          return item.class === 'lastMonth'
        })
        this.monthData.push({
          dayData: this.dayData,
          lastWidth: arr.length * this.dayWidth,
          month: this.dayData[j].month
        })
      }
      this.yearData.unshift({ monthData: this.monthData, curYear: this.curYear })
      this.yearData.pop()
      this.monthData = []
      this.lastYear--
    },
    // 向下补充数据
    fillNextCalendar () {
      const fillYear = this.nextYear + 1
      this.yearArr.push(fillYear) // 收集年份到yearArr数组
      this.curYear = fillYear
      for (let j = 1; j <= 12; j++) { // 月
        this.createCurMonth(j)
        const arr = this.dayData.filter((item) => {
          return item.class === 'lastMonth'
        })
        this.monthData.push({
          dayData: this.dayData,
          lastWidth: arr.length * this.dayWidth,
          month: this.dayData[j].month
        })
      }
      this.yearData.push({ monthData: this.monthData, curYear: this.curYear })
      this.monthData = []
      this.nextYear++
    },
    createCalendar () {
      // 输入起始年月
      const startYear = this.lastYear // 2019--2020
      const endYear = startYear + 1
      for (let i = startYear; i <= endYear; i++) { // 年
        this.curYear = i
        this.yearArr.push(i) // 收集年份到yearArr数组
        for (let j = 1; j <= 12; j++) { // 月
          this.createCurMonth(j)
          const arr = this.dayData.filter((item) => {
            return item.class === 'lastMonth'
          })
          this.monthData.push({
            dayData: this.dayData,
            lastWidth: arr.length * this.dayWidth,
            month: this.dayData[j].month
          })
        }
        this.yearData.push({ monthData: this.monthData, curYear: this.curYear })
        this.monthData = []
      }
    },
    createCurMonth (month) {
      this.curMonth = month
      this.createCurDate() // 日
    },
    // 创建日期数据
    createCurDate () {
      const curMonthdays = new Date(this.curYear, this.curMonth, 0).getDate() // 获取当月的天数
      const lastMonthdays = new Date(this.curYear, this.curMonth - 1, 0).getDate() // 获取上个月天数
      const firstDay = new Date(this.curYear, this.curMonth - 1, 1).getDay() // 当月第一天的星期数
      this.dayData = []

      for (let i = lastMonthdays - firstDay + 1; i <= lastMonthdays; i++) {
        this.dayData.push({
          day: i,
          year: this.curYear,
          month: this.curMonth,
          isActive: false,
          class: 'lastMonth',
          date: this.curYear + '-' + this.curMonth + '-' + i
        })
      }

      for (let i = 1; i <= curMonthdays; i++) {
        this.dayData.push({
          day: i,
          year: this.curYear,
          month: this.curMonth,
          isActive: false,
          class: 'curMonth',
          ate: this.curYear + '-' + this.curMonth + '-' + i
        })
      }

      const nextDays = 7 - this.dayData.length % 7
      if (nextDays < 7 && nextDays > 0) {
        let day = 0
        for (let i = 0; i < nextDays; i++) {
          this.dayData.push({
            day: ++day,
            year: this.curYear,
            month: this.curMonth + 1,
            isActive: false,
            class: 'nextMonth',
            ate: this.curYear + '-' + this.curMonth + '-' + i
          })
        }
      }
    },
    // 日期点击处理
    handleDayClick (day, dayIndex, monIndex, yearIndex) {
      this.yearData.forEach((cur, index) => {
        cur.monthData.forEach((cur, index) => {
          cur.dayData.forEach((cur, index) => {
            cur.isActive = false
          })
        })
      })
      this.displayWeek = this.weekList[dayIndex % 7] // 选中日期的星期
      this.displayYear = day.year
      this.displayMonth = day.month
      this.displayDay = day.day
      if (day.class !== 'curMonth') return
      this.isShow = true
      this.yearData[yearIndex].monthData[monIndex].dayData.forEach((cur, index) => {
        if (dayIndex === index) {
          cur.isActive = true // 日期被选中
        } else {
          cur.isActive = false
        }
      })
      console.log(this.displayWeek)
    },
    // 滚动到初始位置，即日历当前月份
    initScroll () {
      const yearItem = this.$refs.yearItem
      const monItem = this.$refs.monItem
      let monHeight = 0
      let yearHeight = 0
      const yearlen = new Date().getFullYear() - this.lastYear
      const tt = yearlen * 12
      const monlen = tt + new Date().getMonth()
      for (let i = 0; i < yearlen; i++) {
        yearHeight += yearItem[i].offsetHeight
      }
      for (let i = tt; i < monlen; i++) {
        monHeight += monItem[i].offsetHeight
      }
      const sum = monHeight + yearHeight
      const vm = this.$refs.scrollList
      vm.scrollTo(0, sum)
      this.bottom = vm.scrollHeight - vm.clientHeight
    },
    // 处理滚动
    handleScroll (e) {
      this.scrollTop = e.target.scrollTop
      const yearItemHeight = (e.target.scrollHeight) / (this.yearData.length)
      const monItemHeight = (e.target.scrollHeight) / (this.yearData.length * 12)
      const num = Math.floor((e.target.scrollTop / monItemHeight) + 1)
      if (num % 12 !== 0) {
        this.scrollMonth = num % 12
      } else {
        this.scrollMonth = 12
      }
      const index = Math.ceil((e.target.scrollTop + 20) / yearItemHeight) - 1
      this.scrollYear = this.yearArr[index]
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/css/variable";
@import "../assets/css/mixin";
.calendar {
    margin: 0 auto;
    margin-top: 50px;
    .title {
      position: absolute;
      top: 20px;
      left: 15%;
      @include font_size($font_medium);
    }
    .weekPanel {
        position: fixed;
        top: 75px;
        width: 100%;
        @include font_size($font_small);
        border-bottom: .8px solid rgba(0, 0, 0, .4);
        z-index: 999;
        div {
            display: inline-block;
            width: 14%;
            height: 40px;
            text-align: center;
            font-weight: bold;
            line-height: 40px;
        }
    }
    // 浮动区域
    .container {
        position: relative;
        margin-top: 120px;
        @include font_size($font_small);
        // border: .8px solid rgba(0, 0, 0, .4);
        border-top: 0;
        z-index: 1;
        .scroll-date {
            position: fixed;
            top: 120px;
            left: 40%;
            @include font_size($font_large);
            font-weight: bold;
            text-align: center;
        }
        .calendarPanel{
            .dayPanel {
                position: relative;
                overflow: hidden;
                overflow-y: scroll;
                height: 100vh;
                .monthName {
                    padding: 10px;
                    margin-bottom: 20px;
                    margin-top: 20px;
                    font-weight: bold;
                    border-bottom: .8px solid rgba(0, 0, 0, .4);
                    @include font_size($font_large);
                    text-align: left;
                }
                .thisMonth {
                    padding: 10px;
                    margin-bottom: 20px;
                    margin-top: 20px;
                    font-weight: bold;
                    border-bottom: .8px solid rgba(0, 0, 0, .4);
                    @include font_size($font_large);
                    text-align: left;
                    color: red;
                }
                ul {
                    position: relative;
                    display: inline-block;
                    width: 14%;
                    height: 100px;
                    text-align: center;
                    line-height: 100px;
                    cursor: pointer;
                    &.lastMonth,
                    &.nextMonth {
                        color: #bbbbbb;
                    }
                    &::after {
                        content: "";
                        display: block;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        background-color: transparent;
                        z-index: -1;
                    }
                    &.active {
                        color: #fff;
                        &::after {
                            background-color: red;
                        }
                        &.today {
                            color: #fff;
                        }
                    }
                    &.today {
                      border-radius: 50%;
                      color: red;
                    }
                    li {
                    font-weight: bold;
                    @include font_size($font_medium);
                    }
                }
            }
        }

    }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
