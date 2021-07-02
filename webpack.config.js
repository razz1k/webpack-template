const HtmlWebpackPlugin = require("html-webpack-plugin"),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  path = require('path'),
  fs = require('fs'),
  glob = require('glob'),
  HTMLdir = './src/pages/';

// get array of pages
let pages = glob.sync(HTMLdir + "**/*.html");
pages.forEach((file, index, array) => {
  array[index] = file.replace(HTMLdir, '').replace('.html', '');
});

module.exports = (env) => {

  return {
    mode: env.production ? "production" : "development",

    entry: pages.reduce((config, page) => {
      config[page] = `${HTMLdir}${page}.js`;
      return config;
    }, {}),

    output: {
      filename: "[name].[contenthash].js",
      path: __dirname + "/dist",
      clean: true,
      publicPath: './dist/',
    },

    devServer: {
      contentBase: './dist/',
      port: 9000,
      hot: true,
    },
    devtool: 'inline-source-map',

    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },

    plugins: [].concat(
      pages.map(
        (page) =>
          new HtmlWebpackPlugin({
            template: `${HTMLdir}${page}.html`,
            filename: `${page}.html`,
            chunks: [page],
          })
      ),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
      }),
    ),

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: env.production
            ? [MiniCssExtractPlugin.loader, 'css-loader']
            : ["style-loader", 'css-loader']
        },
        {
          test: /\.s[ac]ss$/i,
          use: env.production
            ? [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            : ["style-loader", 'css-loader', 'sass-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[hash][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[hash][ext]'
          }
        },
        {
          test: /\.html$/i,
          loader: 'html-loader'
        },
      ],
    },
  };
};
