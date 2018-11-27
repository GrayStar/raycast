const withSass = require('@zeit/next-sass');

module.exports = withSass({
	cssModules: true,
	sassLoaderOptions: {
		includePaths: ['./'],
	},
	cssLoaderOptions: {
		importLoaders: 1,
    	localIdentName: '[local]___[hash:base64:5]',
	},
	webpack: config => {
		config.module.rules.push({
			test: /\.(txt|jpg|png|svg)$/,
			use: [
				{
					loader: 'file-loader',
					options: {
						context: '',
						emitFile: true,
						name: '[path][name].[hash].[ext]',
					},
				},
			],
		});

		return config;
	}
});