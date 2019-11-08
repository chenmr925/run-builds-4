const fs = require('fs');
const path = require('path');
const webpack = require("webpack");
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// 获取webpack配置
const getWebpackConfig = require("./config/webpack.base.js");
const devServerBaseConfig = require("./config/devServer.config.js");

module.exports = class RunBuilds {
	constructor(cwd, argv){
		this.cwd = cwd;
		this.script = argv[2] || "";
		this.argv = argv.slice(3);
	}

	run(){
	    return new Promise((resolve, reject) => {

	    	// 获取版本
			if(this.script.indexOf("--version") >= 0 || this.script.indexOf("-V") >= 0) {
				let packageJson = require("../package.json");
				console.log(packageJson.version);
				resolve();
				return false;
			}

			// 	获取插件帮助
			if(this.script.indexOf("--help") >= 0 || this.script.indexOf("-h") >= 0) {
				this.help();
				resolve();
				return false;
			}

			// 获取插件script帮助
			if(this.argv.indexOf("--help") >= 0 || this.argv.indexOf("-h") >= 0) {
				this.helpScript(this.script);
				resolve();
				return false;
			}

			let cwd = this.cwd;
			// script取值只能是["serve", "build"]，其他取值抛出异常
			if(["serve", "build"].indexOf(this.script) < 0) {
				throw new Error("找不到脚本，请检查输入命令！");
				return false;
			}

			// 获取webpack额外配置
			let extraConfig = {};
			try {
				extraConfig = require(path.resolve(cwd, './react.config.js'));
				if(typeof extraConfig === "function") extraConfig = extraConfig(isProd);
			}catch(e){}

			// 获取webpack基本配置
			const isProd = this.script === "build";
			const baseConfig = getWebpackConfig(isProd, this.cwd);

			// 处理页面
			let pages = extraConfig.pages || {
				index: {
					path: "./src/index.js"
				}
			};
			let htmlPlugins = [], htmlPluginConfig = {};

			// 判断模板public/index.html是否存在
			let defaultTemplete = path.resolve(cwd, "./public/index.html");
			if(fs.existsSync(defaultTemplete)){
				htmlPluginConfig.template = defaultTemplete;
			}
			for(let key in pages) {
				let page = pages[key];
				baseConfig.entry[key] = path.resolve(cwd, page.path || page);
				htmlPluginConfig = merge({}, htmlPluginConfig, {
		            filename: page.filename || 'index.html',
		            chunks: ["vendor", key],
		            hash: true,
		            title: page.title || "index"
		        })
				if(page.template) htmlPluginConfig.template = path.resolve(cwd, page.template);
				htmlPlugins.push(new HtmlWebpackPlugin(htmlPluginConfig));
			}
			baseConfig.plugins = baseConfig.plugins.concat(htmlPlugins);

			// 获取devServer配置
			const devServerConfig = merge({}, devServerBaseConfig, extraConfig.devServer || (extraConfig.webpackConfig && extraConfig.webpackConfig.devServer) || {});

			// 是否开启BundleAnalyzer插件
			const showBundleAnalyzer = this.argv.indexOf("--analysis") >= 0 || this.argv.indexOf("-A") >= 0;
			if(showBundleAnalyzer){
				baseConfig.plugins.push(new BundleAnalyzerPlugin());
			}

			// 合并配置
			const webpackConfig = merge({}, baseConfig, extraConfig.webpackConfig || {});
			
			// webpack构建
			const compiler = webpack(webpackConfig);

	    	if(isProd){
	    		// 生产环境构建
	    		compiler.run((err, stats) => {
	    			console.log(stats.toString({
					    chunks: false,
					    colors: true
				  	}));
					if (err || stats.hasErrors()) {
	    				reject(err);
						return false;
					}
					console.log("构建成功!");
	    			resolve();
				})
	    	}else{
	    		// 根据处理单页面或者多页面
	    		devServerConfig.historyApiFallback = htmlPlugins < 2;

	    		// 开发环境
	    		this.runServe(compiler, devServerConfig, err => {
	    			if(err) {
						console.log("服务器启动失败： ", err);
	    				reject(err);
						return false;
	    			}
					console.log("服务器启动成功，链接： http://"+ devServerConfig.host +":"+ devServerConfig.port);
	    			resolve();
	    		})
	    	}
	    })
	}

	// 运行本地开发服务器
	runServe(compiler, config, errCallback) {
		const WebpackDevServer = require('webpack-dev-server');
		const server = new WebpackDevServer(compiler, config);
		server.listen(config.port, config.host, err => {
			typeof errCallback === "function" && errCallback(err);
      	})
	}

	// 获取插件帮助信息
	help(){
		console.log("Usage: run-builds <command> [options]");
		console.log();
		console.log("Options:");
		console.log("  -h, --help 				output usage information");
		console.log("  -V, --version 			output usage information");
		console.log();
		console.log("Commands:");
		console.log("  serve 				start development server");
		console.log("  build 				build for production");
		console.log();
		console.log("  run run-builds help [command] for usage of a specific command.");
	}

	// 获取插件命令的帮助信息
	helpScript(scriptName){
		console.log("Usage: run-builds "+ scriptName +" [options]");
		console.log();
		console.log("Options:");
		console.log("  -A, --analysis		use webpack-bundle-analyzer plugin");
		console.log();
	}
}