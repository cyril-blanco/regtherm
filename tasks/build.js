module.exports = function(grunt) {
    var env = grunt.option('env') || 'dev';
    grunt.registerTask('build', [
        'env:' + env,
        'gitinfo',
        'clean:build',
        'jshint',
        'copy:build',
        'webpack:build',
        'preprocess:html',
        'file-creator'
    ]);
};
