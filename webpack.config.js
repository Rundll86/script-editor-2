const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackBar = require("webpackbar");
const CopyPlugin = require("copy-webpack-plugin");
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "generated"),
        filename: "app.js"
    },
    module: {
        rules: [
            {
                test: /\.vue$/i,
                loader: "vue-loader"
            },
            {
                test: /\.ts$/i,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true,
                        appendTsSuffixTo: [/\.vue$/i],
                        configFile: path.resolve(__dirname, "tsconfig.client.json"),
                    }
                },
            },
            {
                test: /\.css$/i,
                use: ["vue-style-loader", "css-loader"]
            },
            {
                test: /\.png$/i,
                use: "url-loader"
            },
            {
                test: /\.txt$/i,
                use: "raw-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "@": path.resolve(__dirname, "src")
        },
        fallback: {
            url: false
        }
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: "public/index.html",
            filename: "index.html"
        }),
        new WebpackBar({
            name: "Live",
            color: "green"
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "public",
                    to: ".",
                    globOptions: {
                        ignore: ["public/index.html"]
                    }
                }
            ]
        })
    ],
    stats: "errors-warnings",
    devServer: {
        port: 25565,
        setupExitSignals: false,
        client: {
            logging: "none"
        },
        static: "public"
    }
};