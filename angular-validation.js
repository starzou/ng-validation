/**
 * @module ngValidation
 * @description A high-performance and high-availability form validation component based on AngularJS
 * @author StarZou
 * @email tongyuanzou@gmail.com
 * @time 2015
 * @license MIT
 **/
(function (window, angular, undefined) {
    'use strict';

    /**
     * 需要验证的表单 元素
     * @param element
     * @param controller
     * @constructor
     */
    function ValidationForm(element, controller, fields) {
        this.$element = element;
        this.element = element[0];
        this.controller = controller;
        this.fields = fields || [];
    }

    // 注册字段
    ValidationForm.prototype.register = function (field) {
        this.fields.push(field);
    };

    // 解绑字段
    ValidationForm.prototype.unregister = function (field) {
        var index = this.fields.indexOf(field);
        this.fields.splice(index, 1);
    };

    /**
     * 需要验证的字段 元素
     * @param element
     * @param controller
     * @constructor
     */
    function ValidationField(element, controller) {
        this.$element = element;
        this.element = element[0];
        this.controller = controller;
    }

    /**
     * ngValidation module
     */
    angular.module('ngValidation', ['ng']).

        provider('validationMessage', function () {
            var defaults = this.defaults = {
                messages: {
                    required : '必填！',
                    number   : '必须为数字！',
                    minlength: '太短！',
                    maxlength: '太长！',
                    email    : 'Email无效！',
                    url      : 'URL无效！',
                    pattern  : '格式不正确！'
                },

                defaultMessage: '验证不通过！'
            };

            this.$get = [function () {
                return defaults;
            }];

        }).

        provider('validator', function () {

            this.$get = ['$parse', 'validationMessage', function ($parse, validationMessage) {
                var validator = {

                    // 验证字段
                    validateField: function (validationField) {
                        var ngModelController = validationField.controller;

                        if (ngModelController.$dirty && ngModelController.$invalid) {
                            // 验证不通过

                            // 取 错误类型
                            var errorTypes = Object.keys(ngModelController.$error),
                                errorType = errorTypes[0];

                            // 消息
                            var message = validationMessage.messages[errorType] || validationMessage.defaultMessage;

                            console.log(errorType, message, ngModelController);
                        } else {
                            // 验证通过
                        }
                    }
                };

                return validator;
            }];

        }).

        directive('validationForm', [function () {

            return {
                restrict: 'A',
                require : 'form',
                compile : function compile($element, $attrs) {
                    // 表单元素
                    var formElement = $element[0];

                    // 使原生浏览器的校验无效
                    formElement.noValidate = true;

                    return function postLink($scope, $element, $attrs, ngFormController) {

                        var validationForm = new ValidationForm($element, ngFormController);

                        console.log(validationForm);
                    };
                }
            }

        }]).

        directive('validationField', ['$timeout', 'validator', function ($timeout, validator) {

            return {
                restrict: 'A',
                require : ['ngModel', '?^validationForm'],
                compile : function compile($element, $attrs) {

                    return function postLink($scope, $element, $attrs, controllers) {

                        // controllers
                        var ngModelController = controllers[0],
                            validationFormController = controllers[1];

                        // validationField
                        var validationField = new ValidationField($element, ngModelController);


                        // 包装验证字段方法
                        function warpValidateField(value) {
                            $timeout(function () {
                                validator.validateField(validationField);
                            });
                            return value;
                        }

                        //For DOM -> Model validation
                        ngModelController.$parsers.push(warpValidateField);

                        //For Model -> DOM validation
                        ngModelController.$formatters.push(warpValidateField);

                        console.log(validationField, validationFormController);

                    };
                }
            }

        }]);

})(window, window.angular);