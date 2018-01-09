const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const includePaths = [
  path.resolve(__dirname, './src/assets/scss'),
  path.resolve(__dirname, './node_modules/foundation-sites/scss'),
];

const extractStyles = new ExtractTextPlugin({
  filename: 'build.css',
  allChunks: true,
  disable: !isProduction,
});

const common = {
  entry: path.resolve(__dirname, './src/main.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            scss: extractStyles.extract({
              fallback: 'vue-style-loader',
              use: [
                'css-loader',
                { loader: 'sass-loader', options: { includePaths } },
              ],
            }),
            sass: extractStyles.extract({
              fallback: 'vue-style-loader',
              use: [
                'css-loader',
                { loader: 'sass-loader', options: { includePaths, indentedSyntax: true } },
              ],
            }),
          },
        },
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          'style-loader',
          'css-loader',
          { loader: 'sass-loader', options: { includePaths } },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
    ],
  },
  plugins: [
    extractStyles,
  ],
  resolve: {
    alias: {
      assets: path.join(__dirname, 'src', 'assets'),
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: 'warning',
  },
  devtool: false,
};

if (process.env.NODE_ENV === 'production') {
  module.exports = merge(common, {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
        },
      }),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          warnings: false,
        },
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
    ],
  });
} else {
  module.exports = merge(common, {
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ],
    performance: {
      hints: false,
    },
    devtool: 'cheap-module-inline-source-map',
  });
}
