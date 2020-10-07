module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 100, // 根元素字体大小
      // propList: ['width', 'height']
      propList: ['*'] // 所有的属性值都能实现px转rem，若想某个属性值不被转换，px单位可写成Px
    }
  }
}
