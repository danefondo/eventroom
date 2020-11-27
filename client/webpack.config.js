

module.exports = {
  module: {
    rules: [
      // this will apply to both plain `.scss` files
      // AND `<style lang="scss">` blocks in `.vue` files
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
}


// const path = require('path');

// resolve: {
//     extensions: ['.js', '.vue', '.json'],
//     alias: {
//       '@': path.resolve('src')
//     }
// }