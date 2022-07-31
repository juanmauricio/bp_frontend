module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		babel: {
			options: {
				sourceMap: true,
				presets: [ '@babel/preset-env' ],
			},
			dist: {
				files: {
					'dist/app.js': 'src/js/index.js',
				},
			},
		},
		concat: {
			js: {
				src: [ 'src/js/**/*.js' ],
				dest: 'dist/js/index.js',
			},
			css: {
				src: [ 'src/css/**/*.css' ],
				dest: 'dist/css/styles.css',
			},
		},
		uglify: {
			dist: {
				files: {
					'dist/app.js': [ 'dist/app.js' ],
				},
				options: {
					mangle: false,
				},
			},
		},
		clean: [ 'src/dev/' ],
		homepage: {
			template: 'src/index.html',
			dist: {
				dest: 'dist/index.html',
				context: {
					obfuscated: 'o',
				},
			},
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						flatten: true,
						src: 'src/3d-editor/*',
						dest: 'dist/3d-editor/',
					},
					{
						expand: true,
						flatten: true,
						src: 'src/3d-editor/textures/*',
						dest: 'dist/3d-editor/textures/',
					},
					{
						expand: true,
						flatten: true,
						src: 'src/lib/angular.min.js',
						dest: 'dist/js/'
					}
				],
			},
		},
		obfuscator: {
			options: {
				banner: '// obfuscated with grunt-contrib-obfuscator.\n',
				debugProtection: true,
				debugProtectionInterval: true,
			},
			task1: {
				options: {
					// options for each sub task
				},
				files: {
					'dist/3d-editor/bpeditor.js': [ 'src/3d-editor/bpeditor.js' ],
				},
			},
		},
	});

	// Loading of tasks and registering tasks will be written here
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-obfuscator');

	//load custom tasks
	grunt.loadTasks('tasks');

	//set up the workflow.
	grunt.registerTask('default', [ 'concat', 'homepage', 'copy', 'obfuscator' ]);
};
