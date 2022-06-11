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
				dest: 'dev/app.js',
			},
			css: {
				src: [ 'src/css/**/*.cs' ],
				dest: 'dev/app.css',
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

		// Task configuration will be written here
	});

	// Loading of tasks and registering tasks will be written here
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-babel');

	//load custom tasks
	grunt.loadTasks('tasks');

	//set up the workflow.
	grunt.registerTask('default', [ 'concat', 'babel', 'uglify', 'homepage' ]);
};
