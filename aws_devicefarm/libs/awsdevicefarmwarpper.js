"use strict";
/*
 *
 * [Class: AWS.DeviceFarm — AWS SDK for JavaScript]
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html
 *
 **/

const AWS_SDK = require("aws-sdk");

module.exports = class AWSDeviceFarmWrapper {
//export default class AWSDeviceFarmWrapper {

  constructor(aws_region, aws_access_key_id, device_farm_api_version='2015-06-23') {
    this.AWS = AWS_SDK
    this.AWS.config.region = aws_region
    this.AWS.config.credentials.accessKeyId = aws_access_key_id
    this.DFM = new this.AWS.DeviceFarm({apiVersion: device_farm_api_version});
  }

  init() {
    return new Promise( (resolve, reject) => {
      this.AWS.config.getCredentials((err) => {
        if (err) {
          console.error(err.stack)
          return reject()
        } else {
          console.log(" > Access key:", this.AWS.config.credentials.accessKeyId)
          console.log(" > Region: ", this.AWS.config.region)
          return resolve({successs: true})
        }
      });
    })
  }

  listProjects(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.listProjects(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          return reject({success: false, data: null})
        } else {
          return resolve({success: true, data: data.projects})
        }
      })
    })
  }

  createDevicePool(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.createDevicePool(params, (err, data) => {
        if (err) {
          console.log(err, err.stack); // an error occurred
          return reject({success: false, data: null})
        } else {
          return resolve({success: true, data: data})
        }
      });
    })
  }

  listDevicePools(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.listDevicePools(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject({ success: false, data: null })
        } else {
          resolve({success: true, data: data.devicePools})
        }
      })
    })
  }

  deleteDevicePool(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.deleteDevicePool(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject({ success: false, data: null })
        } else {
          console.log(data);           // successful response
          resolve({ success: true, data: data })
        }
      })
    })
  }

  listDevices(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.listDevices(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject({ success: false, data: null })
        } else {
          resolve({success: true, data: data.devicePools})
        }
      })
    })
  }

  scheduleRun(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.scheduleRun(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject({ success: false, data: null })
        } else {
          resolve({ success: true, data: data })
        }
      })
    })
  }

  listUploads(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.listUploads(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject({ success: false, data: null })
        } else {
          resolve({ success: true, data: data.uploads })
        }
      })
    })
  }

  getUpload(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.getUpload(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject({ success: false, data: null })
        } else {
          //console.log(data);           // successful response
          resolve({ success: true, data: data })
        }
      })
    })
  }

  createUpload(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.createUpload(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject({ success: false, data: null })
        } else {
          //console.log(data);           // successful response
          resolve({ success: true, data: data.upload })
        }
      })
    })
  }

  deleteUpload(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.deleteUpload(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject({ success: false, data: null })
        } else {
          //console.log(data);           // successful response
          resolve({ success: true, data: data.upload })
        }
      })
    })
  }

  listJobs(params = null) {
    return new Promise( (resolve, reject) => {
      this.DFM.listJobs(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject({ success: false, data: null })
        } else {
          //console.log(data);           // successful response
          resolve({ success: true, data: data })
        }
      })
    })
  }
/*
    getDevicePoolCompatibility(params = null) {
      return new Promise( (resolve, reject) => {
        this.DFM.getDevicePoolCompatibility(params, function(err, data) {
          if (err) {
            console.log(err, err.stack); // an error occurred
            reject({ success: false, data: null })
          } else {
            console.log(data);           // successful response
            resolve({ success: true, data: data })
          }
        })
      })
    }
*/

}

