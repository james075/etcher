// TODO: Use https://www.npmjs.com/package/angular-bind-html-compile-ci-dev

'use strict';

module.exports = ($compile) => {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.$watch(function() {
        return scope.$eval(attrs.bindHtmlCompile);
      }, function(value) {

        // In case value is a TrustedValueHolderType, sometimes it
        // needs to be explicitly called into a string in order to
        // get the HTML string.
        element.html(value && value.toString());

        // If scope is provided use it, otherwise use parent scope
        let compileScope = scope;
        if (attrs.bindHtmlScope) {
          compileScope = scope.$eval(attrs.bindHtmlScope);
        }
        $compile(element.contents())(compileScope);
      });
    }
  };
};
