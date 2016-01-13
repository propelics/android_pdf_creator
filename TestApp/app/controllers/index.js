var PdfGeneration = require('pdfGeneration');

function doClick(e) {
    alert($.label.text);
}

$.index.open();

PdfGeneration.generateWithWebView({
	htmlFile : Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'index.html'),
	wrapper : $.index,
	successCallback : function (_data) {
		console.log('SUCCESS!');
		console.log('_data: ' + JSON.stringify(_data, null, '\t'));
	},
	failCallback : function (_data) {
		console.log('FAILURE!');
		console.log('_data: ' + JSON.stringify(_data, null, '\t'));
	}
});