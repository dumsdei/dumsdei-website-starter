const projectDomainName = 'starter.test';
const fs = require('fs');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const BrowserSyncPlugin = require( 'browser-sync-webpack-plugin' );
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const allSCSS = new ExtractTextPlugin('../css/[name].css');

try {
  if ( fs.existsSync( './webpack.config-local.js' ) ) {
    const localSettings = require( './webpack.config-local.js' );
    console.log( `Local webpack config file found, setting devURL to "${ localSettings.localProjectDomainName }"` );
    global.devURL = localSettings.localProjectDomainName;
  } else {
    console.log( `No local webpack config file found, setting devURL to ${ projectDomainName }` );
    global.devURL = projectDomainName;
  }
} catch (err) {
  console.error(err);
}

module.exports = {
  entry: {
    main: __dirname + '/src/js/main.js',
    home: __dirname + '/src/scss/home.scss'
  },
  output: {
    path: __dirname + '/dist/js',
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: allSCSS.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader', 'postcss-loader?parser=postcss-scss']
        })
      }
    ]
  },
  plugins: [
    allSCSS,
    new FixStyleOnlyEntriesPlugin(),
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: [ 'dist/css', 'dist/js' ]
    }),
    new BrowserSyncPlugin(
      {
        proxy: {
          target: devURL,
          ws: true
        },
        files: [{
          match: ['**/*.php', '**/*.html'],
          fn: function(event, file) {
            if (event === "change") {
              const bs = require('browser-sync').get('bs-webpack-plugin');
              bs.reload();
            }
          }
        },
        {
          match: ['**/*.css', '**/*.js'],
          fn: function(event, file) {
            if (event === "change") {
              const bs = require('browser-sync').get('bs-webpack-plugin');
              bs.stream();
            }
          }
        }],
        injectChanges: true,
        open: false,
        reload: false
      }
    )
  ]
}
