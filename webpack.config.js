const path = require("path")
const webpack = require("webpack")
const CompressionPlugin = require("compression-webpack-plugin")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const env = process.env.NODE_ENV
const prodBuild = env === 'production'

module.exports = {
  devtool: !prodBuild ? "eval-source-map" : "",
  entry: [
    path.resolve("src", "index.js"),
  ],
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "index.js",
    library: "arbor",
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$/,
      threshold: 0,
      minRatio: 0.8,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js|\.jsx$/,
        exclude: /node_modules/,
        use: [{ loader: "babel-loader" }],
      },
    ]
  }
}
