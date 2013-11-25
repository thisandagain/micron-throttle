require('hint-hint')(
    __dirname + '/../../!(node_modules)**/*.js', 
    require('../fixtures/jshint.json')
);