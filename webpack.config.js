const path = require("path")

module.exports = {
  devtool: "eval-source-map",
  entry: [
    "babel-polyfill",
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
