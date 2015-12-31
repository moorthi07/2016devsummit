/*jslint indent:2, todo:true*/
/*global module*/
module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // you can run `grunt karma` to execute the config file specified
    // equivalent to `karma start <config file>
    mochacli: {
      spec: {
        options: {
          reporter: 'spec'
        }
      },
      jenkins: {
        options: {
          reporter: 'xunit-file'
        },
        src: ['js/*.js', 'test/*.js'],
        dest: 'xunit.xml'
      }
    },
    jslint: {
      // lint your project's server code
      server: {
        src: ['js/**/*.js', 'test/**/*.js', '*.js'],
        options: {
          log: 'out/jslint/jslint.log',
          checkstyle: 'out/jslint/jslint.xml' // write a checkstyle-XML
        }
      }
    },
    jsdoc: {
      dist: {
        src: ['js/*.js'],
        options: {
          destination: 'docs',
          template : 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
          configure : 'jsdoc.conf.json'
        }
      }
    },
    globals: {
      require: true,
      define: true,
      requirejs: true,
      describe: true,
      expect: true,
      it: true
    },
    watch: {
      scripts: {
        files: ['js/*.js', 'test/*.js'],
        tasks: ['mochacli'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'jslint',
    'jsdoc',
    'mochacli:jenkins'
  ]);
  grunt.registerTask('test', [
    'mochacli:spec'
  ]);
};
