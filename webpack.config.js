// To resolve root paths
const path = require('path')

// Plugins
const webpack = require('webpack')
const uglify = require('uglifyjs-webpack-plugin')
const extract = require('extract-text-webpack-plugin')
const manifest = require('webpack-manifest-plugin')
const clean = require('clean-webpack-plugin')
const glob = require('glob')
const html = require('html-webpack-plugin')
const copy = require('copy-webpack-plugin')
const ftp = require('webpack-ftp-upload-plugin')

// Environment 
const dev = process.env.NODE_ENV === "dev" // DEV | PROD
const upload = process.env.NODE_ENV === "upload" // PROD + Upload files to FTP

// Hash's length for file's versioning
const hash_length = 13

// Configuration for CSS files
// -> 'cssnano' (options)
// -> 'css-loader'
// -> 'postcss-loader'
let cssnano = { 
	discardComments: { 
		removeAll: true // Disabled 'comments'
	} 
}
let cssLoader = [{ 
	loader: 'css-loader', 
	options: {
		minimize: dev ? false : cssnano // Minimize CSS only in PROD
	}
},
{ 
	loader: 'postcss-loader', 
	options: {
		// Add Plugins to PostCSS
		plugins: (loader) => [

			// Plugin 'autoprefixer'
			require('autoprefixer')({
				browsers: ['last 2 versions', 'ie > 8'] // Browsers compatibility
			})

		]
	}
}]

// Configuration Webpack
let config = {

	// Entry files
	entry: {
		app: [
			'./src/assets/css/scss/app.scss',
			'./src/assets/js/coffee/app.coffee'
		]
	},

	// Watching
	watch: false, // Disabled because i want only this activate from npm's scripts

	// Output files
	output: {
		path: path.resolve('./dist'),
		filename: dev ? 'js/[name].js' : 'js/[name].min.[chunkhash:' + hash_length + '].js',
		publicPath: dev ? './' : '/'
	},

	// Alias defined
	resolve: {
		alias: {
			'@':       path.resolve('./src/assets'),
			'@css':    path.resolve('./src/assets/css'),
			'@font':   path.resolve('./src/assets/font'),
			'@images': path.resolve('./src/assets/images'),
			'@js': 	   path.resolve('./src/assets/js')
		}
	},

	// Configuration to 'extract-text-webpack-plugin'
	devtool: dev ? "cheap-module-eval-source-map" : "source-map",

	// Configuration to 'webpack-dev-server'
	devServer: {
		contentBase: path.resolve('./dist'), // Root directory
		overlay: true, // View error in browser
		open: true // Auto-open new tab in browser in root path
	},

	// Loaders
	module: {
		rules: [

			// JS files
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: [{ loader: 'babel-loader' }, { loader: 'eslint-loader' }]
			},

			// COFFEE files
			{
				test: /\.coffee$/,
				use: [{ loader: 'coffee-loader' }]
			},

			// EJS files
			{
				test: /\.ejs$/,
				use: [{ loader: 'ejs-loader' }]
			},

			// CSS files
			{
				test: /\.css$/,
				use: extract.extract({
	      			fallback: "style-loader",
	      			use: cssLoader
				})
			},

			// SASS files
			{
				test: /\.scss$/,
				use: extract.extract({
	      			fallback: 'style-loader',
	      			use: [...cssLoader, { loader: 'sass-loader' }]
				})
			},

			// DOCS files
			{
				test: /\.(docx?|xlsx?|csv|pdf|txt|log)$/, 
				use: [{ 
					loader: 'file-loader',
					options: {
						name: dev ? 'documents/[name].[ext]' : 'documents/[name].[hash:' + hash_length + '].[ext]'
					}
				}]
			},

			// FONT files
			{
				test: /\.(woff2?|eot|ttf|otf)$/, 
				use: [{ 
					loader: 'file-loader',
					options: {
						name: dev ? 'fonts/[name].[ext]' : 'fonts/[name].[hash:' + hash_length + '].[ext]'
					}
				}]
			},

			// IMG files
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/, 
				use: [{
					loader: 'url-loader', // 'url-loader' chained with 'file-loader'
					options: {
						name: dev ? 'images/[name].[ext]' : 'images/[name].[hash:' + hash_length + '].[ext]',
						limit: 8192 // Max size of files to convert to bytes 
					}
				},
				{
					loader: 'image-webpack-loader', // Images optimization
					options: {
						disable: dev // In PROD only
					}
				}]
			}

		]
	},

	// Add plugins
	plugins: [

		// jQuery conflict
		new webpack.ProvidePlugin({
        	jQuery: 'jquery',
        	$: 'jquery',
        	jquery: 'jquery'
    	}),

		// Plugin: 'clean-webpack-plugin'
		new clean(['dist'], { // Remove folder and this contents './dist'
			root: path.resolve('./'),
			verbose: true,
			dry: false // Disable 'test mode'
		}),

		// Plugin: 'extract-text-webpack-plugin'
		new extract({
			filename: dev ? 'css/[name].css' : 'css/[name].min.[contenthash:' + hash_length + '].css'
		}),

		// Plugin: 'copy-webpack-plugin'
		new copy([
			// Copy files
			{ from: './src/.htaccess',  to: path.resolve('./dist') },
			{ from: './src/robots.txt', to: path.resolve('./dist') },
			{ from: './src/index.php', 	to: path.resolve('./dist') },
			{ from: './src/config', 	to: path.resolve('./dist/config') }
		], { 
			debug: true // View error
		})

	]

}

// Converting files EJS to HTML
let files = glob.sync(process.cwd() + '/src/templates/*.ejs')
files.forEach( file => {

	// Add plugins
	config.plugins.push(

		// Plugin: 'html-webpack-plugin'
		new html({
			filename: 'templates/' + path.basename(file).replace('.ejs','.html'),
			template: file
		})

	)

})

// Specific Webpack configuration in PROD
if( !dev ){

	// Add plugins
	config.plugins.push(

		// Plugin: 'uglifyjs-webpack-plugin'
		new uglify({
			sourceMap: true, // Enabled 'sourcemap'
			uglifyOptions: {
				output: {
					comments: false // Disabled 'comments'
				}
			}
		}),

		// Plugin: 'webpack-manifest-plugin'
		new manifest()

	)

}

// Specific Webpack configuration in PROD
if( upload ){

	// Add plugins
	config.plugins.push(

		// Plugin: 'webpack-ftp-upload-plugin'
		new ftp({
		    host: '',
		    port: '',
		    username: '',
		    password: '',
		    local: './dist/',
		    path: '' // Ex: OVH => /home/___/www/
		})

	)

}

// Publishing Webpack configuration
module.exports = config