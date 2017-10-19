# Contributing to these Bing Maps V8 Code Samples #

## Code of Conduct ##

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). 
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or 
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## How to contribute ##

There are a couple of ways you can contribute to this repo:
* **Code Samples**: Have an interesting code sample that others might find useful. Follow the Code Sample Guidelines below and submit a PR! 
* **Ideas, feature requests and sample bugs**: We are open to all ideas, and we want to get rid of bugs! 
Use the [Issues section](https://github.com/Microsoft/Bing-Maps-V8-TypeScript-Definitions/issues) to either report a new issue, 
provide your ideas or contribute to existing threads
* **Documentation**: Found a typo or strangely worded sentences? Submit a PR!

**Note:** If the issue you are experiencing is with the Bing Maps SDK itself, please report in the 
[MSDN forums](https://social.msdn.microsoft.com/Forums/en-US/home?forum=bingmapsajax&filter=alltypes&sort=lastpostdesc), or if you license Bing Maps, 
contact the [Bing Maps Enterprise support team](https://www.microsoft.com/maps/support.aspx).

## Code Sample Guidelines ##

If you would like to submit a code sample, we ask that your sample follows the following guidelines:

* **Align with Terms of Use**: Be sure that your sample aligns with the [Bing Maps terms of use](https://www.microsoft.com/maps/product/terms.html). 
* **Add Useful Samples**: The sample should show something new. Be sure that an existing sample that does the same thing doesn't already exist. 
If it does, feel free to submit improvements to the existing sample.
* **Unique file names**: Ensure that your sample has a unique file name. These are used to create links in the URL to each sample. If more than one sample has the same file name, an warning will be displayed when running the Default.aspx page.
* **Bing Maps Credentials**: Add your Bing Maps key in the web.config file. Be sure to remove your Bing Maps key code before checking in.
* **Keep Consistency**: Create a **map** variable for the map and give your map div an id of **myMap**. This will help keep the samples consistent. This may not make sense for all samples.
* **Folder Structure**: Add your sample to one of the existing folders if one makes sense. If your sample consists of multiple files, create a subfolder to group these files together. 
If you feel a new folder should be created, create one and we will review it.
If you aren't sure which folder to put the sample into, use the **Other** folder. 
If your code is implementing a workaround, hack, proof of concept or uses features only available in the experimental branch of Bing Maps V8, or is not considered ready to be used in production applications, add it to the **Experimental** folder.
* **Large or Complex Samples**: If your sample has a lot of dependencies and consists, more than a few files, or uses languages other than HTML, JavaScript, TypeScript, or CSS, 
consider hosting your code sample in its own GitHub repository or in the [MSDN Code Gallery](https://code.msdn.microsoft.com/) and then add a link in the [ExternalSamples.js](https://github.com/Microsoft/BingMapsV8CodeSamples/tree/master/Samples/ExternalSamples.js) file of this project. 
If a pull request contains a sample that we feel falls into this category we will reach out to you to discuss options.
* **Sample Description**: If your sample is not self explanatory add a description in your HTML that explains what the sample demonstrates or how to use it. 
* **External Dependencies**: If your sample uses external dependencies, using a CDN url when possible rather than adding the code for that library into this project. This will help keep the project clean.  
If you must add the code for an external dependency into this project, please ensure that it uses an MIT license or includes its appropriate license text at the top of its files. 
Also make a note in the sample description of the external dependencies being used. If it is likely that this dependancy will be used by more than one sample (i.e. jQuery), add it to appropriate subfolder of the Common folder.

Please don't be disappointed or offended if we modify your code sample to align with these guidelines. 
