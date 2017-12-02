const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/cli.js',
  target: 'node',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'cli.js',
    libraryTarget: "commonjs2",
  },

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      // Removing an unnecessary require from
      // https://github.com/ForbesLindesay/spawn-sync/blob/8ba6d1bd032917ff5f0cf68508b91bb628d16336/index.js#L3
      //
      // This require would cause warnings when building with Webpack, and it's
      // only required for Node <= 0.12.
      {
        test: /spawn-sync\/index\.js$/,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: ` || require('./lib/spawn-sync')`,
            replace: '',
            strict: true
          }
        }
      }
    ]
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  ],

  node: {
    __filename: true,
    __dirname: true
  }
};
