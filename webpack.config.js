const copyPlugin = require("copy-webpack-plugin");
module.exports = {
  entry: {
    "js/script.js": "./src/js/main.js",
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name]",
  },
  resolve: { extensions: [".js"] },
  plugins: [
    new copyPlugin({
      patterns: [
        { from: "html", context: "src" },
        { from: "assets", context: "src", to: "assets" },
      ],
    }),
  ],
};
