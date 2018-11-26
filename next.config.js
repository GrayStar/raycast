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
});