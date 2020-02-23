const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    head: "./src/head.js",
    body: "./src/index.js"
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.ejs",
      inject: false
    }),
    new MiniCssExtractPlugin({
      filename: "styles.[chunkhash:8].css"
    })
  ],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].[chunkhash:8].js"
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: [
          path.resolve(__dirname, "src/lib"),
          path.resolve(__dirname, "node_modules")
        ],
        use: {
          loader: "eslint-loader",
          options: {
            baseConfig: {
              env: {
                browser: true
              },
              extends: ["eslint:recommended"],
              globals: {
                Modernizr: "readonly"
              },
              parserOptions: {
                ecmaVersion: 2018,
                sourceType: "module"
              },
              rules: {
                "no-mixed-spaces-and-tabs": ["error", "smart-tabs"]
              }
            },
            failOnError: true
          }
        }
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/three")
        ],
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: ["last 2 versions"]
                  }
                }
              ]
            ],
            plugins: [
              "@babel/plugin-transform-classes",
              "babel-plugin-transform-remove-console"
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(ico|pdf)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]"
          }
        }
      }
    ]
  }
};
