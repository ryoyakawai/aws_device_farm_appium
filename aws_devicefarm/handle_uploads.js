"use strict";

let delete_all_uploads = false
console.log(`===============================`)
console.log(` [List uploads and delete with parameter] \n`)
if(process.argv[2] == 'delete') {
  console.log(' !!!! [DELEE] all of uploads !!!!')
  delete_all_uploads = true
} else {
  console.log(` >>>> [INFO] add "delete" to 1st parameter to delete all of uploads.`)
}
console.log(`===============================\n`)

const fetch = require('node-fetch');
const fs = require('fs-extra');
const AWSDeviceFarmWrapper = require('./libs/awsdevicefarmwarpper.js');
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

  // main
  // // check project existance
  const target_project = {
    aws_devicefarm_project_arn: aws_devicefarm_project_arn
  }
  const AWSSDK = new AWSDeviceFarmWrapper(aws_region, aws_access_key_id)
  console.log(' >>> Start accessing AWS Device Farm <<< ')
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

    let list_uploads_params = {
      arn: aws_devicefarm_project_arn
    }
    let uploads_list = await AWSSDK.listUploads(list_uploads_params)
    if(uploads_list.success == false) {
      throw new Error('[ERROR] Error occured during geting uploads list')
    }
    let item_count = {
      privated: 0,
      deleted: 0,
      curated: 0
    }

    for(let i=0; i<uploads_list.data.length; i++) {
      let item = uploads_list.data[i]
      if(item.category == 'PRIVATE') {
        item_count.privated += 1
        console.log(item)
        if(delete_all_uploads) {
          let delete_upload_params = {
            arn: item.arn
          }
          let res_deleteUpload = await AWSSDK.deleteUpload(delete_upload_params)
          if(res_deleteUpload.success == false) {
            console.error(`[FAIL] Fail to delete. arn=[${item.arn}]`)
          } else {
            item_count.deleted += 1
            console.log(`[SUCCESS] Success to delete. arn=[${item.arn}]`)
          }
        }
      } else {
        item_count.curated += 1
      }
    }
    console.log(`\n << UPLOADS COUNT >>`)
    console.log(`    [PRIVATE] ${item_count.privated} (DELETED: ${item_count.deleted})`)
    console.log(`    [CURATED] ${item_count.curated}\n`)
    console.log(` >> COMPLETED <<\n`)
  } catch(err) {
    console.log('[ERROR]')
    console.log(JSON.stringify(err))
    console.trace(err)
  }


})()
