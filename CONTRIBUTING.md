# Contributing to these Bing Maps V8 Code Samples #

## Code of Conduct ##

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). 
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or 
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## How to contribute ##

There are a couple of ways you can contribute to this repo:
* **Code Samples**: Have an interesting code sample that others might find useful. Follow the Code Sample Guidelines below and submit a PR! 
* **Ideas, feature requests and sample bugs**: We are open to all ideas and we want to get rid of bugs! 
Use the [Issues section](https://github.com/Microsoft/Bing-Maps-V8-TypeScript-Definitions/issues) to either report a new issue, 
provide your ideas or contribute to existing threads
* **Documentation**: Found a typo or strangely worded sentences? Submit a PR!

**Note:** If the issue you are experiencing is with the Bing Maps SDK itself, please report in the 
[MSDN forums](https://social.msdn.microsoft.com/Forums/en-US/home?forum=bingmapsajax&filter=alltypes&sort=lastpostdesc), or if you license Bing Maps, 
contact the [Bing Maps Enterprise support team](https://www.microsoft.com/maps/support.aspx).

## Code Sample Guidelines ##

If you would like to submit a code sample we ask that your sample follows the following guidelines:

* The sample should show something new. Be sure that an existing sample that does the same thing doesn't already exist. 
If it does, feel free to submit imrpovements to the existing sample.
* Instead of adding a Bing Maps key directly into your code sample, reference in the **BingMapsCredentials.js** file and use the **YourBingMapsKey** variable. 
This will help to ensure that someones Bing Maps key doesn'tacciedntially get checked in. It also makes these samples easier to use as users only have to add their key in one place.
* Create a **map** variable for the map and give your map div an id of **myMap**. This will help keep the samples consistant. This may not make sense for all samples.
* Add your sample to one of the existing folders if one makes sense. If you feel a new folder should be created, create one and we will review it.
If you aren't sure which folder to put the sample into, use the **Other** folder. 
If your code is implementing a workaround, hack, proof of concept or simply an experiment that may not be wise to use in production applicaitons, add it to the **Experimental** folder.

Please don't be disppointed or offended if we modify your code sample to align with these guidelines. 
