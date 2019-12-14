const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const appConfig = {
  entry: {
    'app': "./bootstrap.js",
    'mode-ttk91': "./src/ace.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/ttk91web/",
    filename: "[name].js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              prependData: '@import "@/globals.scss";',
            },
          }
        ],
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.worker\.js$/,
        use: [
          { loader: 'worker-loader' },
          { loader: 'babel-loader' },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(svg|png|jpe?g)$/,
        loader: 'url-loader',
        options: {
          esModule: false,
        },
      },
    ],
  },
  resolve: {
    extensions: ['*','.js','.vue','.json'],
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  plugins: [
    new CopyWebpackPlugin(['index.html']),
    new VueLoaderPlugin(),
  ],
};

const workerConfig = {
  entry: './src/worker.js',
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/ttk91web/",
    filename: "worker.js",
  },
  target: 'webworker',
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['*','.js','.json','*.wasm'],
    alias: {
      'ttk91': '@dogamak/ttk91-wasm',
      '@': path.join(__dirname, 'src'),
    },
  },
  /*plugins: [
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, '../ttk91'),
    }),
  ],*/
};

module.exports = [ appConfig, workerConfig ];
