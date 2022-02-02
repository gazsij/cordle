/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	target: 'node',
	devtool: 'inline-source-map',
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [new TsconfigPathsPlugin({})]
	},
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'build'),
	},
	externals: [nodeExternals()]
};
