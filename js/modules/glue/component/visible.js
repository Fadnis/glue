/*
 *  @module Visible
 *  @namespace component
 *  @desc Represents a visible component
 *  @copyright (C) 2013 SpilGames
 *  @author Jeroen Reurings
 *  @license BSD 3-Clause License (see LICENSE file in project root)
 *
 *  Only when performance issues: Remove the need for getters and setters in visible
 */
glue.module.create(
    'glue/component/visible',
    [
        'glue',
        'glue/math/vector',
        'glue/math/dimension'
    ],
    function (Glue, Vector, Dimension) {
        return function (obj) {
            var position = Vector(0, 0),
                dimension = null,
                image = null,
                frameCount = 0,
                frame = 1,
                rectangle 

            obj = obj || {};
            obj.visible = {
                ready: false,
                setup: function (settings) {
                    var readyNeeded = [],
                        readyList = [],
                        successCallback,
                        errorCallback,
                        customPosition,
                        readyCheck = function () {
                            if (Glue.sugar.arrayMatch(readyNeeded, readyList)) {
                                successCallback();
                            }
                        },
                        imageLoadHandler = function () {
                            dimension = {
                                width: image.naturalWidth,
                                height: image.naturalHeight
                            };
                            readyList.push('image');
                            readyCheck();
                        };

                    if (settings) {
                        if (settings.position) {
                            // using proper rounding:
                            // http://jsperf.com/math-round-vs-hack/66
                            customPosition = settings.position.get();
                            position = Vector(
                                Math.round(customPosition.x),
                                Math.round(customPosition.y)
                            );
                        }
                        if (settings.dimension) {
                            dimension = settings.dimension;
                        }
                        if (settings.image) {
                            readyNeeded.push('image');
                            image = new Image();
                            image.addEventListener('load', function () {
                                imageLoadHandler();
                            }, false);
                            image.src = settings.image.src;
                            if (image.frameWidth) {
                                frameCount = dimension.width / image.frameWidth;
                            }
                        }
                    }
                    return {
                        then: function (onSuccess, onError) {
                            successCallback = onSuccess;
                            errorCallback = onError;
                        }
                    };
                },
                update: function (deltaT) {

                },
                draw: function (deltaT, context) {
                    context.drawImage(image, position.x, position.y)
                },
                getPosition: function () {
                    return position;
                },
                setPosition: function (value) {
                    position = value;
                },
                getDimension: function () {
                    return dimension;
                },
                setDimension: function () {
                    return dimension;
                },
                getBoundingBox: function () {
                    return {
                        left: position.x,
                        right: position.x + dimension.width,
                        top: position.y,
                        bottom: position.y + dimension.height
                    };
                }
            };
            return obj;
        };
    }
);
