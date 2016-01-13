var PdfGeneration = require('pdfGeneration');

function doClick(e) {
    alert($.label.text);
}

$.index.open();

var imageFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'image.jpg');
var imgTemp = Ti.Filesystem.createTempFile();
imgTemp.write(imageFile.read());

PdfGeneration.generateWithWebView({
	htmlFile : Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'webview.html'),
	wrapper : $.index,
	data : {
		customerName : 'John Doe',
		image : imgTemp.resolve().replace('file:', '')
	},
	successCallback : function (_data) {
		console.log('SUCCESS!');
		console.log('_data: ' + JSON.stringify(_data, null, '\t'));
	},
	failCallback : function (_data) {
		console.log('FAILURE!');
		console.log('_data: ' + JSON.stringify(_data, null, '\t'));
	}
});