angular.module('templates-dist', ['index.html']);

angular.module("index.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("index.html",
    "<!DOCTYPE html>\n" +
    "<html lang=\"en\">\n" +
    "<head>\n" +
    "    <meta charset=\"UTF-8\">\n" +
    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
    "    <title>Document</title>\n" +
    "    <script type=\"text/javascript\" src=\"../bower_components/angular/angular.min.js\"></script>\n" +
    "</head>\n" +
    "<body>\n" +
    "    \n" +
    "</body>\n" +
    "</html>");
}]);
