module.exports = {
	port: "80",
    hot: true,
    compress: true,
    historyApiFallback: true,
    host: "0.0.0.0",
    watchOptions: {
        aggregateTimeout: 3000,
        ignored: /node_modules/
    }
}