Feature('Initial Display');

Scenario('checkTextHelloWorld_test', async (I) => {
  I.seeAppIsInstalled("com.example.uitestsample");
  I.see('UITest Sample App', '//hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.LinearLayout/android.view.ViewGroup/android.widget.TextView');
  I.see('Hello World!!', '#com.example.uitestsample:id/main_content_text');
});
