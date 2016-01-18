module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');
    var config = {
        pkg: pkg,
        env : {
            options : {
                APP: pkg.name,
                VERSION: pkg.version
            },
            dev: {
                src: ['./env/dev.json']
            },
            prod: {
                src: './env/prod.json'
            }
        },
        gitinfo: {}
    };

    // Load options
    grunt.util._.extend(config, loadConfig('./tasks/options/'));

    // Configure
    grunt.initConfig(config);

    // Load tasks
    require('load-grunt-tasks')(grunt);

    // Load custom tasks
    grunt.loadTasks('tasks');

    // Default task
    grunt.registerTask('default', ['build']);
};

// Load task options
function loadConfig(path) {
    var glob = require('glob');
    var object = {};
    var key;
    glob.sync('*', {cwd: path}).forEach(function(option) {
        key = option.replace(/\.js$/, '');
        object[key] = require(path + option);
    });
    return object;
}
