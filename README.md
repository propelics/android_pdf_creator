# PDF Creator
Titanium Native Module (Android) and libraries for generating PDF files based on HTML

## Before you start
* The Android module has been tested with Titanium SDK 5.x and up.
* All the PDF creation is done by iText: http://itextpdf.com
	* `iTextG`, which is a port for Android
	* `XMLWorker` which is intended for parse HTML files into PDF
	* **Important:**  `XMLWorker` does not support the whole subset of CSS styles, for the suppoerted list refer to [their docs](http://demo.itextsupport.com/xmlworker/itextdoc/index.html)
	* iTextG is licensed under `GNU Affero General Public License version 3` and depending on the nature of your app you might need a license. Please visit [license](http://itextpdf.com/pricing/android_license) for details.
  
## Obtaining the module and libs
* Go to the [Releases Tab](https://github.com/propelics/android_pdf_creator/releases).
* `pdfGeneration.js` is optional to use, it contains the basics for generating a PDF file.
	* `pdfGeneration.js` depends on [mustache.js](https://github.com/janl/mustache.js) for parsing templates.
* For iOS, [NappPDFCreator](https://github.com/viezel/NappPDFCreator) is recommended

##PDFCreator Module

### Basic Usage
1. Make sure you have the module dependency added on `tiapp.xml`
	
	```xml
	<module platform="android">com.propelics.pdfcreator</module>
	<module platform="iphone">dk.napp.pdf.creator</module> 
	```

1. Require the module(s) where needed

	```javascript
	var PdfCreator = require('com.propelics.pdfcreator');
	```

1. The usage of the module is based on events: `complete` and `error`.
	* `complete` - Triggered once the PDF has been generated and no errors occured.
	* `error` - Triggered if some error happens, stops the generation of the PDF.
1. The actual PDF creation can be achieved by the methods `generatePDFWithHTML()` or `generatePDFwithWebView()`
	* `generatePDFWithHTML()` -  Parses some HTML string and creates a PDF file from it. Use `XMLWorker` for it. PDF files have the best quality but not all HTML/CSS properties are supported yet.
	* `generatePDFwithWebView()` - Takes a screenshot from a given `Ti.UI.WebView` and divides the resulting image into several pages. PDF files have medium quality and use a lot of space on disk, but supports all the HTML/CSS properties available.

### Example
```javascript
var PdfCreator = require('com.propelics.pdfcreator');
	
PdfCreator.addEventListener("complete", function (_evt) {
	//Handle the PDF created
	var pdfFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, _evt.filename);
	//...
});

PdfCreator.addEventListener("error", function(_evt){
	//An error has ocurred
});

// Generate a PDF based on HTML
PdfCreator.generatePDFWithHTML({
	html : '<html><body><h1>Hello World!</h1></body></html>',
	filename : 'hello.pdf'
});

//Generate a PDF based on a webview
var webview = Ti.UI.createWebView({
	scalesPageToFit : true
});

webview.addEventListener('load', function (e) {
	PdfCreator.generatePDFwithWebView({
		filename : 'hello.pdf',
		webview : webview,
		quality : 100
	});
});

webview.url = 'www.apple.com';
```

## PDFGeneration lib

### Basic Usage
* This lib is intended to handle the common use cases for the PDF module creation. Therefore it depends on the `PDFCreator` module.
* Add `pdfGeneration.js` and `mustache.js` under `app/lib` (for Alloy projects).
* 2 functions are included to generate the PDF files
	* `generateWithWebView()` - Generates a PDF file based on an HTML File using a webview to load it's data. **It does NOT use `PDFCreator.generatePDFwithWebView()`** 
	* `generatePDFWithTemplate()` - Generates a PDF file based on an HTML Template, will load using `mustache.js`
* Both functions take a set of options to generate the PDF.
	* `htmlFile` - File object to load that includes the HTML file to parse
	* `data` - Dictionary with data to be parsed inside the HTML before generating the PDF
	* `sucessCallback` - Function called when the PDF gets generated
	* `failCallback` - Function called if an error occurs

### Example
```javascript
var PdfGeneration = require('pdfGeneration');

// Workaround to load images
var imageFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'image.jpg');
var imgTemp = Ti.Filesystem.createTempFile();
imgTemp.write(imageFile.read());

PdfGeneration.generateWithWebView({
	// Name of the PDF file to create
	pdfFileName : 'webview',
	// File containing the html to load
	htmlFile : Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'webview.html'),
	// A view to contain the Webview (should be inside an opened Window)
	wrapper : $.index,
	// Data to parse
	data : {
		customerName : 'John Doe',
		image : imgTemp.resolve().replace('file:', '')
	},
	successCallback : function (_data) {
		// The PDF was created
	},
	failCallback : function (_data) {
		// An error occured
	}
});

PdfGeneration.generatePDFWithTemplate({
	// Name of the PDF file to create
	pdfFileName : 'template',
	// File containing the html to load
	htmlFile : Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'template.html'),
	// Data to parse
	data : {
		customerName : 'John Doe',
		image : imgTemp.resolve().replace('file:', '')
	},
	successCallback : function (_data) {
		// The PDF was created
	},
	failCallback : function (_data) {
		// An error occured
	}
});
```

### Notes for loaing PDF files
* In order to load images, the absolute path for the images is needed under the `src` attribute.
* CSS styles should be loaded within the HTML file.
* Only the system fonts are supported. If the `font-face` includes an specific name, it will take more time to load that using `serif` or `sans-serif`