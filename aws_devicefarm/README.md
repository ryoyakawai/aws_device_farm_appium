# Script to execute E2E test on AWS Device Farm with CodeceptJS and Appium

## What's this?
This repository is containing script to execute E2E Test by CodeceptJS and Appium on AWS Device Farm.

## Requirements
Detailed steps are written as much as possible, however steps are  not always written in detail in step by step. So to follow this instruction, basic knowledge of basic usage of AWS and unix command are required.

- **AWS**
  - Having AWS account.
  - Having the privilege of to use AWS Device Farm with full access already or the account that is allowed to create a new user without any of restrictions.

- **Skills**
  - Having good standing of in both be modifying and understand YAML format file by text editor.
  - Having good standing of in doing something in terminal instead of using GUI.
  - Having the experiences both shell script and Node.JS/JavaScript .

- **System Requirements**
  - Node.JS : > v10.x.x 
  - npm : > 6.x.x
  - Having met all of the requirements that aws-sdk(npm package) requires to use.

## Steps

### 1. Account previledge
Make sure your account have a privilege of to use AWS DeviceFarm with full access or create a new IAM User which has the privilege of AWS Device Farm with full access.  
- AWS Devic eFarm with full access:
  - Policy ARN: `arn:aws:iam::aws:policy/AWSDeviceFarmFullAccess`
  - Description: Provides full access to all AWS Device Farm operations.

### 2. Create new project
Create a new project from top page of the top page of the Device Farm console.  
- Console URL -> https://us-west-2.console.aws.amazon.com/devicefarm/home?#/projects 

### 3. Create device pool
Device Pool is a user defined set of devices that uses for you test.

1. Go to you project that have just created in (2)
2. Click the link of “⚙ Project settings” on right top in the project page.
3. Go to “Device pools” tab to create device pool.

### 4. Prepare target application and test script

### 5. Prepare test spec (YAML file)
One of typical sample template `uitest_sample_appium_test_spec_00.yml` is located under the directory named  `./test_specs`. 

For other parameters in this template, those might not necessary to be modified for execution.

### 6. Update configurations
The configuration file is `scheduletest_config_devicefarm.js`. Update to match the environment to execute script.  
  
Parameters' detail are listed below. 

- `aws_region` : (does not need to be updated since 'us-west-2' is the only region where DeviceFarm is provided as of July 2020)
- `aws_access_user_arn_id`: ARN or account ID of the user that confirmed/is created at (0)
- `aws_access_key_id` : access key of your own aws account [[*1]](#anchor-01)
- `aws_secret_access_key` : secret access key of your own aws account [[*1]](#anchor-01)
- `aws_devicefarm_project_arn ` :  
  - Get use id of the use have just been prepared in [Step 1](#1-account-previledge). 
  - Go to project page and see the url. The project id is displayed between the path  “projects” and “runs”.   
  **e.g) Suppose the url is**  
  Suppose the project id is `22d13d5c-6e34-4048-xxxx-b3aadbde00bb`, then the URL would be something like this `https://us-west-2.console.aws.amazon.com/devicefarm/home?#/projects/22d13d5c-6e34-4048-xxxx-b3aadbde00bb/runs`, 

- `project_name` : specify project name that have just created in [Step 2](#2-create-new-project)
- `device_pool_name` : specify device pool name that have just created in [Step 3](#3-create-device-pool)
- `app_file_name_path` : relative path to the application file that have just been prepared in [Step 4](#4-prepare-target-application-and-test-script)
- `test_script_file_name_path` : relative path to the test script file that have just been prepared in [Step 5](#5-prepare-test-spec-yaml-file)
- `test_spec_file_name_path` : relative path to the test spec file that have just been prepared in [Step 6](#6-update-configurations)

<a name="anchor-01"><b>[*1]</b></a> Get one pair of these from security credentials page( https://console.aws.amazon.com/iam/home?#security_credential ). Under the selection of “Access keys for CLI, SDK, & API access”, there are button of “Create access key”. That can be created from here.


### 8. Schedule to execute(to run)


> **!! NOTICE !!**  
> Before schedule to execute, make sure all of node packages are install by the command below in both `uitest_sample_appium` and `./aws_devicefarm` directory.
>
> ```bash
> $ pwd
> [hoge]/aws_devicefarm
> $ npm install
>```

Use command below for scheduling to execute test on AWS Devicefarm.

```bash
$ pwd
[hoge]/aws_devicefarm
$ node ./scheduletest_exec_devicefarm.js
```

### 9. To get execution status and its result
Go to your project from AWS console. The status of test that have just been scheduled should being listed there. 

### 10. Reference

- [Mobile Testing with Appium | CodeceptJS](https://codecept.io/mobile/)
- [Desired Capabilities - Appium](http://appium.io/docs/en/writing-running-appium/caps/)
- [Class: AWS.DeviceFarm — AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html)

## License

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
- [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)
- Copyright 2020 © Ryoya Kawai



