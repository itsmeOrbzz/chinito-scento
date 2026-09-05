function doGet() {
  return HtmlService
    .createTemplateFromFile("index")
    .evaluate();
}

function include(filename){
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}