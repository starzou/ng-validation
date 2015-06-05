/**
 * @module ngValidationDocs
 * @description ngValidation Documentation
 * @time 2015-06-05 13:00
 * @author StarZou
 **/
(function (window, angular) {
    'use strict';

    var ngValidationDocsModule = angular.module('ngValidationDocs', ['ngValidation']);


    ngValidationDocsModule.controller('AppController', ['$scope', function ($scope) {
        $scope.title = 'ngValidation Documentation and Examples';
    }]);

})(window, window.angular);