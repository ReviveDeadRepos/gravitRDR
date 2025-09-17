var exec = require('child_process').exec;

// Lodash patch attempt
const _ = require('lodash');
_.unique = _.uniq;

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var pgk = grunt.file.readJSON('package.json');

    var cfg = {
        build: 'build',
        dist: 'dist',
        tmp: 'tmp',
        macBundleId: 'com.revivedeadrepos.gravitrdr',
        macSignIdentity: '1269B5CE3B0DCC676DA70011A618EB6FA95F8F50'
    };

    grunt.initConfig({
        cfg: cfg,
        pkg: pgk,

        watch: {
            compass: {
                files: ['style/{,*/}*.{scss,sass}'],
                tasks: ['compass']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    'src/*.html',
                    '<%= cfg.tmp %>/{,*/}*.css',
                    '{<%= cfg.tmp %>,src/{,*/}*.js,test/{,*/}*.js',
                    'assets/image/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        connect: {
            options: {
                port: 8999,
                livereload: 35728,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '<%= cfg.tmp %>',
                        'assets',
                        'src',
                        '.'
                    ]
                }
            },
            test: {
                options: {
                    base: [
                        '<%= cfg.tmp %>',
                        'assets',
                        'test',
                        'src',
                        '.'
                    ]
                }
            }
        },
        clean: {
            dev: '<%= cfg.tmp %>',
            build: '<%= cfg.build %>',
            dist: '<%= cfg.dist %>',
            concat: ['<%= cfg.build %>/source/concat']
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
                }
            }
        },
        compass: {
            options: {
                sassDir: 'style',
                cssDir: '<%= cfg.tmp %>',
                generatedImagesDir: '<%= cfg.tmp %>/image/generated',
                imagesDir: 'assets/image/images',
                javascriptsDir: 'src',
                fontsDir: '<%= cfg.tmp %>/font',
                httpImagesPath: '/image',
                httpGeneratedImagesPath: '/image/generated',
                httpFontsPath: '/font',
                relativeAssets: false
            },
            dev: {
                options: {
                    debugInfo: true
                }
            },
            build: {
                options: {
                    debugInfo: false,
                    generatedImagesDir: '<%= cfg.build %>/source/image/generated'
                }
            }
        },
        concat: {
            build: {
                files: {
                    '<%= cfg.build %>/browser/gravitrdr-shell.js': ['shell/browser/*.js'],
                    '<%= cfg.build %>/chrome/gravitrdr-shell.js': ['shell/chrome/*.js', '!shell/chrome/background.js'],
                    '<%= cfg.build %>/system/gravitrdr-shell.js': ['shell/system/*.js']
                }
            }
        },
        terser: {
            build: {
                options: { compress: true, mangle: true },
                files: {
                    '<%= cfg.build %>/browser/gravitrdr-shell.js': ['<%= cfg.build %>/browser/gravitrdr-shell.js'],
                    '<%= cfg.build %>/chrome/gravitrdr-shell.js': ['<%= cfg.build %>/chrome/gravitrdr-shell.js'],
                    '<%= cfg.build %>/system/gravitrdr-shell.js': ['<%= cfg.build %>/system/gravitrdr-shell.js']
                }
            },
            generated: { // Added to process useminPrepare files
                options: { compress: true, mangle: true },
                files: [
                    { dest: 'build/source/infinity-libraries.js', src: ['build/source/concat/infinity-libraries.js'] },
                    { dest: 'build/source/infinity-core.js', src: ['build/source/concat/infinity-core.js'] },
                    { dest: 'build/source/infinity-editor.js', src: ['build/source/concat/infinity-editor.js'] },
                    { dest: 'build/source/gravitrdr.js', src: ['build/source/concat/gravitrdr.js'] }
                ]
            }
        },
        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: 'node_modules/font-awesome/fonts',
                        dest: '<%= cfg.tmp %>/font/',
                        src: '{,*/}*.*'
                    }
                ]
            },
            preBuild: {
                files: [
                    // Source Assets
                    {
                        expand: true,
                        dot: true,
                        cwd: 'node_modules/font-awesome/fonts',
                        dest: '<%= cfg.build %>/source/font/',
                        src: '{,*/}*.*'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'assets/cursor',
                        dest: '<%= cfg.build %>/source/cursor/',
                        src: '{,*/}*.*'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'assets/font',
                        dest: '<%= cfg.build %>/source/font/',
                        src: '{,*/}*.*'
                    },

                    // Chrome Assets
                    {
                        expand: true,
                        dot: true,
                        cwd: 'node_modules/jquery/dist/',
                        dest: '<%= cfg.build %>/chrome/',
                        src: 'jquery.min.js'
                    },

                    // System assets
                    {
                        expand: true,
                        dot: true,
                        cwd: 'node_modules/jquery/dist/',
                        dest: '<%= cfg.build %>/system/',
                        src: 'jquery.min.js'
                    }
                ]
            },
            postBuild: {
                files: [
                    // Copy some files for mac binary
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/system/',
                        dest: '<%= cfg.build %>/system-binaries/GravitRDR/osx/GravitRDR.app/Contents/',
                        src: ['Info.plist']
                    },
                    {
                        expand: true,
                        cwd: 'shell/system/',
                        dest: '<%= cfg.build %>/system-binaries/GravitRDR/osx/GravitRDR.app/Contents/Resources/',
                        src: ['doc.icns']
                    }
                ]
            },
            build: {
                files: [
                    // Browser
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/source/',
                        dest: '<%= cfg.build %>/browser/',
                        src: '{,*/}*.*'
                    },
                    {
                        expand: true,
                        cwd: 'assets/icon/',
                        dest: '<%= cfg.build %>/browser/icon',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: 'shell/browser/',
                        dest: '<%= cfg.build %>/browser/',
                        src: ['index.html']
                    },

                    // Infinity
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/source/',
                        dest: '<%= cfg.build %>/infinity/',
                        src: ['cursor/*.*', 'infinity-**.js']
                    },

                    // Chrome
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/chrome/',
                        dest: '<%= cfg.build %>/chrome/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/source/',
                        dest: '<%= cfg.build %>/chrome/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: 'shell/chrome/',
                        dest: '<%= cfg.build %>/chrome/',
                        src: ['index.html', 'manifest.json', 'background.js']
                    },
                    {
                        expand: true,
                        cwd: 'assets/icon/',
                        dest: '<%= cfg.build %>/chrome/icon',
                        src: ['**']
                    },

                    // System
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/source/',
                        dest: '<%= cfg.build %>/system/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: 'shell/system/',
                        dest: '<%= cfg.build %>/system/',
                        src: ['index.html', 'package.json', 'Info.plist']
                    }
                ]
            },
            dist: {
                files: [
                    // Browser
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/browser/',
                        dest: '<%= cfg.dist %>/browser/',
                        src: ['**']
                    },

                    // Infinity
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/infinity/',
                        dest: '<%= cfg.dist %>/infinity/',
                        src: ['**']
                    }
                ]
            }
        },
        replace: {
            build: {
                src: ['<%= cfg.build %>/system/package.json', '<%= cfg.build %>/system/Info.plist', '<%= cfg.build %>/chrome/manifest.json'],
                overwrite: true,
                replacements: [
                    {
                        from: '%name%',
                        to: '<%= pkg.name %>'
                    },
                    {
                        from: '%description%',
                        to: '<%= pkg.description %>'
                    },
                    {
                        from: '%version%',
                        to: '<%= pkg.version %>'
                    },
                    {
                        from: '%mac-bundle-id%',
                        to: '<%= cfg.macBundleId %>'
                    }
                ]
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= cfg.build %>/source',
                staging: '<%= cfg.build %>/source'
            },
            html: 'src/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= cfg.build %>/source']
            },
            html: ['<%= cfg.build %>/source/{,*/}*.html'],
            css: ['<%= cfg.build %>/source/{,*/}*.css']
        }
    });

    grunt.registerTask('nwjs', 'Custom NW.js build', function () {
        const done = this.async();
        grunt.log.writeln('Running NW.js build manually...');
        require('child_process').exec('node build-nw.mjs', function (err, stdout, stderr) {
            if (stdout) grunt.log.writeln(stdout);
            if (stderr) grunt.log.error(stderr);
            done(err);
        });
    });

    // Private tasks
    grunt.registerTask('_dist_osx', function () {
        var done = this.async();

        var gravitrdrAppDir = cfg.build + '/system-binaries/GravitRDR/osx/GravitRDR.app';

        var commands = [
            // sign
            'codesign --deep -f -v -s ' + cfg.macSignIdentity + ' -i ' + cfg.macBundleId + ' "' + gravitrdrAppDir + '/Contents/Frameworks/node-webkit Helper.app"',
            'codesign --deep -f -v -s ' + cfg.macSignIdentity + ' -i ' + cfg.macBundleId + ' "' + gravitrdrAppDir + '/Contents/Frameworks/node-webkit Helper EH.app"',
            'codesign --deep -f -v -s ' + cfg.macSignIdentity + ' -i ' + cfg.macBundleId + ' "' + gravitrdrAppDir + '/Contents/Frameworks/node-webkit Helper NP.app"',
            'codesign --deep -f -v -s ' + cfg.macSignIdentity + ' -i ' + cfg.macBundleId + ' "' + gravitrdrAppDir + '"',

            // verify
            'spctl --assess -vvvv "' + gravitrdrAppDir + '/Contents/Frameworks/node-webkit Helper.app"',
            'spctl --assess -vvvv "' + gravitrdrAppDir + '/Contents/Frameworks/node-webkit Helper EH.app"',
            'spctl --assess -vvvv "' + gravitrdrAppDir + '/Contents/Frameworks/node-webkit Helper NP.app"',
            'spctl --assess -vvvv "' + gravitrdrAppDir + '"',

            // package
            'test -f ./dist/gravitrdr-osx.dmg && rm ./dist/gravitrdr-osx.dmg',
            'mkdir ./dist',
            './node_modules/appdmg/bin/appdmg ./shell/system/package/osx/dmg.json ' + cfg.dist + '/gravitrdr-osx.dmg'
        ];

        console.log('Sign & Package for OS-X');

        var index = 0;

        var _exec = function () {
            exec(commands[index], function (error, stdout, stderr) {
                if (stdout) console.log(stdout);
                if (stderr) console.log(stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }

                if (++index < commands.length) {
                    _exec();
                } else {
                    done();
                }
            });
        }

        _exec();
    })

    grunt.registerTask('_dist_win', function () {
        // TODO : Build installer
        var done = this.async();

        exec('zip -r -X ../../../../' + cfg.dist + '/gravitrdr-windows.zip *', {cwd: cfg.build + '/system-binaries/GravitRDR/win'}, function (error, stdout, stderr) {
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            done();
        });
    })

    grunt.registerTask('_dist_linux', function () {
        var done = this.async();

        exec('zip -r -X ../../../../' + cfg.dist + '/gravitrdr-linux64.zip *', {cwd: cfg.build + '/system-binaries/GravitRDR/linux64'}, function (error, stdout, stderr) {
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            done();
        });
    })

    grunt.registerTask('_dist_chrome', function () {
        var done = this.async();

        exec('zip -r -X ../../' + cfg.dist + '/gravitrdr-chrome.zip *', {cwd: cfg.build + '/chrome'}, function (error, stdout, stderr) {
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            done();
        });
    })

    // Public tasks
    grunt.registerTask('dev', function (target) {
        grunt.task.run([
            'clean:dev',
            'compass:dev',
            'copy:dev',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', function (target) {
        grunt.task.run([
            'clean:dev',
            'compass:dev',
            'copy:dev',
            // 'connect:test',
            // 'mocha'
        ]);
    });

    grunt.registerTask('build', function (target) {
        grunt.task.run([
            'clean:build',
            'useminPrepare',
            'compass:build',
            'concat',
            'cssmin',
            'terser',
            'clean:concat',
            'usemin',
            'copy:preBuild',
            'copy:build',
            'replace:build',
            'nwjs',
            'copy:postBuild'
        ]);
    });

    grunt.registerTask('dist', function (target) {
        grunt.task.run([
            'test',
            'build',
            'clean:dist',
            'copy:dist',
            '_dist_osx',
            '_dist_linux',
            '_dist_win',
            '_dist_chrome'
        ]);
    });


    // By default we'll run the development task
    grunt.registerTask('default', [
        'dev'
    ]);
};