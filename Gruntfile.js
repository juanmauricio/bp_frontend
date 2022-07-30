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
					'dist/app.js': 'dev/app.js',
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
		html2js: {
			dist: {
				src: [ 'src/*.html' ],
				dest: 'dist/html_templates.js',
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
			dev: {
				dest: 'dev/index.html',
				context: {
					js: 'app.js',
					css: 'app.css',
				},
			},
			dist: {
				dest: 'dist/index.html',
				context: {
					js: 'app.js',
					css: 'app.css',
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
						dest: 'dist/3d-editor/textures/'
					}
				],
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

	//load custom tasks
	grunt.loadTasks('tasks');

	//set up the workflow.
	grunt.registerTask('default', [ 'concat', 'babel', 'uglify', 'homepage', 'html2js', 'copy' ]);
};
