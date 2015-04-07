module.exports = {
	watch: false,
	prod: false,
	src: 'src/',
	dest: './output/',
	outputJadeIncludes: true,
	watchDest: ['output/**/*', '!output/**/*.html'],
	extensionlessRoutes: false // WARNING: Experimental
};