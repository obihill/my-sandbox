// Karma configuration
// Generated on Wed Dec 28 2016 01:47:42 GMT+0100 (WAT)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'fixture'],


        // list of files / patterns to load in the browser
        files: [
            {pattern: 'spec/run/**/*.spec.js'},
            {pattern: 'spec/lib/**/*.js'},
            {pattern: 'spec/src/**/*.js'},
            {pattern: 'spec/fixture/**/*.html'}
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '**/*.html': ['html2js'],
            '**/*.json': ['json_fixtures'],
            'spec/src/**/*.js': ['coverage']
        },

        //plugins
        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-html2js-preprocessor',
            'karma-jasmine',
            'karma-fixture',
            'karma-html2js-preprocessor',
            'karma-json-fixtures-preprocessor',
            'karma-coverage'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            reporters: [
                {type : 'html', dir : 'result/coverage/report-html', subdir: '.'},
                {type : 'lcov', dir : 'result/coverage/lcov', subdir: '.'},
                {type : 'text', dir : 'result/coverage/report-txt', subdir: '.', file: 'text.txt'},
                {type: 'text-summary', dir : 'result/coverage/report-txt', subdir: '.', file: 'text-summary.txt' }
            ]
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome', 'Firefox', 'PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: 1
    })
}
