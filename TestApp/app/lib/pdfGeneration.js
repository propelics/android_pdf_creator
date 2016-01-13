var PdfCreator = require('com.propelics.pdfcreator');

var pdfGeneration = (function () {

	function generateWithWebView (_params) {
		_params = _params || {};
		
		var htmlFile = _params.htmlFile;
		var data = _params.data || {};
		var pdfFileName = (_params.pdfFileName || Date.now()) + '.pdf';
		var successCallback = _params.successCallback;
		var failCallback = _params.failCallback;
		var wrapper = _params.wrapper;
		
		var webViewUpdateTimeout =  null;
		var webView = null;
		
		Ti.App.addEventListener('app:webViewUpdated', handleWebViewUpdated);
		PdfCreator.addEventListener('complete', handlePDFComplete);
		PdfCreator.addEventListener('error', handlePDFError);

		generate();
		
		function generate () {
			if (!htmlFile) {
				Ti.App.removeEventListener('app:webViewUpdated', handleWebViewUpdated);
				PdfCreator.removeEventListener('complete', handlePDFComplete);
				PdfCreator.removeEventListener('error', handlePDFError);

				failCallback && failCallback({
					success : false,
					message : 'No HTML file',
					error : -1
				});
				return;
			}

			var htmlBlob = htmlFile.read();
			var html = htmlBlob ? htmlBlob.text : '';

			webView = Ti.UI.createWebView({
				scalesPageToFit : true,
				width : Ti.UI.FILL,
				height : Ti.UI.FILL,
				html : html
			});

			webView.addEventListener('load', handleWebViewLoad);

			wrapper.add(webView);
		}

		function handleWebViewLoad (_evt) {
			webView.removeEventListener('load', handleWebViewLoad);
			Ti.App.fireEvent('app:webViewParse', data);

			
			//If after 5 secs the webView hasn't finished, force it to finish
			webViewUpdateTimeout = setTimeout(function () {
				handleWebViewUpdated({
					error : true
				})
			}, 5000);
		}

		function handleWebViewUpdated (_evt) {
			_evt = _evt || {};
			
			clearTimeout(webViewUpdateTimeout);
			Ti.App.removeEventListener('app:webViewUpdated', handleWebViewUpdated);

			wrapper.remove(webView);

			if (_evt.error) {
				PdfCreator.removeEventListener('complete', handlePDFComplete);
				PdfCreator.removeEventListener('error', handlePDFError);
				webView.removeEventListener('load', handleWebViewLoad);

				failCallback && failCallback({
					success : false,
					message : 'An error ocurred generating the PDF.',
					error : _evt.error
				});
			} else {
				var htmlString = _evt.html || webView.html || '';

				PdfCreator.generatePDFWithHTML({
					html : htmlString,
					filename : pdfFileName
				});
			}

			wrapper = null;
			webView = null;
			webViewUpdateTimeout = null;
		}

		function handlePDFComplete (_evt) {
			Ti.App.removeEventListener('app:webViewUpdated', handleWebViewUpdated);
			PdfCreator.removeEventListener('complete', handlePDFComplete);
			PdfCreator.removeEventListener('error', handlePDFError);
			
			evt = _evt || {};
			var originalFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, pdfFileName);
			
			successCallback && successCallback(evt);
		}

		function handlePDFError (_evt) {
			Ti.App.removeEventListener('app:webViewUpdated', handleWebViewUpdated);
			PdfCreator.removeEventListener('complete', handlePDFComplete);
			PdfCreator.removeEventListener('error', handlePDFError);
			
			failCallback && failCallback(_evt);
		}
	};

	

	return {
		generateWithWebView : generateWithWebView
	};
})();

module.exports = pdfGeneration;