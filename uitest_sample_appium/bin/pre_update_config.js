'use strict'

/**
 * [command]
 */

const target_filename = 'codecept.android.conf.json'
console.log('')
console.log('-----')
console.log(` [target file] ${target_filename}`)
console.log('-----')
console.log('')

const process_argv = process.argv
const env_params = process.env

try {
  const fs = require('fs')
  const path_to_config_json = `${process.cwd()}/${target_filename}`
  const obj_config_json = JSON.parse(fs.readFileSync(path_to_config_json, 'utf8'));

  let DEVICEFARM_LOG_DIR = null
  let DEVICEFARM_APP_PATH = null
  let DEVICEFARM_DEVICE_PLATFORM_NAME = null
  let DEVICEFARM_DEVICE_NAME = null
  if(process.argv.length == 4 + 2) {
    if(process.argv[2] != 'undefined') {
      DEVICEFARM_LOG_DIR = process.argv[2]
      obj_config_json.output = DEVICEFARM_LOG_DIR
    }

    if(process.argv[3] != 'undefined') {
      DEVICEFARM_APP_PATH = process.argv[3]
      obj_config_json.helpers.Appium.app = DEVICEFARM_APP_PATH
    }

    if(process.argv[4] != 'undefined') {
      DEVICEFARM_DEVICE_PLATFORM_NAME = process.argv[4]
      obj_config_json.helpers.Appium.desiredCapabilities.platformName = DEVICEFARM_DEVICE_PLATFORM_NAME
    }

    if(process.argv[5] != 'undefined') {
      DEVICEFARM_DEVICE_NAME = process.argv[5]
      obj_config_json.helpers.Appium.desiredCapabilities.deviceName = DEVICEFARM_DEVICE_NAME
      obj_config_json.helpers.Appium.desiredCapabilities.udid = DEVICEFARM_DEVICE_NAME
    }
  }

  // convert path in relative format in app_relative to absolute
  if(DEVICEFARM_APP_PATH == null)  {
    if(typeof obj_config_json.helpers.Appium.app_relative != "undefined") {
      if(obj_config_json.helpers.Appium.app_relative.match(/^\.\/|^\.\.\//) != null
         && obj_config_json.helpers.Appium.app_relative.match(/^http|^https/) == null) {
        // // // //
        obj_config_json.helpers.Appium.app =
          `${process.cwd()}/${obj_config_json.helpers.Appium.app_relative}`
          console.log(`[OVERRIDE] helper.Appium.app=[${obj_config_json.helpers.Appium.app}] helper.Appium.app_relative=[${obj_config_json.helpers.Appium.app_relative}]`)
      } else {
        throw new Error(`[COVERT TO APP] app_relative must be started from './' or '../'. apk_relative=[${obj_config_json.helpers.Appium.app_relative}]`)
      }
    }
  }

  // set mocha's report dir
  if(typeof obj_config_json.output != "undefined") {
    if(typeof obj_config_json.mocha != "undefined") {
      obj_config_json.mocha = {}
    }
    obj_config_json.mocha = { "reporterOptions": { "reportDir" : obj_config_json.output }}
    console.log(`[OVERRIDE] helpers.mocha=[${JSON.stringify(obj_config_json.mocha)}]`)
  }

  // print config.android.json
  console.log('-----')
  console.log(' [reviced config.android.json]', obj_config_json)
  console.log(' [reviced config.android.json > desiredCapabilities]', obj_config_json.helpers.Appium.desiredCapabilities)
  console.log('-----')

  fs.writeFileSync(path_to_config_json, JSON.stringify(obj_config_json, null, '  '), {encoding:'utf8',flag:'w'})
} catch(e) {
  console.log(`[ERROR] codecept.android.conf.json (${JSON.stringify(e, null, ' ')})`)
}
