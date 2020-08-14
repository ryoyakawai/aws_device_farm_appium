"use strict";
/*
 *
 * [Class: AWS.DeviceFarm — AWS SDK for JavaScript]
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html
 *
 **/

const ARCHIVER = require("archiver");
const FS = require('fs');

module.exports = class GenerateZip {
//export default class GenerateZip {
  constructor() {
    this.archiver = ARCHIVER
    this.fs = FS
  }

  compresszip(workingdir = './', file_to_include = [], zip_filename_path = `./sample_${new Date().getTime()}.zip`) {
    return new Promise( (resolve, reject) => {
      const zip_file_name_path = zip_filename_path;
      const dir_to_back = process.cwd()
      process.chdir(workingdir);

      let archive = this.archiver.create('zip', {});
      let output = this.fs.createWriteStream(zip_file_name_path);
      archive.pipe(output);

      file_to_include.forEach( item => {
        archive.glob(item);
      })

      // execute to compress to zip
      archive.finalize();
      output.on('close', () => {
        process.chdir(dir_to_back);
        return resolve({
          success: true,
          data: this.archive
        })
      })
      archive.on('warning', (err) => {
        process.chdir(dir_to_back);
        if(err.code === 'ENOENT') {
          return resolve({
            success: true,
            message:err,
            data: this.archive,
          })
        } else {
          return reject({
            success: false,
            data: err
          })
        }
      })
      archive.on('end', () => {
        process.chdir(dir_to_back);
        return resolve({
          success: true,
          message:'[MSG] Data has been drained',
          data: this.archive
        })
      })
      archive.on('error', (err) => {
        process.chdir(dir_to_back);
        return reject({
          success: false,
          data: err
        })
      })

    })
  }

}
