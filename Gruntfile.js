var exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const os = require('os');

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

    grunt.registerTask('ensure-ttf', 'Generate fa-solid-900.ttf from FontAwesome webfonts if missing', function () {
        try {
            var done = this.async();
            var webfontsDir = path.join('node_modules', '@fortawesome', 'fontawesome-free', 'webfonts');
            var base = 'fa-solid-900';
            var ttfIn = path.join(webfontsDir, base + '.ttf');
            var woff2In = path.join(webfontsDir, base + '.woff2');

            // Targets to place the TTF (dev and build)
            var targets = [
                path.join(cfg.build, 'source', 'font'),
                path.join(cfg.tmp, 'font')
            ];

            // Ensure target directories exist
            targets.forEach(function (t) {
                try { fs.mkdirSync(t, { recursive: true }); } catch (e) { /* ignore */ }
            });

            // Helper to copy or move into each target
            function copyToTargets(srcPath) {
                targets.forEach(function (t) {
                    var outPath = path.join(t, base + '.ttf');
                    try {
                        fs.copyFileSync(srcPath, outPath);
                        grunt.log.writeln('FontAwesome TTF available at: ' + outPath);
                    } catch (err) {
                        grunt.log.warn('Failed to copy TTF to ' + outPath + ': ' + err);
                    }
                });
            }

            // If a .ttf exists in node_modules, copy it into targets
            if (fs.existsSync(ttfIn)) {
                grunt.log.writeln('Found existing FontAwesome .ttf in node_modules, copying to build/tmp font directories.');
                copyToTargets(ttfIn);
                return done();
            }

            // If a .woff2 exists, try to decompress it to a temporary ttf then copy to targets
            if (fs.existsSync(woff2In)) {
                grunt.log.writeln('Found FontAwesome .woff2 in node_modules, attempting to generate .ttf via npx woff2_decompress...');
                var tmpOut = path.join(os.tmpdir(), base + '-' + Date.now() + '.ttf');
                try {
                    // Use npx to run woff2_decompress; this requires the woff2 CLI to be available (recommended: npm i -D woff2)
                    execSync('npx woff2_decompress "' + woff2In + '" "' + tmpOut + '"', { stdio: 'inherit' });

                    if (fs.existsSync(tmpOut)) {
                        copyToTargets(tmpOut);
                        try { fs.unlinkSync(tmpOut); } catch (e) { /* ignore cleanup errors */ }
                        return done();
                    } else {
                        grunt.log.warn('woff2_decompress completed but temporary TTF not found: ' + tmpOut);
                        return done();
                    }
                } catch (err) {
                    grunt.log.warn('Failed to run woff2_decompress: ' + err);
                    grunt.log.warn('You may need to install the woff2 CLI as a dev dependency: npm i -D woff2');
                    return done();
                }
            }

            // Nothing found
            grunt.log.warn('FontAwesome fa-solid-900: no .ttf or .woff2 found in node_modules/@fortawesome/fontawesome-free/webfonts. Please ensure @fortawesome/fontawesome-free is installed or provide a .ttf.');
            return done();
        } catch (e) {
            grunt.log.error('Error in ensure-ttf: ' + e);
            // signal task completion even on errors
            return;
        }
    });

    grunt.initConfig({
        cfg: cfg,
        pkg: pgk,

        watch: {
            sass: {
                files: ['style/{,*/}*.{scss,sass}'],
                tasks: ['sass:dev', 'autoprefixer:dev']
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
        autoprefixer: {
            options: {
                browsers: ['last 2 versions', '> 1%', 'ie >= 11']
            },
            dev: {
                src: '<%= cfg.tmp %>/*.css'
            },
            build: {
                src: '<%= cfg.build %>/source/*.css'
            }
        },
        sass: {
            options: {
                implementation: require('sass'),
                sourceMap: true,
                loadPaths: [
                    'node_modules',
                    'style'
                ]
            },
            dev: {
                options: {
                    style: 'expanded',
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: 'style',
                    src: ['*.scss'],
                    dest: '<%= cfg.tmp %>',
                    ext: '.css'
                }]
            },
            build: {
                options: {
                    style: 'compressed',
                    sourceMap: false
                },
                files: [{
                    expand: true,
                    cwd: 'style',
                    src: ['*.scss'],
                    dest: '<%= cfg.build %>/source',
                    ext: '.css'
                }]
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
                        cwd: 'node_modules/@fortawesome/fontawesome-free/webfonts',
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
                        cwd: 'node_modules/@fortawesome/fontawesome-free/webfonts',
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
            processedCSS: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/source/',
                        dest: '<%= cfg.tmp %>/',
                        src: ['*.css']
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
                    {
                        expand: true,
                        cwd: 'node_modules/jquery/dist/',
                        dest: '<%= cfg.build %>/browser/',
                        src: ['jquery.min.js']
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
            'sass:dev',
            'autoprefixer:dev',
            'copy:dev',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', function (target) {
        grunt.task.run([
            'clean:dev',
            'sass:dev',
            'copy:dev',
            // 'connect:test',
            // 'mocha'
        ]);
    });

    grunt.registerTask('build', function (target) {
        grunt.task.run([
            'clean:build',
            'sass:build',
            'autoprefixer:build',
            'copy:processedCSS',
            'useminPrepare',
            'concat',
            'cssmin',
            'terser',
            'clean:concat',
            'usemin',
            'ensure-ttf',
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