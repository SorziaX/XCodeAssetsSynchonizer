#!/usr/bin/env node
var assetSyne = require('./bin/assetSync');
var program = require('commander');
  
program.version('v' + require('./package.json').version)  
       .description(require('./package.json').description)
       .option('-d, --directory [directory]', 'set directory directly')

program.parse(process.argv);
  
console.log(program.directory);
assetSyne.run(program.directory);
