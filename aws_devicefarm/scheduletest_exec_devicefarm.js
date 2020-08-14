"use strict";
/*
 *
 * [Getting Started in Node.js - AWS SDK for JavaScript]
 * https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html
 *
 *
 * [AWS Device Farm APIでプロジェクト情報を取得する - horie1024の日記]
 * http://horie1024.hatenablog.com/entry/2015/08/30/005932
 *
 **/

const AWSDeviceFarmWrapper = require('./libs/awsdevicefarmwarpper.js');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const GenerateZip = require('./libs/generatezip.js');
const params = require('./scheduletest_config_devicefarm.js');

(async () => {
  const aws_region = params.aws_region
  const aws_access_user_arn_id = params.aws_access_user_arn_id
  const aws_access_key_id = params.aws_access_key_id
  const aws_secret_access_key = params.aws_secret_access_key

  const aws_devicefarm_project_id = params.aws_devicefarm_project_id
  const project_name = params.project_name
  const device_pool_name = params.device_pool_name
  const app_file_name_path = params.app_file_name_path
  const test_script_dir = params.test_script_dir
  const test_spec_file_name_path = params.test_spec_file_name_path

  // // // // // fixed parameters
  const test_execution_type = params.test_execution_type
  const pixel_3_XL_arn = params.pixel_3_XL_arn
  // // // // //

  // // // // // convert/create parameters upon its necessity
  const aws_access_user_id = params.aws_access_user_arn_id.replace(/^arn:aws:iam::/, '').split(':').shift(); // account id of AWS
  const current_working_dir = process.cwd()
  const app_file_name = params.app_file_name_path.split('/').slice().pop()
  const test_spec_file_name = params.test_spec_file_name_path.split('/').slice().pop()
  const aws_devicefarm_project_arn = `arn:aws:devicefarm:${aws_region}:${aws_access_user_id}:project:${aws_devicefarm_project_id}`
  // // // // //

  const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

  // creating zip file from test script dir
  const genzip = new GenerateZip()
  const dir_name_to_store_preparedfiles = params.dir_name_to_store_preparedfiles
  const arr_file_to_zip = params.arr_file_to_zip

  const path_name_to_store_preparedfiles = `${current_working_dir}/${dir_name_to_store_preparedfiles}`
  const test_script_file_name_path = `${path_name_to_store_preparedfiles}/${app_file_name_path.split('/').slice().pop().replace('.', '_')}_test_script.zip`
  // generate directory if not exist
  if (!fs.existsSync(test_script_file_name_path)) {
    fs.mkdirSync(test_script_file_name_path, { recursive: true });
  }
  // remove before generate zip file
  if (fs.existsSync(test_script_file_name_path)) {
    fs.removeSync(test_script_file_name_path)
  }
  const test_script_file_name = test_script_file_name_path.split('/').slice().pop()
  let generate_zip_res = await genzip.compresszip(test_script_dir, arr_file_to_zip, test_script_file_name_path)
  if(generate_zip_res.success == false) {
    console.log('[ERROR] Durinig generating zip file from test scripts')
    throw new Error(generate_zip_res.data)
  }
  console.log(test_script_file_name_path)


  // main
  // // check project existance
  const target_project = {
    aws_devicefarm_project_arn: aws_devicefarm_project_arn
  }
  const AWSSDK = new AWSDeviceFarmWrapper(aws_region, aws_access_key_id)
  console.log(' >>> start scheduling a running test on aws devicefarm <<< ')
  try {
    await AWSSDK.init()

    const list_projects_params = {
      arn: aws_devicefarm_project_arn
    }
    let projects = await AWSSDK.listProjects(list_projects_params)
    if(projects.success == false) {
      throw new Error(projects)
    }
    projects.data.forEach((val, key) => {
      if(val.name == project_name) {
        target_project.project = {
          arn: val.arn,
          name: val.name
        }
      }
    })

    // // check device pool existence
    // // and if does not exists create one with Pixel 3
    const list_device_pool_params = {
      type: "PRIVATE", // {"PRIVATE", "CURATED"}
      arn: aws_devicefarm_project_arn
    }
    let device_pools = await AWSSDK.listDevicePools(list_device_pool_params)
    if(device_pools.success == false) {
      throw new Error(device_pools)
    }
    for(let i=0; i<device_pools.data.length; i++) {
      // delete pool if no devices are existing
      if(device_pools.data[i].rules.length == 0) {
        await AWSSDK.deleteDevicePool({ arn: device_pools.data[i].arn })
      } else {
        if(device_pools.data[i].name == device_pool_name) {
          target_project.devicepool = {
            arn: device_pools.data[i].arn,
            name: device_pools.data[i].name
          }
        }
      }
    }
    if(Object.keys(target_project.devicepool).length < 1) {
      const create_devicepool_params = {
        name: device_pool_name,
        projectArn: aws_devicefarm_project_arn,
        rules: [ pixel_3_XL_arn ],
        description: '',
        maxDevices: '1'
      }
      let device_pool = await AWSSDK.createDevicePool(create_devicepool_params)
      if(device_pool.success) {
        console.log(device_pool)
      }
    }

    const excludeNotTarget = (arr_data, _app_file_name = null) => {
      let ret_result = []
      let cnt = arr_data.length - 1
      while(cnt >= 0) {
        if(arr_data[cnt].status == 'SUCCEEDED'
           && arr_data[cnt].category == 'PRIVATE'
           && arr_data[cnt].name == _app_file_name) {
          ret_result.push(arr_data[cnt])
        }
        cnt -= 1
      }
      return ret_result
    }

    const getTargetsAsList = (arr_data, _app_file_name = null) => {
      let ret_result = []
      let cnt = arr_data.length - 1
      let _newest = 0
      while(cnt >= 0) {
        if(arr_data[cnt].status == 'SUCCEEDED'
           && arr_data[cnt].category == 'PRIVATE'
           && arr_data[cnt].name == _app_file_name) {
          let _current = new Date(arr_data[cnt].created).getTime()
          if(_current > _newest) {
            _newest = _current
            ret_result.push(arr_data[cnt])
          }
        }
        cnt -= 1
      }
      return ret_result
    }

    const getNewestTarget = (arr_data, _app_file_name = null) => {
      let ret_result = {}
      let cnt = arr_data.length - 1
      let _newest = 0
      while(cnt >= 0) {
        if(arr_data[cnt].status == 'SUCCEEDED'
           && arr_data[cnt].category == 'PRIVATE'
           && arr_data[cnt].name == _app_file_name) {
          let _current = new Date(arr_data[cnt].created).getTime()
          if(_current > _newest) {
            _newest = _current
            ret_result = arr_data[cnt]
          }
        }
        cnt -= 1
      }
      return ret_result
    }

    // // upload application file
    let app_upload_response = await removeAndUploadFile(target_project, app_file_name_path, 'ANDROID_APP')
    if(app_upload_response.success) {
      target_project.app = app_upload_response.data
    } else {
      throw Error(`[ERROR] Uplodad application file failed. ${app_upload_response.success.message}`)
    }

    // // upload TestPackage zip file
    let test_package_upload_response = await removeAndUploadFile(target_project, test_script_file_name_path, `${test_execution_type}_TEST_PACKAGE`)
    if(test_package_upload_response.success) {
      target_project.test_package = test_package_upload_response.data
    } else {
      throw Error(`[ERROR] Uplodad test package file failed. ${app_upload_response.success.message}`)
    }

    //　// upload TestSpec(*.yml)
    let test_spec_upload_response = await removeAndUploadFile(target_project, test_spec_file_name_path, `${test_execution_type}_TEST_SPEC`)
    if(test_spec_upload_response.success) {
      target_project.test_spec = test_spec_upload_response.data
    } else {
      throw Error(`[ERROR] Uplodad test spec file failed. ${app_upload_response.success.message}`)
    }

    // // print configuration
    console.log(target_project)
    console.log('-------------------------')

    // // schedule of test execution
    let schedule_run_param = {
      name: `${app_file_name}-${test_spec_file_name}-${(new Date()).getTime()}`,
      devicePoolArn: target_project.devicepool.arn,
      projectArn: target_project.project.arn,
      appArn: target_project.app.arn,
      test: {
        type: 'APPIUM_NODE',
        testPackageArn: target_project.test_package.arn,
        testSpecArn: target_project.test_spec.arn,
      }
    }
    console.log(schedule_run_param)

    let result = await AWSSDK.scheduleRun( schedule_run_param )
    console.log(result)

    /*
     * Upload file to designated storage by DeviceFarm
     *
     * use for these files：application, test_script, test_specs
     *
     **/
    async function removeAndUploadFile(target_project, filename_path, target_type) {
      const app_file_name = filename_path.split('/').slice().pop()
      let response = {}

      // for application/zip file (e.g: hoge.apk)
      // [scinario] delete the file first, when the file exists in same name
      const list_uploaded_params = {
        arn: target_project.aws_devicefarm_project_arn,
        type: target_type
      }
      let list_uploaded_android_app = await AWSSDK.listUploads( list_uploaded_params )
      let _list_of_remove_target = getTargetsAsList(list_uploaded_android_app.data, app_file_name)

      // > delete the file first, when the file exists in same name
      if(_list_of_remove_target.length > 0) {
        for(let i=0; i<_list_of_remove_target.length; i++) {
          let item = _list_of_remove_target[i]
          let param = {
            arn: item.arn
          }
          await AWSSDK.deleteUpload( param )
        }
      }

      // > upload application/zip file to designated storage
      const create_upload_params = {
        name: app_file_name,
        projectArn: target_project.project.arn,
        type: target_type,
      }
      let create_upload_res = await AWSSDK.createUpload(create_upload_params)
      if(create_upload_res.success == false) {
        throw new Error(create_upload_res)
      }
      if(create_upload_res.data.status == 'INITIALIZED') {
        const file_for_uploading = fs.readFileSync(filename_path)
        console.log(' >>> starting upload file <<< ')
        console.log(` > file=[${filename_path}]  type=[${target_type}]`)
        let fetch_result = await fetch(create_upload_res.data.url, { method: 'PUT', body: file_for_uploading })
        if(fetch_result.status != 200) {
          let param = {
            arn: create_upload_res.data.arn
          }
          await AWSSDK.deleteUpload( param )
          throw new Error({success: false, message: '[ERROR:UPLOAD] something went wrong during upload', data: null})
        }
        for(let i=0; i<20; i++) {
          list_uploaded_android_app = await AWSSDK.listUploads( list_uploaded_params )
          // > filter perfectly the target with arn
          list_uploaded_android_app.data.forEach( item => {
            if(item.arn == create_upload_res.data.arn) {
              response = item
            }
          })
          if(response.status == 'SUCCEEDED') {
            break
          } else if(response.status == 'FAILED') {
            return {success: false, message: response.metadata, data: null}
          } else {
            await sleep(500)
          }
        }
      }
      return {success: true, data: response}
    }


  } catch(err) {
    console.log('[ERROR]')
    console.log(JSON.stringify(err))
    console.trace(err)
  }


})()
