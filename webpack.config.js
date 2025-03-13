
const path = require('path');

module.exports ={
 entry: path.resolve(__dirname, "./src/index.tsx"),
 output: {
    path: path.resolve(__dirname, "./public"),
    filename: "bundle.js"
 },
 module: {
    rules: [
      {
         test: /\.css$/i,
         use: ["style-loader", "css-loader"],
       },
        {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: 'ts-loader'
        }
    ]
 },
 resolve: {
    extensions: ['.tsx', '.ts', '.js']
 },
 devtool: 'inline-source-map',
 devServer: {
    port: 9000
 }
}