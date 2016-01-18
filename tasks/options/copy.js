module.exports = {
    build: {
        files: [
            { expand: true, cwd: 'app', src: ['*.html'], dest: 'build' }
        ]
    },
    dist: {
        files: [
            { expand: true, cwd: 'build', src: ['*.html', '*.min.js', '*.txt'], dest: 'dist' }
        ]
    }
};
