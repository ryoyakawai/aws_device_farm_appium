Feature('Check Reset Feature');

// prepend '/' for to use xpath
// prepend '#' for to use id

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

Scenario('checkIncButtonResetButtonInMenu_test', async (I) => {
  I.seeAppIsInstalled("com.example.uitestsample");
  I.see('Hello World!!', '#com.example.uitestsample:id/main_content_text');
  let tap_count = 5
  for(let i=0; i<tap_count; i++) {
    let counter = i + 1;
    await I.tap('#com.example.uitestsample:id/increment_fab_text');
    // to Handle permission window
    if(i==0) {
      await I.tap('#com.android.permissioncontroller:id/permission_allow_button');
    }
    await sleep(2000);
  }
  I.see(tap_count, '#com.example.uitestsample:id/main_content_text');
  await I.tap('//android.widget.ImageView[@content-desc="More options"]');
  await I.tap('Reset Counter');
  I.see('0', '#com.example.uitestsample:id/main_content_text');
});

