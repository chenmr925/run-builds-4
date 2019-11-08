const fs = require('fs');
const path = require('path');
const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (isProd, cwd) => {
	// 是否使用postcss
	let lessLoaderArray = [{
    	loader: "less-loader",
    	options: {
    		javascriptEnabled: true
    	}
    }];
	let sassLoaderArray = [{
    	loader: 'sass-loader',
    	options: {
          	sourceMap: true
        }
    }];
    let postcssConfigFile = path.resolve(cwd, "./.postcssrc.js"),
    	postcssConfigFile1 = path.resolve(cwd, "./postcss.config.js"),
    	usePostcss = fs.existsSync(postcssConfigFile) || fs.existsSync(postcssConfigFile1);
	if(usePostcss){
		lessLoaderArray.unshift({
		  	loader: 'postcss-loader',
		  	options: {
		    	config: {
		      		path: cwd
		    	}
		  	}
		})
		sassLoaderArray.unshift({
		  	loader: 'postcss-loader',
		  	options: {
		    	config: {
		      		path: cwd
		    	}
		  	}
		})
	}
	// 是否使用TypeScript
	let typeScriptConfigFile = path.resolve(cwd, "./tsconfig.json"),
		useTypeScript = fs.existsSync(postcssConfigFile),
		rules = [];
	if(useTypeScript){
		rules.push({
			test: /\.tsx?$/,
			exclude: /node_modules/,
			loader: "awesome-typescript-loader"
		}, {
			enforce: "pre",
			test: /\.js$/,
			exclude: /node_modules/,
			loader: "source-map-loader"
		})
	}else{
		rules.push({
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true
                }
            }
        })
	}

	let config = {
    	mode: isProd ? "production" : "development",
	    entry: {
	    	vendor: ["react", "react-dom", "react-router-dom"],
	    	// index: path.resolve(cwd, "./src/index.js")
	    },
	    output: {
	        path: path.resolve(cwd, './dist'),
	        publicPath: "/",
	        filename: 'js/[name].js'
	    },
	    devtool: isProd ? "" : "cheap-eval-source-map",
	    resolve: {
	        extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".less", ".png", ".jpg", ".jpeg", ".gif"],
	        alias: {
	            "actions": path.resolve(cwd, './src/actions'),
	            "components": path.resolve(cwd, './src/components'),
	            "images": path.resolve(cwd, './src/images'),
	            "pages": path.resolve(cwd, './src/pages'),
	            "reducers": path.resolve(cwd, './src/reducers'),
	            "styles": path.resolve(cwd, './src/styles'),
	            "utils": path.resolve(cwd, './src/utils'),
	            "commonjs": path.resolve(cwd, './src/utils/common.js')
	        }
	    },
	    module: {
	        rules: [
	            {
		            test: /\.css$/i,
        			use: ['style-loader', 'css-loader']
		        },
	            {
		            test: /\.less$/i,
		            use:  [
		            	isProd ? MiniCssExtractPlugin.loader : "style-loader",
			            "css-loader",
			            ...lessLoaderArray
		            ]
		        },
	            {
		            test: /\.s[ac]ss$/i,
		            use:  [
		            	isProd ? MiniCssExtractPlugin.loader : "style-loader",
			            "css-loader",
			            ...sassLoaderArray
		            ]
		        },
	            {
	                test: /\.(eot|svg|ttf|woff|woff2)\S*$/i,
	                use: [
	                    {
	                        loader: 'file-loader',
	                        options: {
	                            name: 'css/[name].[ext]?[hash]'
	                        }
	                    }
	                ]
	            },
		        {
		            test: /\.(png|jpg|jpeg|gif|ico)$/i,
		            use: [
		                {
		                    loader: 'url-loader',
		                    options: {
		                        limit: isProd ? 8192 : 10,
		                        name: "img/[name].[ext]?[hash]"
		                    }
		                }
		            ]
		        },
		        ...rules
	        ]
	    },
	    plugins: [
	        // new HtmlWebpackPlugin(),
			// new webpack.ProgressPlugin(),
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
	    ],
	    optimization: {
	    	splitChunks: {
	            name: "vendor",
	            chunks: "all"
	    	}
	    }
	}

	if(isProd){
		config.plugins = config.plugins.concat([
			new CleanWebpackPlugin(),
			new MiniCssExtractPlugin({
	        	filename: "css/[name].css"
	        }),
	        new CopyWebpackPlugin([
	            {
	                from: path.resolve(cwd, './public/favicon.ico'),
	                to: path.resolve(cwd, './dist/favicon.ico')
	            }
	        ])
		]);
	}else{
		config.plugins.push(new webpack.HotModuleReplacementPlugin())
	}

	return config;
}