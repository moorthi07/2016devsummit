/*jslint indent:2*/
/*globals module*/

module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jslint: {
      // lint your project's server code
      server: {
        src: ['*.js', 'routes/**/*.js'],
        options: {
          log: 'out/jslint/jslint.log',
          failOnError: false,
          checkstyle: 'out/jslint/jslint.xml' // write a checkstyle-XML
        }
      }
    },
    docco: {
      debug: {
        src: ['public/js/common.js'],
        options: {
          output: 'public/js/docs/'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-docco');

  grunt.registerTask('default', ['jslint']);
  grunt.registerTask('tutorial', ['jslint', 'docco']);
};
