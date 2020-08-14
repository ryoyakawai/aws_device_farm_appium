const target_filename = 'codecept.android.conf.json';

///////
const fs = require('fs')
const path_to_codecept_json = `${process.cwd()}/${target_filename}`;
const obj_codecept_json = JSON.parse(fs.readFileSync(path_to_codecept_json, 'utf8'));
exports.config = obj_codecept_json;

