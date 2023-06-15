const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    output: {
        path : path.resolve(__dirname, "./static/frontend"),
        filename : "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                user: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    optimization: {
        minimize: true,
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env" : {
                NODE_ENV: JSON.stringify("production"),
            }
        })
    ]
}