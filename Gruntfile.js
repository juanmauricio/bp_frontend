module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			js: {
				src: [ 'src/js/**/*.js' ],
				dest: 'dist/app.js',
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
		clean: [ 'dist', '.tmp' ],

		// Task configuration will be written here
	});

	// Loading of tasks and registering tasks will be written here
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', [ 'concat', 'html2js', 'uglify' ]);
};
