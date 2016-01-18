var grunt = require('grunt');
module.exports = {
    build: {
        'build/version.txt': function(fs, fd, done) {
            var pkginfo = grunt.config.get('pkg');
            var gitinfo = grunt.config.get('gitinfo');

            var versionInfo = 'Project: ' + pkginfo.name + '@' + pkginfo.version + '\n';
            versionInfo += 'Date: ' + grunt.template.today('isoDateTime') + '\n';
            versionInfo += 'User: ' + gitinfo.local.branch.current.currentUser + '\n';
            versionInfo += 'Branch: ' + gitinfo.local.branch.current.name + '\n';
            versionInfo += 'HEAD: ' + gitinfo.local.branch.current.SHA + '\n';

            fs.writeSync(fd, versionInfo);
            done();
        }
    }
};
