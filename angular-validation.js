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
                show     : true,
                placement: 'top',
                template : [
                    '<div class="tooltip in" ng-show="show && title">',
                    '<div class="tooltip-arrow"></div>',
                    '<div class="tooltip-inner" ng-bind="title"></div>',
                    '</div>'
                ].join('')
            };

            this.$get = ['$rootScope', '$compile', '$timeout', '$dimensions', function ($rootScope, $compile, $timeout, $dimensions) {
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

                    $tooltip.position = function () {
                        var elementPosition = $dimensions.getPosition($element[0], false),
                            tooltipWidth = tooltipElement.prop('offsetWidth'),
                            tooltipHeight = tooltipElement.prop('offsetHeight'),
                            tooltipPosition = $dimensions.getCalculatedOffset(options.placement, elementPosition, tooltipWidth, tooltipHeight);

                        tooltipPosition.top += 'px';
                        tooltipPosition.left += 'px';

                        tooltipElement.css(tooltipPosition);
                    };

                    $tooltip.init = function () {
                        this.setScope(options);
                        tooltipLinker(scope);

                        tooltipElement.css({top: '-9999px', left: '-9999px'});
                        tooltipElement.addClass(options.placement);
                        $element.after(tooltipElement);

                        $timeout(this.position);
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

        }]).

        factory('$dimensions', ['$document', '$window', function ($document, $window) {

            var $dimensions = {};

            /**
             * 确定元素 节点名
             * @param element
             * @param nodeName
             */
            var nodeName = $dimensions.nodeName = function (element, name) {
                return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
            };

            /**
             * 根据属性名, 返回元素 计算的属性值
             * @param element
             * @param property
             * @param extra
             */
            $dimensions.css = function (element, property, extra) {
                var value;
                if (element.currentStyle) { //IE
                    value = element.currentStyle[property];
                } else if (window.getComputedStyle) {
                    value = window.getComputedStyle(element)[property];
                } else {
                    value = element.style[property];
                }
                return extra === true ? parseFloat(value) || 0 : value;
            };

            /**
             * 返回元素 偏移量 offset
             * @param element
             * @returns {{width: (Number|number), height: (Number|number), top: number, left: number}}
             */
            $dimensions.offset = function (element) {
                var boxRect = element.getBoundingClientRect();
                var docElement = element.ownerDocument;
                return {
                    width : boxRect.width || element.offsetWidth,
                    height: boxRect.height || element.offsetHeight,
                    top   : boxRect.top + (window.pageYOffset || docElement.documentElement.scrollTop) - (docElement.documentElement.clientTop || 0),
                    left  : boxRect.left + (window.pageXOffset || docElement.documentElement.scrollLeft) - (docElement.documentElement.clientLeft || 0)
                };
            };

            /**
             * 返回元素 位置 position
             * @param element
             * @returns {{width: number, height: number, top: number, left: number}}
             */
            $dimensions.position = function (element) {

                var offsetParentRect = {top: 0, left: 0},
                    offsetParentElement,
                    offset;

                // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
                if ($dimensions.css(element, 'position') === 'fixed') {

                    // We assume that getBoundingClientRect is available when computed position is fixed
                    offset = element.getBoundingClientRect();

                } else {

                    // Get *real* offsetParentElement
                    offsetParentElement = offsetParent(element);

                    // Get correct offsets
                    offset = $dimensions.offset(element);
                    if (!nodeName(offsetParentElement, 'html')) {
                        offsetParentRect = $dimensions.offset(offsetParentElement);
                    }

                    // Add offsetParent borders
                    offsetParentRect.top += $dimensions.css(offsetParentElement, 'borderTopWidth', true);
                    offsetParentRect.left += $dimensions.css(offsetParentElement, 'borderLeftWidth', true);
                }

                // Subtract parent offsets and element margins
                return {
                    width : element.offsetWidth,
                    height: element.offsetHeight,
                    top   : offset.top - offsetParentRect.top - $dimensions.css(element, 'marginTop', true),
                    left  : offset.left - offsetParentRect.left - $dimensions.css(element, 'marginLeft', true)
                };

            };

            /**
             * Returns the closest, non-statically positioned offsetParent of a given element
             * @required-by fn.position
             * @param element
             */
            var offsetParent = function offsetParentElement(element) {
                var docElement = element.ownerDocument;
                var offsetParent = element.offsetParent || docElement;
                if (nodeName(offsetParent, '#document')) return docElement.documentElement;
                while (offsetParent && !nodeName(offsetParent, 'html') && $dimensions.css(offsetParent, 'position') === 'static') {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || docElement.documentElement;
            };

            /**
             * Provides equivalent of jQuery's height function
             * @required-by bootstrap-affix
             * @url http://api.jquery.com/height/
             * @param element
             * @param outer
             */
            $dimensions.height = function (element, outer) {
                var value = element.offsetHeight;
                if (outer) {
                    value += $dimensions.css(element, 'marginTop', true) + $dimensions.css(element, 'marginBottom', true);
                } else {
                    value -= $dimensions.css(element, 'paddingTop', true) + $dimensions.css(element, 'paddingBottom', true) + $dimensions.css(element, 'borderTopWidth', true) + $dimensions.css(element, 'borderBottomWidth', true);
                }
                return value;
            };

            /**
             * Provides equivalent of jQuery's width function
             * @required-by bootstrap-affix
             * @url http://api.jquery.com/width/
             * @param element
             * @param outer
             */
            $dimensions.width = function (element, outer) {
                var value = element.offsetWidth;
                if (outer) {
                    value += $dimensions.css(element, 'marginLeft', true) + $dimensions.css(element, 'marginRight', true);
                } else {
                    value -= $dimensions.css(element, 'paddingLeft', true) + $dimensions.css(element, 'paddingRight', true) + $dimensions.css(element, 'borderLeftWidth', true) + $dimensions.css(element, 'borderRightWidth', true);
                }
                return value;
            };


            /**
             * 计算 元素 显示的 位置
             * @param placement
             * @param position
             * @param actualWidth
             * @param actualHeight
             * @returns {*}
             */
            $dimensions.getCalculatedOffset = function getCalculatedOffset(placement, position, actualWidth, actualHeight) {
                var offset;
                var split = placement.split('-');

                switch (split[0]) {
                    case 'right':
                        offset = {
                            top : position.top + position.height / 2 - actualHeight / 2,
                            left: position.left + position.width
                        };
                        break;
                    case 'bottom':
                        offset = {
                            top : position.top + position.height,
                            left: position.left + position.width / 2 - actualWidth / 2
                        };
                        break;
                    case 'left':
                        offset = {
                            top : position.top + position.height / 2 - actualHeight / 2,
                            left: position.left - actualWidth
                        };
                        break;
                    default:
                        offset = {
                            top : position.top - actualHeight,
                            left: position.left + position.width / 2 - actualWidth / 2
                        };
                        break;
                }

                if (!split[1]) {
                    return offset;
                }

                if (split[0] === 'top' || split[0] === 'bottom') {
                    switch (split[1]) {
                        case 'left':
                            offset.left = position.left;
                            break;
                        case 'right':
                            offset.left = position.left + position.width - actualWidth;
                    }
                } else if (split[0] === 'left' || split[0] === 'right') {
                    switch (split[1]) {
                        case 'top':
                            offset.top = position.top - actualHeight;
                            break;
                        case 'bottom':
                            offset.top = position.top + position.height;
                    }
                }

                return offset;
            };

            $dimensions.getPosition = function getPosition(element, appendToBody) {
                if (appendToBody) {
                    return $dimensions.offset(element);
                } else {
                    return $dimensions.position(element);
                }
            };

            return $dimensions;
        }]);

})(window, window.angular);