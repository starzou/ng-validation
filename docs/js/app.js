/**
 * @module ngValidationDocs
 * @description ngValidation Documentation
 * @time 2015-06-05 13:00
 * @author StarZou
 **/
(function (window, angular) {
    'use strict';

    var ngValidationDocsModule = angular.module('ngValidationDocs', ['ui.router', 'ngValidation']);

    ngValidationDocsModule.config(['$urlRouterProvider', function ($urlRouterProvider) {
        // 默认打开
        $urlRouterProvider.otherwise('/');
    }]);

    ngValidationDocsModule.controller('AppController', ['$scope', function ($scope) {
        $scope.title = 'ngValidation Documentation and Examples';
    }]);

    /**
     * 菜单指令
     */
    ngValidationDocsModule.directive('menu', [function () {
        return {
            restrict   : 'E',
            replace    : true,
            scope      : true,
            templateUrl: 'templates/menu.tpl.html',
            link       : function ($scope, $element, $attrs) {
                $scope.menuList = [
                    {
                        type : 'docs',
                        menus: [
                            {
                                title: '概述', state: 'docs.overview'
                            },
                            {
                                title: '通用表单验证', state: 'docs.general'
                            },
                            {
                                title: '动态表单验证', state: 'docs.dynamic'
                            },
                            {
                                title: '分组类型验证', state: 'docs.group'
                            },
                            {
                                title: '高级扩展', state: 'docs.advanced'
                            }
                        ]
                    },
                    {
                        type : 'me',
                        menus: [
                            {
                                title: '关于', state: 'me.about'
                            }
                        ]
                    }
                ];
            }
        };
    }]);

})(window, window.angular);