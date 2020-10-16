<template>
  <div class="calendar">
    <h4>{{ selectYear }}年{{ selectMonth }}月{{ selectDay }}日 星期{{ selectWeek }} 农历{{selectLunarMonth}}{{selectLunarDay}}</h4>
     <div class="container">
        <!-- 年月日选择框 -->
        <div class="select" @click="arrowChangeMonth(0)" v-if="!showMonth" :class="{disabled: this.showYear && this.currentCutYearsIndex === 0}" >
            <i class="iconfont icon-arrow-left"></i>
            <div class="select_wrapper year">
                <div class="select_result" @click="handleSelectYear"> {{ selectYear }}年</div>
            </div>
            <div class="select_wrapper" v-if="display"  >
                <div class = "topbar"> {{ selectYear }}年 {{ curmon }}月</div>
            </div>
            <!-- <i class="iconfont icon-arrow-right" @click="arrowChangeMonth(1)" v-if="!showMonth" :class="{disabled: this.showYear && this.currentCutYearsIndex === this.cutYears.length - 1}"></i> -->
        </div>
        <!-- 选择年/月面板 -->
        <div class="select-panel" v-show="showSelectPanel">
          <ul class="year" v-if="showYear">
            <li v-for="item of displayYears" :key="item" @click="changeYear(item)"> {{ item }} </li>
          </ul>
          <ul class="month" v-else>
            <li v-for="item of 12" :key="item" @click="displayMonth(item)"> {{ item }} </li>
          </ul>
        </div>
        <!-- 日历面板 -->
        <dl v-show="!showSelectPanel">
          <dt>
            <ol class="weekName">
              <li v-for="item in weekList" :key="item">{{ item }}</li>
            </ol>
          </dt>
          <div class="dayPanel" ref="bscroll" >
            <div class = "wrapper">
                <div
                  v-for="(month, monIndex) in date"
                  :key="monIndex"
                  class="scrollItem"
                  ref="monItem"
                >
                    <div class="monthName">{{ monIndex%12 + 1 }}月</div>
                    <dd
                        v-for="(day, dayIndex) in month"
                        :key="dayIndex"
                        :class="[
                          day.class,
                          day.isActive ? 'active' : '',
                          day.day === today && day.year === year && day.month === month && day.class === 'current-month' ? 'today' : ''
                        ]"
                        @click="handleDayClick(day, dayIndex, monIndex)"
                    >
                      <!-- 显示公历日 -->
                      <div class="calendar_day">{{ day.day}}</div>
                      <!-- 判断是否为公历节日 -->
                      <span v-if="day.festival != undefined" style="color: #ff6300">{{day.festival}}</span>
                      <!-- 判断是否为农历节日 -->
                      <span v-else-if="day.lunarFestival != undefined" style="color: #ff6300">{{day.lunarFestival}}</span>
                      <!-- 判断是否为二十四节气 -->
                      <span v-else-if="day.term != null" style="color: #7180AC">{{day.term}}</span>
                      <!-- 都不是就显示农历日 -->
                      <span v-else>{{day.lunarDay}}</span>
                    </dd>
                </div>
            </div>
          </div>
        </dl>
     </div>
     <!-- <div class="curMonth_Btn" @click="backToday">返回本月</div>
     <div class="today_info" @click="showTodayInfo = !showTodayInfo;" >今天 {{month}}月 {{today}}日 星期{{this.week}}</div>
     <div v-show="showTodayInfo" class="todayPannel">
     </div> -->
  </div>
</template>

<script>
import calendar from './calendar'
import BScroll from 'better-scroll'
export default {
  name: 'Calendar',
  data () {
    return {
      weekList: ['日', '一', '二', '三', '四', '五', '六'], // 星期数组
      monthList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 月份数组
      yearList: [], // 年份数组
      dates: [], // 日期数组
      week: '',
      month: new Date().getMonth() + 1, // 当日所在月份
      year: new Date().getFullYear(), // 当日所在年份
      today: new Date().getDate(), // 当日
      showSelectPanel: false, // 显示年月选择面板
      showTodayInfo: false, // 显示今日
      showMonth: false, // 显示月份选择
      showYear: false, // 显示年份选择
      selectYear: new Date().getFullYear(), // 选择的年
      selectMonth: new Date().getMonth() + 1, // 选择的月,月份是从0开始的，0表示1月份，因此需要+1
      selectDay: new Date().getDate(), // 选择的日
      selectWeek: '',
      cutYears: [], // 分割后的年份数组
      currentCutYearsIndex: 0, // 某年在分割年份数组中的索引
      selectLunarMonth: '', // 选择的农历月
      selectLunarDay: '', // 选择的农历日
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
        '九月-初九': '重阳节'
      },
      date: [],
      scrollY: 0,
      display: false,
      curyear: 2020,
      curmon: 10
    }
  },
  mounted () {
    this.createYear()
    this.createCalendar()
    for (let i = 1; i <= 12; i++) {
      this.displayMonth(i)
      this.date.push(this.dates)
    }
    this.selectMonth = new Date().getMonth() + 1
    this.$nextTick(() => {
      this.initScroll()
    })
  },
  created () {
    this.createCalendar()
    const todayIndex = this.dates.findIndex(function (value) {
      return value.day === new Date().getDate()
    })
    this.selectWeek = this.weekList[todayIndex % 7] // 当天的星期
    this.week = this.weekList[todayIndex % 7]
    this.selectLunarMonth = this.dates[todayIndex].lunarMonth // 当天的农历月
    this.selectLunarDay = this.dates[todayIndex].lunarDay // 当天的农历日
  },
  watch: {
    scrollY (newValue, oldValue) {
      if (newValue > 7000) {
        oldValue = 10
        this.selectYear++
        this.createCalendar()
        for (let i = 1; i <= 12; i++) {
          this.displayMonth(i)
          this.date.push(this.dates)
        }
        this.bscroll.scrollToElement(this.$refs.monItem[1], 10, 0, true, 'easing')
      }
      if (newValue < 500) {
        this.selectYear--
        this.createCalendar()
        for (let i = 1; i <= 12; i++) {
          this.displayMonth(i)
          this.date.push(this.dates)
        }
        this.bscroll.scrollToElement(this.$refs.monItem[12], 50, 0, true, 'easing')
      }
      this.curmon = Math.abs(Math.ceil(newValue / (8000 / 12)))
    }
  },
  computed: {
    // 返回年份所在的分割数组（12个年份）
    displayYears () {
      return this.cutYears[this.currentCutYearsIndex]
    }
  },
  methods: {
    initScroll () {
      const bscroll = this.$refs.bscroll
      this.bscroll = new BScroll(bscroll, { // 用better-scroll依赖创建实例方法bscroll
        scrollY: true, // Y轴滚动
        probeType: 1,
        click: true
      })
      const element = this.$refs.monItem[new Date().getMonth()] // 拿到当前月份的div元素
      this.bscroll.scrollToElement(element, 300, 0, true, 'easing') // better-scroll实例有个scrollToElement方法滚动到element
      this.bscroll.on('scroll', (pos) => {
        this.scrollY = Math.abs(Math.round(pos.y))
        console.log(this.scrollY)
        this.display = true
      })
    },
    backToday () {
      this.selectYear = new Date().getFullYear()
      this.selectMonth = new Date().getMonth() + 1
      this.createCalendar()
    },
    // 创建年份函数
    createYear () {
      const arr = []
      const curYear = new Date().getFullYear()
      for (let i = 1900; i <= curYear; i++) {
        arr.push(i)
      }
      this.yearList = arr // 从1900开始的所有年份数组
      this.selectYear = curYear

      // 分割年份数组（以每12年为一个单位的二维数组）
      for (let i = 0; i < arr.length; i += 12) {
        this.cutYears.push(arr.slice(i, i + 12))
      }
    },
    // 创建日历
    createCalendar () {
      /***
       1. 表示获取当月的天数，例如Date().getMonth()得到9，则this.selectMonth为10，即此处Date的第二个参数即为10，但却表示11月份，
       所以将第三个参数设置为0表示上个月份（10月）的最后一天，getDate()取值为1～31
      ***/
      const curMonthdays = new Date(this.selectYear, this.selectMonth, 0).getDate()
      // 2. 表示获取当月第一天的星期
      const firstDay = new Date(this.selectYear, this.selectMonth - 1, 1).getDay()
      this.dates = []
      // 3. 填充日期数组，此时dates数组中有三种日期
      // 3-1. 若当月的第一天不是周日，则在第一天前补充上个月的日期
      if (firstDay > 0) {
        const lastMonthdays = new Date(this.selectYear, this.selectMonth - 1, 0).getDate() // 上个月总天数
        for (let i = lastMonthdays - firstDay + 1; i <= lastMonthdays; i++) {
          const dateStr = this.selectMonth - 1 + '-' + i
          const lunarDates = calendar.solar2lunar(this.selectYear, this.selectMonth - 1, i)
          const lunarDateStr = lunarDates.IMonthCn + '-' + lunarDates.IDayCn
          this.dates.push({
            day: i,
            term: lunarDates.Term, // 节气
            lunarDay: lunarDates.IDayCn, // 农历日
            lunarMonth: lunarDates.IMonthCn, // 农历月
            year: this.selectYear,
            month: this.selectMonth - 1,
            class: 'last-month',
            isActive: false,
            festival: this.festival[dateStr],
            lunarFestival: this.lunarFestival[lunarDateStr],
            Animal: lunarDates.Animal,
            astro: lunarDates.astro,
            gzDay: lunarDates.gzDay,
            gzMonth: lunarDates.gzMonth,
            gzYear: lunarDates.gzYear
          })
        }
      }
      // 3-2. 当月的日期
      for (let i = 1; i <= curMonthdays; i++) {
        const dateStr = this.selectMonth + '-' + i
        const lunarDates = calendar.solar2lunar(this.selectYear, this.selectMonth, i)
        const lunarDateStr = lunarDates.IMonthCn + '-' + lunarDates.IDayCn
        this.dates.push({
          day: i,
          term: lunarDates.Term,
          lunarDay: lunarDates.IDayCn,
          lunarMonth: lunarDates.IMonthCn,
          year: this.selectYear,
          month: this.selectMonth,
          class: 'current-month',
          isActive: false,
          festival: this.festival[dateStr],
          lunarFestival: this.lunarFestival[lunarDateStr],
          Animal: lunarDates.Animal,
          astro: lunarDates.astro,
          gzDay: lunarDates.gzDay,
          gzMonth: lunarDates.gzMonth,
          gzYear: lunarDates.gzYear
        })
      }
      // 3-3. 最后填充下个月的天数
      const nextDays = 7 - this.dates.length % 7
      if (nextDays < 7 && nextDays > 0) {
        let day = 0
        for (let i = 0; i < nextDays; i++) {
          const dateStr = this.selectMonth + 1 + '-' + (i + 1)
          const lunarDates = calendar.solar2lunar(this.selectYear, this.selectMonth + 1, i)
          const lunarDateStr = lunarDates.IMonthCn + '-' + lunarDates.IDayCn
          this.dates.push({
            day: ++day,
            term: lunarDates.Term,
            lunarDay: lunarDates.IDayCn,
            lunarMonth: lunarDates.IMonthCn,
            year: this.selectYear,
            month: this.selectMonth + 1,
            class: 'next-month',
            isActive: false,
            festival: this.festival[dateStr],
            lunarFestival: this.lunarFestival[lunarDateStr],
            Animal: lunarDates.Animal,
            astro: lunarDates.astro,
            gzDay: lunarDates.gzDay,
            gzMonth: lunarDates.gzMonth,
            gzYear: lunarDates.gzYear
          })
        }
      }
    },
    // 日期点击事件
    handleDayClick (day, dayIndex, monIndex) {
      this.selectWeek = this.weekList[dayIndex % 7] // 选中日期的星期
      if (day.class !== 'current-month') return // 非当月日期无法被选中
      for (let i = 0; i < this.date.length; i++) {
        for (let j = 0; j < this.date[i].length; j++) {
          this.date[i][j].isActive = false
        }
      }
      this.date[monIndex].forEach((cur, index) => {
        if (dayIndex === index) {
          cur.isActive = true // 日期被选中
        } else {
          cur.isActive = false
        }
      })
      console.log('day:')
      console.log(day)
      this.selectMonth = day.month // 选中日期的月
      this.selectDay = day.day // 选中日期的日
      this.selectLunarMonth = day.lunarMonth // 选中日期的农历月
      this.selectLunarDay = day.lunarDay // 选中日期的农历日
    },

    // 改变年份
    changeYear (year) {
      this.selectYear = year
      this.showYear = false
      this.createCalendar()
    },
    // 改变月份
    displayMonth (month) {
      this.selectMonth = month
      this.showSelectPanel = false
      this.showMonth = false
      this.createCalendar()
    },
    /**
   * 通过点击箭头切换月份
   * @param { number } method 0.上个月 1.下个月
   */
    arrowChangeMonth (method) {
      // 如果打开了选择年月面板，则切换年份
      if (this.showSelectPanel) {
        if ((method === 0 && this.currentCutYearsIndex === 0) || (method === 1 && this.currentCutYearsIndex === this.cutYears.length - 1)) return
        method === 0 ? this.currentCutYearsIndex-- : this.currentCutYearsIndex++
        return
      }
      if (method === 0) {
        if (this.selectMonth === 1) {
          this.selectYear--
          this.displayMonth(12)
        } else {
          this.displayMonth(this.selectMonth - 1)
        }
      } else {
        if (this.selectMonth === 12) {
          this.selectYear++
          this.displayMonth(1)
        } else {
          this.displayMonth(this.selectMonth + 1)
        }
      }
    },
    handleSelectYear () {
      this.currentCutYearsIndex = this.cutYears.findIndex(cur => cur.includes(this.selectYear))
      this.showSelectPanel = true
      this.showYear = true
      this.showMonth = false
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/variable";
@import "../assets/css/mixin";
h4 {
    margin: 30px auto 0;
    text-align: center;
    @include font_size($font_small)
}
.calendar {
  position: relative;
  margin: 0 auto;
  width: 500px;
  height:fit-content;
}
.container {
    padding: 20px;
    box-shadow: 0 0 3px rgba(0, 0, 0, .2);
    width: 500px;
    margin: 30px auto 0;
    @include font_size($font_small)
}
.select {
    display: flex;
    align-items: center;
    justify-content: left;
    margin-bottom: 20px;
    // @include font_size($font_medium_s)
    i {
        width:10px;
        height:10px;
        line-height:10px;
        cursor: pointer;
        &:active {
            color: deepskyblue;
        }
        &.disabled {
            cursor: not-allowed;
            color: #bbbbbb;
        }
    }

    .icon-arrow-left {
        margin-right: 30px;
    }
    // .icon-arrow-right {
    //     margin-left: auto;
    // }
}
.select_result {
    @include font_size($font_medium_s);
    font-weight: bold;
}
.select_wrapper {
    cursor: pointer;
    &:hover {
        color: #00bfff;
    }

    &.month {
        margin-left: 10px;
    }
}
.select-panel {
    width: 500px;
    height: 240px;
    ul {
      display: flex;
      flex-wrap: wrap;
      li {
        width: 25%;
        height:70px;
        line-height: 70px;
        text-align: center;
        cursor: pointer;
      }
    }
}
dl {
  width: 500px;
  dd {
    position: relative;
    display: inline-block;
    margin: 20px, 0, 10px, 0;
    width: 70px;
    height: 40px;
    text-align: center;
    cursor: pointer;
    &.last-month,
    &.next-month {
        color: #bbbbbb;
    }
    .calendar_day {
      font-weight: bold;
      @include font_size($font_medium)
    }
    &::after {
        content: "";
        display: block;
        position: absolute;
        z-index: -1;
        top: 132%;
        left: 48%;
        width: 93%;
        height: 160%;
        margin: -72% 0 0 -45%;
        border-radius: 50%;
        background-color: transparent;
    }
    &:hover::after {
        background-color: #dedede;
    }
    &.active {
        color: #fff;
        &::after {
            background-color: deepskyblue;
        }
        &.today {
            color: #fff;
        }
    }
    &.today {
        color: deepskyblue;
    }
  }
}
.weekName {
    width: 500px;
    display: flex;
    border-bottom: 0.5px solid rgba(0, 0, 0, .4);
    margin-bottom: 30px;
    li {
      width: 80px;
      height: 40px;
      text-align: center;
      line-height: 40px;
    }
}
.curMonth_Btn {
  position: absolute;
  left: 20px;
  bottom: -10%;
  width: 120px;
  height: 36px;
  @include font_size($font_small);
  line-height: 36px;
  border-radius: 25px;
  background-color: #dedede;
}
.curMonth_Btn:hover {
  color: #fff;
  background:#00bfff;
}
.today_info {
  position: absolute;
  left: 50%;
  bottom: -10%;
  width: fit-content;
  @include font_size($font_small);
}
.today_info:hover {
  cursor: pointer;
  color: #00bfff;
}
.todayPannel {
  position:absolute;
  left: 47%;
  bottom: -47%;
  width: 240px;
  height: 200px;
  box-shadow: 0 0 0.03rem rgba(0, 0, 0, 0.2);
}
.dayPanel {
  position: relative;
  height: 700px;
  overflow: hidden;
  overflow-y: scroll;
}
.monthName {
    font-weight: bold;
    @include font_size($font_large);
    text-align: left;
    padding: 10px;
    margin-bottom: 20px;
    margin-top: 20px;
    margin-left: 15px;
}
.topbar {
  margin-left: 80px;
  @include font_size($font_medium);
}
</style>
