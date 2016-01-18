module.exports = function(grunt) {
    var env = grunt.option('env') || 'prod';
    grunt.registerTask('dist', [
        'env:' + env,
        'gitinfo',
        'clean:build',
        'jshint',
        'copy:build',
        'webpack:build',
        'preprocess:html',
        'file-creator',
        'uglify:build',
        'clean:dist',
        'copy:dist'
    ]);
};
