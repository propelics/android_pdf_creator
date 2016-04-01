var PdfCreator = require('com.propelics.pdfcreator');
var Mustache = require('mustache');

var pdfGeneration = (function () {
	/**
	 * @method generateWithWebView
	 * Generates a PDF file based on an HTML File using a webview to load it's data
	 * @param {Object} _params
	 * @param {Ti.UI.View} _params.wrapper View that will contain the WebView to load the HTML (This view should be inside an opened Window)
	 * @param {Ti.Filesystem.File} _params.htmlFile HTML file to load
	 * @param {Object} _params.data Data to parse within the HTML before generating the PDF.
	 * @param {String} [_params.pdfFileName = Date.now()] File name to generate (don't include the '.pdf' extension)
	 * @param {Function} [_params.successCallback] Function to call when the PDF gets generated
	 * @param {Function} [_params.failCallback] Function to call when an error occurs
	 * @return {void}
	 */
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

	/**
	 * @method generateWithWebView
	 * Generates a PDF file based on an HTML Template, will load using mustache.js
	 * @param {Object} _params
	 * @param {Ti.Filesystem.File} _params.htmlFile HTML file to load
	 * @param {Object} _params.data Data to parse within the HTML before generating the PDF.
	 * @param {String} [_params.pdfFileName = Date.now()] File name to generate (don't include the '.pdf' extension)
	 * @param {Function} [_params.successCallback] Function to call when the PDF gets generated
	 * @param {Function} [_params.failCallback] Function to call when an error occurs
	 * @return {void}
	 */
	function generatePDFWithTemplate (_params) {
		_params = _params || {};

		var htmlFile = _params.htmlFile;
		var data = _params.data || {};
		var pdfFileName = (_params.pdfFileName || Date.now()) + '.pdf';
		var successCallback = _params.successCallback;
		var failCallback = _params.failCallback;
		var htmlString = '';

		if (!htmlFile) {
			failCallback && failCallback({
				success : false,
				message : 'No HTML file',
				error : -1
			});
			return;
		}

		PdfCreator.addEventListener('complete', handlePDFComplete);
		PdfCreator.addEventListener('error', handlePDFError);

		htmlString = htmlFile.read().text;
		htmlString = Mustache.render(htmlString, data);

		PdfCreator.generatePDFWithHTML({
			html : htmlString,
			filename : pdfFileName
		});

		function handlePDFComplete (_evt) {
			PdfCreator.removeEventListener('complete', handlePDFComplete);
			PdfCreator.removeEventListener('error', handlePDFError);
			
			evt = _evt || {};
			var originalFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, pdfFileName);
			
			successCallback && successCallback(evt);
		}

		function handlePDFError (_evt) {
			PdfCreator.removeEventListener('complete', handlePDFComplete);
			PdfCreator.removeEventListener('error', handlePDFError);
			
			failCallback && failCallback(_evt);
		}
	};

	

	return {
		generateWithWebView : generateWithWebView,
		generatePDFWithTemplate : generatePDFWithTemplate
	};
})();

module.exports = pdfGeneration;