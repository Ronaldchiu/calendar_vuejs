<template>
  <div class="calendar">
    <h4>当前选择的日期为：{{ selectYear }}年{{ selectMonth }}月{{ selectDay }}日 星期{{ selectWeek }}</h4>
     <div class="container">
        <!-- 年月日选择框 -->
        <div class="select">
            <i class="iconfont icon-arrow-left"  @click="arrowChangeMonth(0)" v-if="!showMonth" :class="{disabled: this.showYear && this.currentCutYearsIndex === 0}"></i>
            <div class="select_wrapper year">
                <div class="select_result" @click="handleSelectYear"> {{ selectYear }}年</div>
            </div>
            <div class="select_wrapper month">
                <div class="select_result"  @click="showSelectPanel = true; showMonth = true; showYear = false">{{ selectMonth }}月</div>
            </div>
            <i class="iconfont icon-arrow-right" @click="arrowChangeMonth(1)" v-if="!showMonth" :class="{disabled: this.showYear && this.currentCutYearsIndex === this.cutYears.length - 1}"></i>
        </div>
        <!-- 选择年/月面板 -->
        <div class="select-panel" v-show="showSelectPanel">
          <ul class="year" v-if="showYear">
            <li v-for="item of displayYears" :key="item" @click="changeYear(item)"> {{ item }} </li>
          </ul>
          <ul class="month" v-else>
            <li v-for="item of 12" :key="item" @click="changeMonth(item)"> {{ item }} </li>
          </ul>
        </div>
        <!-- 日历面板 -->
        <dl v-show="!showSelectPanel">
          <dt>
            <ol class="weekName">
              <li v-for="item in weekList" :key="item">{{ item }}</li>
            </ol>
          </dt>
          <dd
              v-for="(day, index) in dates"
              :key="index"
              :class="[
                day.class,
                day.isActive ? 'active' : '',
                day.day === today && day.year === year && day.month === month && day.class === 'current-month' ? 'today' : ''
              ]"
              @click="handleDayClick(day, index)"
          >
            <div>{{ day.day}}</div>
          </dd>
        </dl>
     </div>
  </div>
</template>

<script>
export default {
  name: 'Calendar',
  data () {
    return {
      weekList: ['日', '一', '二', '三', '四', '五', '六'], // 星期数组
      monthList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 月份数组
      yearList: [], // 年份数组
      dates: [], // 日期数组
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      today: new Date().getDate(),
      showSelectPanel: false, // 显示年月
      showMonth: false, // 显示月份选择
      showYear: false, // 显示年份选择
      selectYear: new Date().getFullYear(), // 选择的年
      selectMonth: new Date().getMonth() + 1, // 选择的月,月份是从0开始的，0表示1月份，因此需要+1
      selectDay: new Date().getDate(), // 选择的日
      selectWeek: '',
      cutYears: [], // 分组后的年份数组
      currentCutYearsIndex: 0
    }
  },
  mounted () {
    this.createYear()
  },
  created () {
    this.createCalendar()
    const todayIndex = this.dates.findIndex(function (value) {
      return value.day === new Date().getDate()
    })
    this.selectWeek = this.weekList[todayIndex % 7]
  },
  computed: {
    // 显示年份数组
    displayYears () {
      return this.cutYears[this.currentCutYearsIndex]
    }
  },
  methods: {
    // 创建年份函数
    createYear () {
      const arr = []
      const curYear = new Date().getFullYear()
      for (let i = 1900; i <= curYear; i++) {
        arr.push(i)
      }
      this.yearList = arr
      this.selectYear = curYear

      // 分组年份数组
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
        for (let i = lastMonthdays - firstDay; i <= lastMonthdays; i++) {
          this.dates.push({
            day: i,
            year: this.selectYear,
            month: this.selectMonth - 1,
            class: 'last-month',
            isActive: false
          })
        }
      }
      // 3-2. 当月的日期
      for (let i = 1; i <= curMonthdays; i++) {
        this.dates.push({
          day: i,
          year: this.selectYear,
          month: this.selectMonth,
          class: 'current-month',
          isActive: false
        })
      }
      // 3-3. 最后填充下个月的天数
      const nextDays = 7 - this.dates.length % 7
      if (nextDays < 7 && nextDays > 0) {
        let day = 0
        for (let i = 0; i < nextDays; i++) {
          this.dates.push({
            day: ++day,
            year: this.selectYear,
            month: this.selectMonth + 1,
            class: 'next-month',
            isActive: false
          })
        }
      }
    },
    // 日期点击事件
    handleDayClick (day, index) {
      this.selectWeek = this.weekList[index % 7]
      if (day.class !== 'current-month') return
      this.dates.forEach((cur, index2) => {
        if (index === index2) {
          cur.isActive = true
        } else {
          cur.isActive = false
        }
      })
      this.selectDay = day.day
    },

    // 改变年份
    changeYear (year) {
      this.selectYear = year
      this.showYear = false
      this.createCalendar()
    },
    // 改变月份
    changeMonth (month) {
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
          this.changeMonth(12)
        } else {
          this.changeMonth(this.selectMonth - 1)
        }
      } else {
        if (this.selectMonth === 12) {
          this.selectYear++
          this.changeMonth(1)
        } else {
          this.changeMonth(this.selectMonth + 1)
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
.container {
    padding: 20px;
    box-shadow: 0 0 3px rgba(0, 0, 0, .2);
    width: fit-content;
    margin: 30px auto 0;
    @include font_size($font_small)
}
.select {
    display: flex;
    align-items: center;
    justify-content: center;
    i {
        width:10px;
        height:10px;
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
        margin-right: auto;
    }
    .icon-arrow-right {
        margin-left: auto;
    }
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
    width: 280px;
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
  width: 280px;
  dd {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    cursor: pointer;
    &.last-month,
    &.next-month {
        color: #bbbbbb;
    }
    &::after {
        content: "";
        display: block;
        position: absolute;
        z-index: -1;
        top: 50%;
        left: 50%;
        width: 80%;
        height: 80%;
        margin: -40% 0 0 -40%;
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
    display: flex;
    li {
      width: 40px;
      height: 40px;
      text-align: center;
      line-height: 40px;
    }
}
</style>
