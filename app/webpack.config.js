const path = require('path')

module.exports = {
  entry: path.join(__dirname, '/src/app.jsx'),
  output: {
    path: path.join(__dirname, '../server/public/js'),
    filename: 'app.js'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loaders: ['babel-loader']
    }]
  },
  watch: true
}
