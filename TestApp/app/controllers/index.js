var pdfcreator = require("com.propelics.pdfcreator");
var Mustache = require('mustache');

var view = {
  title: "Joe",
  calc: function () {
    return 2 + 4;
  }
};

var output = Mustache.render("{{title}} spends {{calc}}", view);

console.log('output: ' + output);

function doClick(e) {
    alert($.label.text);
}

$.index.open();
