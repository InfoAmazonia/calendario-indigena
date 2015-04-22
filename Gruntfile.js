module.exports = function(grunt) {

	grunt.initConfig({
		browserify: {
			js: {
				files: {
					'js/app.js': 'src/app/index.js'
				}
			}
		},
		uglify: {
			build: {
				options: {
					mangle: true,
					compress: true
				},
				files: {
					'js/app.js': 'js/app.js',
				}
			}
		},
		less: {
			compile: {
				options: {
					compress: true
				},
				files: {
					'css/app.css': 'src/css/app.less'
				}
			}
		},
		jade: {
			compile: {
				options: {
					doctype: 'html'
				},
				files: {
					'index.html': 'src/views/index.jade'
				}
			}
		},
		copy: {
			build: {
				files: [
					{
						cwd: 'src',
						src: ['**', '!app/**', '!**/*.less', '!**/*.jade', '!**/*.js'],
						dest: './',
						expand: true
					}
				]
			}
		},
		watch: {
			options: {
				livereload: true
			},
			css: {
				files: 'src/css/**/*.less',
				tasks: ['less']
			},
			jade: {
				files: 'src/views/**/*.jade',
				tasks: ['jade']
			},
			scripts: {
				files: 'src/app/**/*.js',
				tasks: ['browserify']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask(
		'javascript',
		'Compile scripts.',
		['browserify', 'uglify']
	);

	grunt.registerTask(
		'views',
		'Compile views.',
		['jade', 'less']
	);

	grunt.registerTask(
		'build',
		'Compiles everything.',
		['javascript', 'views']
	);

	grunt.registerTask(
		'default', 
		'Build, start server and watch.', 
		['build', 'watch']
	);

}
