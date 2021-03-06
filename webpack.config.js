const HtmlWebpackPlugin = require("html-webpack-plugin"),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  ImageMinimizerPlugin = require("image-minimizer-webpack-plugin"),
  CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
  { extendDefaultPlugins } = require('svgo'),
  fs = require('fs'),
  glob = require('glob'),
  EntryPointDir = './src/pages/';

// get array of pages
let pages = glob.sync(EntryPointDir + "**/*.js");
pages.forEach((file, index, array) => {
  array[index] = file.replace(EntryPointDir, '').replace('.js', '');
});

module.exports = (env) => {
  process.env.NODE_ENV = env.production ? "production" : "development";

  return {
    mode: env.production ? "production" : "development",

    entry: pages.reduce((config, page) => {
      config.push(`${EntryPointDir}${page}.js`);
      return config;
    }, []),

    output: {
      filename:
        env.production
          ? "bundle.[contenthash].js"
          : "bundle.js",
      path: __dirname + "/dist",
      clean: true,
    },

    devServer: {
      contentBase: './dist/',
      port: 9000,
      hot: true,
    },
    target: 'web',
    devtool: 'inline-source-map',
    optimization: {
      minimizer: [
        new CssMinimizerPlugin(),
      ],
    },

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
        filename:
          env.production
            ? "bundle.[contenthash].css"
            : "bundle.css",
      })
    ),

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            env.production
              ? MiniCssExtractPlugin.loader
              : "style-loader",

            'css-loader'
          ]
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            env.production
              ? MiniCssExtractPlugin.loader
              : "style-loader",

            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          use: [
            {
              loader: ImageMinimizerPlugin.loader,
              options: {
                severityError: "warning", // Ignore errors on corrupted images
                minimizerOptions: {
                  plugins: [
                    ["gifsicle", { interlaced: true }],
                    ["imagemin-mozjpeg"],
                    ["imagemin-pngquant"],
                    ["svgo",
                      {
                        plugins: extendDefaultPlugins([
                          {
                            name: "removeViewBox",
                            active: false,
                          },
                          {
                            name: "addAttributesToSVGElement",
                            params: {
                              attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                            },
                          },
                        ]),
                      },
                    ],
                  ]
                }
              },
            },
          ],
          generator: {
            filename:
              env.production
                ? 'assets/[name].[hash][ext]'
                : 'assets/[name][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename:
              env.production
                ? 'assets/[name].[hash][ext]'
                : 'assets/[name][ext]'
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
