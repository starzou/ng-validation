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

        provider('$tooltip', function () {
            var defaults = this.defaults = {
                show    : true,
                template: [
                    '<div class="tooltip right fade in" ng-show="show && title">',
                    '<div class="tooltip-arrow" style="border-right-color: #d9534f;"></div>',
                    '<div class="tooltip-inner" style="background-color: #d9534f;" ng-bind="title"></div>',
                    '</div>'
                ].join('')
            };

            this.$get = ['$rootScope', '$compile', '$timeout', function ($rootScope, $compile, $timeout) {
                function TooltipFactory($element, config) {
                    var $tooltip = {},
                        options = $tooltip.$options = angular.extend({}, defaults, config),
                        scope = $tooltip.$scope = options.scope && options.scope.$new() || $rootScope.$new(),
                        tooltipElement = angular.element(options.template),
                        tooltipLinker = $compile(tooltipElement);

                    $tooltip.destroy = function () {
                        tooltipElement.remove();
                        scope.$destroy();
                    };

                    $tooltip.setScope = function (option) {
                        if (!option) {
                            return;
                        }

                        angular.forEach(['title', 'show'], function (key) {
                            if (angular.isDefined(option[key])) {
                                scope[key] = option[key];
                            }
                        });
                    };

                    $tooltip.init = function () {
                        this.setScope(options);
                        tooltipLinker(scope);
                        $element.after(tooltipElement);
                    };

                    $tooltip.show = function (option) {
                        this.setScope(angular.extend({show: true}, option));
                    };

                    $tooltip.hide = function () {
                        this.setScope({show: false});
                    };

                    $tooltip.init();

                    return $tooltip;
                }

                return TooltipFactory;
            }];
        }).

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

            /**
             * 设置 defaults.messages  {errorType : message, ...}
             * @param messages
             * @returns defaults.messages
             */
            this.setMessages = function (messages) {
                return angular.extend(defaults.messages, messages);
            };

            /**
             * 设置 defaults
             * @param defaults
             * @returns defaults
             */
            this.setDefaults = function (defaults) {
                return angular.extend(this.defaults, defaults);
            };

            this.$get = [function () {
                return defaults;
            }];

        }).

        provider('validator', function () {

            this.$get = ['$parse', 'validationMessage', '$tooltip', function ($parse, validationMessage, $tooltip) {
                var validator = {

                    // 验证字段
                    validateField: function (validationField) {
                        var ngModelController = validationField.controller;

                        if (ngModelController.$dirty && ngModelController.$invalid) {
                            // 验证不通过

                            // 取 错误类型
                            var errorTypes = Object.keys(ngModelController.$error),
                                errorType = errorTypes[0];

                            // 取 自定义错误消息
                            var message = $parse(validationField.$element.attr('message'))();

                            // 消息
                            var msg = (message && message[errorType]) || validationMessage.messages[errorType] || validationMessage.defaultMessage;

                            console.log(errorType, msg, ngModelController);

                            validator.showMessage(validationField, msg);
                        } else {
                            // 验证通过
                            validator.hideMessage(validationField);
                        }
                    },

                    showMessage: function (validationField, message) {
                        var $element = validationField.$element,
                            tooltip = $element.data('tooltip');

                        if (tooltip) {
                            tooltip.show({title: message});
                        } else {
                            tooltip = $tooltip(validationField.$element, {title: message});
                            $element.data('tooltip', tooltip);
                        }

                        console.log(tooltip);
                    },

                    hideMessage: function (validationField) {
                        var tooltip = validationField.$element.data('tooltip');
                        if (tooltip) {
                            tooltip.hide();
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