const HtmlWebpackPlugin = require("html-webpack-plugin"),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  path = require('path'),
  fs = require('fs'),
  glob = require('glob'),
  EntryPointDir = './src/pages/';

// get array of pages
let pages = glob.sync(EntryPointDir + "**/*.js");
pages.forEach((file, index, array) => {
  array[index] = file.replace(EntryPointDir, '').replace('.js', '');
});

module.exports = (env) => {

  return {
    mode: env.production ? "production" : "development",

    entry: pages.reduce((config, page) => {
      config.push(`${EntryPointDir}${page}.js`);
      return config;
    }, []),

    output: {
      filename: "bundle.[contenthash].js",
      path: __dirname + "/dist",
      clean: true,
    },

    devServer: {
      contentBase: './dist/',
      port: 9000,
      hot: true,
    },
    devtool: 'inline-source-map',

    plugins: [].concat(
      pages.map(
        (page) =>
          fs.existsSync(`${EntryPointDir}${page}.html`)
            ? new HtmlWebpackPlugin({
              template: `${EntryPointDir}${page}.html`,
              filename: `${page}.html`,
            })
            : new HtmlWebpackPlugin({
              filename: `${page}.html`,
            })
      ),
      new MiniCssExtractPlugin({
        filename: "bundle.[contenthash].css",
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
