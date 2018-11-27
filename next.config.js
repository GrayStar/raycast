const withSass = require('@zeit/next-sass');

module.exports = withSass({
	serverRuntimeConfig: { // Will only be available on the server side
	    staticFilePath: '/_next/',
	},
	publicRuntimeConfig: { // Will be available on both server and client
		staticFilePath: '',
	},
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