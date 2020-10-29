<template>
  <div class="calendar">
      <transition name="fade">
          <div v-show="isShow" class="titel">当前选择的日期为：{{ displayYear }}年{{ displayMonth }}月{{ displayDay }}日 星期{{ displayWeek }}</div>
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
                        <div v-for="(year, yearIndex) in yearData" :key="yearIndex" ref="yearItem">
                            <div v-for="(month, monIndex) in year" :key="monIndex" ref="monItem">
                                <div class="monthName" :style="{ marginLeft: month.lastWidth + 'px'}">{{month.month}}月</div>
                                <ul v-for="(day, dayIndex) in month.dayData" :key="dayIndex"
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
      dayWidth: 100,
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
      nextYear: new Date().getFullYear()
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
    scrollTop (newVal, oldVal) {
      setTimeout(() => {
        if (newVal === this.scrollTop) {
          console.log('滚动结束')
          this.oldscrollTop = newVal
          this.dispaly = false
        }
      }, 200)
      if (this.oldscrollTop === oldVal) {
        console.log('滚动开始')
        this.dispaly = true
        this.isShow = false
      }
    }
  },
  // 创建日历
  methods: {
    // 日历面板初始化，得到yearData数据，层叠关系：yearData( monthData (dayData) )
    // 初始化2019与2020两个年份，fillLastCalendar填充2018和2019两个年份
    fillLastCalendar () {
      // 输入起始年月
      for (let i = this.lastYear; i >= this.lastYear - 1; i--) {
        this.yearArr.unshift(i) // 收集年份到yearArr数组
        this.curYear = i
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
        this.yearData.unshift(this.monthData)
        this.monthData = []
      }
    },
    // 初始化2019与2020两个年份，fillNextCalendar填充2020和2021两个年份
    fillNextCalendar () {
      for (let i = this.nextYear; i <= this.nextYear + 1; i++) {
        this.yearArr.push(i) // 收集年份到yearArr数组
        this.curYear = i
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
        this.yearData.push(this.monthData)
        this.monthData = []
      }
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
        this.yearData.push(this.monthData)
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
          class: 'lastMonth'
        })
      }

      for (let i = 1; i <= curMonthdays; i++) {
        this.dayData.push({
          day: i,
          year: this.curYear,
          month: this.curMonth,
          isActive: false,
          class: 'curMonth'
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
            class: 'nextMonth'
          })
        }
      }
    },
    // 日期点击处理
    handleDayClick (day, dayIndex, monIndex, yearIndex) {
      this.yearData.forEach((cur, index) => {
        cur.forEach((cur, index) => {
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
      this.yearData[yearIndex][monIndex].dayData.forEach((cur, index) => {
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
      this.$refs.scrollList.scrollTo(0, sum)
    },
    // 处理滚动
    handleScroll (e) {
      // 滚动事件触发下拉事件
      console.log(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight) // 值为0即滚动到底部，可触发下来事件
      if (e.target.scrollTop === 0) {
        this.fillLastCalendar() // e.g. 生成2018与2019年数据（2018-2019-2019-2020）
        this.$nextTick(() => {
          const distance = this.$refs.yearItem[0].offsetHeight
          this.$refs.scrollList.scrollTo(0, distance)
        })
        // this.$nextTick(() => {
        //   const dom = this.$refs.yearItem
        //   const vDom = dom[1]
        //   vDom.scrollIntoView(true)
        //   vDom.scrollIntoView({ block: 'end', behavior: 'smooth' })
        // })
        setTimeout(() => {
          this.yearArr.splice(1, 1)
          this.yearData.splice(1, 1)
        }, 200)
        this.lastYear = this.lastYear - 1
        console.log('现在是滚动到顶部top')
      }
      if ((e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight) <= 0) {
        this.fillNextCalendar()
        this.$nextTick(() => {
          this.yearArr.splice(-2, 1)
          this.yearData.splice(-2, 1)
        }, 200)
        this.nextYear = this.nextYear + 1
        console.log('已经滚动到底部bottom')
      }
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
    .titel {
      position: absolute;
      top: 20px;
      left: 10%;
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
}
// 浮动区域
.container {
    position: relative;
    margin-top: 120px;
    @include font_size($font_small);
    border: .8px solid rgba(0, 0, 0, .4);
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
    .dayPanel {
        position: relative;
        overflow: hidden;
        overflow-y: scroll;
        height: 90vh;
        .monthName {
            padding: 10px;
            margin-bottom: 20px;
            margin-top: 20px;
            font-weight: bold;
            border-bottom: .8px solid rgba(0, 0, 0, .4);
            @include font_size($font_large);
            text-align: left;
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
            &:hover::after {
                background-color: #dedede;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
