const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name]_[hash:6].css',
    }),
  ],
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserWebpackPlugin()],
  },
}
