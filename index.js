#!/usr/bin/env node
var assetSyne = require('./bin/assetSync');
var program = require('commander');
  
program.version('v' + require('./package.json').version)  
       .description(require('./package.json').description);

program.parse(process.argv);
  
if (program.args.length === 0) {  
       assetSyne.run();
}
