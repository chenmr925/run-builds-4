#!/usr/bin/env node
const RunBuilds = require("../lib/RunBuilds.js");

var runBuilds = new RunBuilds(process.cwd(), process.argv);
runBuilds.run().catch(err => {
	console.error(err);
  	process.exit(1)
});
