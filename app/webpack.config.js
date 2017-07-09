const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: path.join(__dirname, '/src/app.jsx'),
  output: {
    path: path.join(__dirname, '../server/public/js'),
    filename: 'app.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      },
      {
        test: /\.scss$/,        
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',

          use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('../css/style.css')
  ],
  watch: true
}
