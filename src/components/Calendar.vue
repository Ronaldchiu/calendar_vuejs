<template>
  <div class="calendar">
    <!-- 标题 -->
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
        <div class="dayPanel" ref="scrollList" @scroll.passive="handleScroll" @touchstart="touchstart" @touchmove="touchmove">
          <div class="daySeciton">
            <div v-for="(year, yearIndex) in yearData" :key="year.curYear" ref="yearItem">
              <div v-for="(month, monIndex) in year.monthData" :key="month.month" ref="monItem">
                <div :class="year.curYear === selectYear && month.month === selectMonth ? 'thisMonth': 'monthName'" :style="{ marginLeft: month.lastWidth + 'px'}">
                  {{month.month}}月
                </div>
                <ul v-for="(day, dayIndex) in month.dayData" :key="day.date"
                    :class="[day.class,
                    day.isActive ? 'active' : '',
                    day.day === selectToday && day.year === selectYear & day.class === 'curMonth' && day.month === selectMonth ? 'today' : '']"
                    @click="handleDayClick(day, dayIndex, monIndex, yearIndex)"
                  >
                  <li ref="dayItem">
                     <!-- 显示公历日 -->
                     <div class="date">{{day.day}}</div>
                     <!-- 判断是否为公历节日 -->
                     <div v-if="day.festival != undefined" class="lunar" style="color: #ff6300">{{day.festival}}</div>
                     <!-- 判断是否为农历节日 -->
                     <div v-else-if="day.lunarFestival != undefined" class="lunar" style="color: #ff6300">{{day.lunarFestival}}</div>
                     <!-- 判断是否为二十四节气 -->
                     <div v-else-if="day.term != null" class="lunar" style="color: #7180AC">{{day.term}}</div>
                     <!-- 都不是就显示农历日 -->
                     <div v-else class="lunar">{{day.lunarDay}}</div>
                  </li>
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
import calendar from './calendar'
export default {
  name: 'Calendar',
  data () {
    return {
      weekList: ['日', '一', '二', '三', '四', '五', '六'], // 星期数组
      curYear: 0, // 当前年份
      curMonth: 0,
      selectToday: new Date().getDate(), // 选择日
      selectYear: new Date().getFullYear(), // 选择年份
      selectMonth: new Date().getMonth() + 1, // 选择月份
      dayData: [], // 日数据数组
      monthData: [], // 月数据数组
      yearData: [], // 年数据数组
      yearArr: [], // 年份数组
      scrollMonth: 0, // 浮动月份
      scrollYear: 0, // 浮动年份
      dayWidth: 124,
      scrollTop: 0, // 可视区域上方滚动值
      oldscrollTop: 0, // 上一次的scrollTop值
      dispaly: true, // 浮动显示阀门
      displayWeek: '', // 标题周显示
      displayMonth: '', // 标题月显示
      displayDay: '', // 标题日显示
      displayYear: '', // 标题年显示
      isShow: false, // 标题显示阀门
      lastYear: new Date().getFullYear() - 1, // 上一年
      nextYear: new Date().getFullYear(), // 下一年
      startY: 0,
      moveY: 0,
      festival: { // 公历节日
        '1-1': '元旦',
        '3-8': '妇女节',
        '3-12': '植树节',
        '5-1': '劳动节',
        '5-4': '青年节',
        '6-1': '儿童节',
        '7-1': '建党节',
        '8-1': '建军节',
        '9-10': '教师节',
        '10-1': '国庆节'
      },
      lunarFestival: { // 农历节日
        '腊月-三十': '除夕',
        '正月-初一': '春节',
        '正月-十五': '元宵节',
        '四月-初四': '清明节',
        '五月-初五': '端午节',
        '八月-十五': '中秋节',
        '九月-初九': '重阳节'
      }
    }
  },
  mounted () {
    this.createCalendar() // 生成日历（初始生成当前连续的三个年份）
    this.$nextTick(() => {
      this.dayWidth = this.$refs.dayItem[0].offsetWidth // 每个日期的div宽度（用于实现月份与当月第一天纵对齐）
      this.initScroll() // 日历初始显示位置（滚动到当前月份）
    })
  },
  watch: {
    // 监听滚动
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
      // 接近顶部时触发
      if (newVal < 6000) {
        // this.throttle(this.fillLastCalendar, 1000)()
        this.fillLastCalendar()
        console.log('滚动到顶部')
      }
      // 接近底部时触发
      if (((this.$refs.scrollList.scrollHeight - this.$refs.scrollList.clientHeight) - newVal) < 800) {
        this.fillNextCalendar()
        console.log('滚动到底部')
      }
    }
  },
  // 创建日历
  methods: {
    touchstart (e) {
      this.startY = e.touches[0].clientY
    },
    touchmove (e) {
      this.moveY = e.touches[0].clientY
      if (this.startY - this.moveY <= 0) {
        if (this.scrollTop < 6000) {
          this.fillLastCalendar()
          console.log('滚动接近顶部')
        }
        console.log('上滑')
      }
      if (this.startY - this.moveY > 0) {
        if (((this.$refs.scrollList.scrollHeight - this.$refs.scrollList.clientHeight) - this.scrollTop) < 800) {
          this.fillNextCalendar()
          console.log('滚动接近底部')
        }
        console.log('下滑')
      }
    },
    throttle (fn, delay) { // 节流函数
      var timer = null
      return function () {
        var context = this
        var args = arguments
        if (!timer) {
          timer = setTimeout(function () {
            fn.apply(context, args)
            timer = null
          }, delay)
        }
      }
    },
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
          month: j
        })
      }
      this.yearData.unshift({ monthData: this.monthData, curYear: this.curYear })
      this.$nextTick(() => {
        const elment = this.$refs.yearItem[0]
        elment.scrollIntoView()
        elment.scrollIntoView({ behavior: 'smooth', inline: 'nearest' })
      })
      this.yearData.pop()
      this.monthData = []
      this.lastYear--
    },
    // 向下补充数据
    fillNextCalendar () {
      const len = this.yearArr.length
      const fillYear = this.yearArr[len - 1] + 1
      this.yearArr.push(fillYear) // 收集年份到yearArr数组
      // this.yearArr.shift()
      this.curYear = fillYear
      for (let j = 1; j <= 12; j++) { // 月
        this.createCurMonth(j)
        const arr = this.dayData.filter((item) => {
          return item.class === 'lastMonth'
        })
        this.monthData.push({
          dayData: this.dayData,
          lastWidth: arr.length * this.dayWidth,
          month: j
        })
      }
      this.yearData.push({ monthData: this.monthData, curYear: this.curYear })
      this.monthData = []
      this.nextYear++
    },
    // 创建日历初始日期（startYear到endYear的三个年份数据）
    createCalendar () {
      // 输入起始年月
      const startYear = this.lastYear
      const endYear = startYear + 1
      for (let i = startYear; i <= endYear; i++) { // 年
        this.curYear = i
        this.yearArr.push(i) // 收集年份到yearArr数组
        for (let j = 1; j <= 12; j++) { // 1-12个月数据
          this.createCurMonth(j)
          const arr = this.dayData.filter((item) => {
            return item.class === 'lastMonth'
          })
          this.monthData.push({
            dayData: this.dayData,
            lastWidth: arr.length * this.dayWidth,
            month: j
          })
        }
        this.yearData.push({ monthData: this.monthData, curYear: this.curYear })
        this.monthData = []
      }
    },
    // 创建月数据
    createCurMonth (month) {
      this.curMonth = month // 从1月开始
      this.createCurDate()
    },
    // 创建日期数据
    createCurDate () {
      const curMonthdays = new Date(this.curYear, this.curMonth, 0).getDate() // 获取当月的天数
      const lastMonthdays = new Date(this.curYear, this.curMonth - 1, 0).getDate() // 获取上个月天数
      const firstDay = new Date(this.curYear, this.curMonth - 1, 1).getDay() // 当月第一天的星期数
      this.dayData = []
      // 得到本月数据中首行开头的上个月份日期
      for (let i = lastMonthdays - firstDay + 1; i <= lastMonthdays; i++) {
        let month = this.curMonth - 1
        let year = this.curYear
        if (month === 0) {
          month = 12
          year = this.curYear - 1
        }
        const dateStr = month + '-' + i
        const lunarDates = calendar.solar2lunar(year, month, i)
        const lunarDateStr = lunarDates.IMonthCn + '-' + lunarDates.IDayCn
        this.dayData.push({
          day: i, // 日
          month: month, // 月
          year: year, // 年
          term: lunarDates.Term, // 节气
          lunarDay: lunarDates.IDayCn, // 农历日
          lunarMonth: lunarDates.IMonthCn, // 农历月
          festival: this.festival[dateStr], // 公历假日
          lunarFestival: this.lunarFestival[lunarDateStr], // 农历假日
          isActive: false,
          class: 'lastMonth', // 月份类-上月
          date: year + '-' + month + '-' + i, // key
          Animal: lunarDates.Animal, // 生肖
          astro: lunarDates.astro, // 星座
          gzDay: lunarDates.gzDay, // 天干地支-日
          gzMonth: lunarDates.gzMonth, // 天干地支-月
          gzYear: lunarDates.gzYear // 天干地支-年
        })
      }
      // 得到本月数据
      for (let i = 1; i <= curMonthdays; i++) {
        const month = this.curMonth
        const year = this.curYear
        const dateStr = month + '-' + i
        const lunarDates = calendar.solar2lunar(year, month, i)
        const lunarDateStr = lunarDates.IMonthCn + '-' + lunarDates.IDayCn
        this.dayData.push({
          day: i, // 日
          month: month, // 月
          year: year, // 年
          term: lunarDates.Term, // 节气
          lunarDay: lunarDates.IDayCn, // 农历日
          lunarMonth: lunarDates.IMonthCn, // 农历月
          festival: this.festival[dateStr], // 公历假日
          lunarFestival: this.lunarFestival[lunarDateStr], // 农历假日
          isActive: false,
          class: 'curMonth', // 月份类-当月
          date: year + '-' + month + '-' + i, // key
          Animal: lunarDates.Animal, // 生肖
          astro: lunarDates.astro, // 星座
          gzDay: lunarDates.gzDay, // 天干地支-日
          gzMonth: lunarDates.gzMonth, // 天干地支-月
          gzYear: lunarDates.gzYear // 天干地支-年
        })
      }
      // 得到本月数据末行的下个月份日期
      const nextDays = 7 - this.dayData.length % 7
      if (nextDays < 7 && nextDays > 0) {
        let day = 1
        const month = this.curMonth + 1
        const year = this.curYear
        for (let i = 0; i < nextDays; i++) {
          const dateStr = month + '-' + day
          const lunarDates = calendar.solar2lunar(year, month, day)
          const lunarDateStr = lunarDates.IMonthCn + '-' + lunarDates.IDayCn
          this.dayData.push({
            date: year + '-' + month + '-' + day,
            day: day++, // 日
            month: month, // 月
            year: year, // 年
            term: lunarDates.Term, // 节气
            lunarDay: lunarDates.IDayCn, // 农历日
            lunarMonth: lunarDates.IMonthCn, // 农历月
            festival: this.festival[dateStr], // 公历假日
            lunarFestival: this.lunarFestival[lunarDateStr], // 农历假日
            isActive: false,
            class: 'nextMonth',
            Animal: lunarDates.Animal, // 生肖
            astro: lunarDates.astro, // 星座
            gzDay: lunarDates.gzDay, // 天干地支-日
            gzMonth: lunarDates.gzMonth, // 天干地支-月
            gzYear: lunarDates.gzYear // 天干地支-年
          })
        }
      }
    },
    // 日期点击处理
    handleDayClick (day, dayIndex, monIndex, yearIndex) {
      console.log(day)
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

* { -webkit-overflow-scrolling: touch; }
.calendar {
  margin: 0 auto;
  margin-top: 50px;
    .title {
      position: absolute;
      top: 20px;
      left: 0;
      right: 0;
      margin: 0 auto;
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
          -webkit-overflow-scrolling:touch;
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
            text-align: center;
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
                height: 100px;
                line-height: 50px;
                .date {
                  font-weight: bold;
                  @include font_size($font_medium);
                }
                .lunar {
                  font-size: 18px;
                }
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
