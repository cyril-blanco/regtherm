module.exports = {
    dist: {
        options: {
            archive: '<%= pkg.name %>-<%= pkg.version %>-<%= grunt.template.today("yyyymmddHHMM") %>.zip'
        },
        files: [
            { expand: true, cwd: 'dist', src: ['**'], dest: './' }
        ]
    }
};
