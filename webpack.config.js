var path = require('path');
module.exports = {
    entry: [
        './app/index.js'
    ],
    output: {
        path: './build',
        filename: 'app.js'
    },
    module: {
        loaders: [
            { test: /\.(png|jpg|gif|woff|woff2)$/, loader: 'url-loader' },
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
            { test: /\.txt$/, loader: 'raw-loader' }
        ]
    },
    resolve: {
        root: path.resolve('./app'),
        extensions: ['', '.js', '.png']
    }
};
