const path = require('path');

module.exports = {
  entry: './src/cli.js',
  target: 'node',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'cli.js',
    libraryTarget: "commonjs2",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },

  node: {
    __filename: true,
    __dirname: true
  }
};
