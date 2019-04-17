/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
;(function ($, window, document, undefined) {

    // undefined is used here as the undefined global
    // variable in ECMAScript 3 and is mutable (i.e. it can
    // be changed by someone else). undefined isn't really
    // being passed in so we can ensure that its value is
    // truly undefined. In ES5, undefined can no longer be
    // modified.

    // window and document are passed through as local
    // variables rather than as globals, because this (slightly)
    // quickens the resolution process and can be more
    // efficiently minified (especially when both are
    // regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "zoom3d",
        defaults = {
            accelerationRatio: 0.0005,
            content: "",
            doubleClickTime: 200,
            bounceLimit: 100,
            maxScale: 2,
            midScale: 1,
            momentumTime: 200,
            translate3d: false
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = $(element);

        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.gestureX = 0;
        this.gestureY = 0;
        this.height = 0;
        this.isMoved = false;
        this.maxScale = this.options.maxScale;
        this.maxX = 0;
        this.maxY = 0;
        this.midScale = this.options.midScale;
        this.minX = 0;
        this.minY = 0;
        this.scale = 0;
        this.startScale = 0;
        this.startX = 0;
        this.startY = 0;
        this.touchDuration = 0;
        this.touchEndTime = 0;
        this.touchStartTime = 0;
        this.touchX = 0;
        this.touchY = 0;
        this.width = 0;
        this.x = 0;
        this.y = 0;

        var $element = this.element;

        this.content = this.options.content ?
                       $element.find(this.options.content).first() :
                       $element.children().first();

        // Detect touch support
        this.touchEnabled = "ontouchstart" in window;

        // Event constants
        this.events = {
            DOUBLE_CLICK: "dblclick",
            GESTURE_CHANGE: "gesturechange",
            GESTURE_END: "gestureend",
            GESTURE_START: "gesturestart",
            RESIZE: this.touchEnabled ? "orientationchange" : "resize",
            TOUCH_END: this.touchEnabled ? "touchend" : "mouseup",
            TOUCH_MOVE: this.touchEnabled ? "touchmove" : "mousemove",
            TOUCH_START: this.touchEnabled ? "touchstart" : "mousedown",
            TRANSITION_END: "transitionend webkitTransitionEnd"
        };

        this.init();
    }

    Plugin.prototype.touchStart = function (event) {
        event.preventDefault();

        this.stopTransition();

        var self = this;
        var $element = this.element;
        var $content = this.content;

        this.isMoved = false;

        this.touchStartTime = event.timeStamp;

        var touches = event.originalEvent.touches;

        // If it's a two-finger gesture, get its center point
        if (this.touchEnabled && touches.length > 1) {
            this.gestureX = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
            this.gestureY = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
        }

        this.touchX = this.touchEnabled ? touches[0].pageX : event.pageX;
        this.touchY = this.touchEnabled ? touches[0].pageY : event.pageY;

        var elementOffset = $element.offset();
        var contentOffset = $content.offset();
        this.x = this.startX = contentOffset.left - elementOffset.left;
        this.y = this.startY = contentOffset.top - elementOffset.top;

        this.transform();

        $content.on(this.events.TOUCH_MOVE, function (event) {
            self.touchMove(event);
        }).on(this.events.TOUCH_END, function (event) {
            self.touchEnd(event);
        });
    };

    Plugin.prototype.touchMove = function (event) {
        event.preventDefault();

        this.isMoved = true;

        var touches = event.originalEvent.touches;

        // If it's a two-finger gesture, get its center point
        if (this.touchEnabled && touches.length > 1) {
            this.gestureX = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
            this.gestureY = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
        }

        var pageX = this.touchEnabled ? (touches.length > 1 ? this.gestureX : touches[0].pageX) : event.pageX;
        var pageY = this.touchEnabled ? (touches.length > 1 ? this.gestureY : touches[0].pageY) : event.pageY;

        var deltaX = pageX - this.touchX;
        var deltaY = pageY - this.touchY;

        // Slow down if position is out of limits
        if (this.x < this.minX || this.x > this.maxX) {
            deltaX /= 2;
        }
        if (this.y < this.minY || this.y > this.maxY) {
            deltaY /= 2;
        }

        this.x += deltaX;
        this.y += deltaY;

        this.transform();

        this.touchX = pageX;
        this.touchY = pageY;
    };

    Plugin.prototype.touchEnd = function (event) {
        event.preventDefault();

        var touches = event.originalEvent.touches;
        var $content = this.content;

        // Ignore if there are still fingers on screen
        if (this.touchEnabled && touches.length > 0) {
            if (touches.length === 1) {
                this.touchX = touches[0].pageX;
                this.touchY = touches[0].pageY;
            }
            return false;
        }

        $content
            .off(this.events.TOUCH_MOVE)
            .off(this.events.TOUCH_END);

        this.touchDuration = event.timeStamp - this.touchStartTime;

        if (!this.isMoved) {
            // Simulate dblclick event by timing touch events
            var time = event.timeStamp - this.touchEndTime;
            if (this.touchEnabled && time <= this.options.doubleClickTime) {
                this.toggleZoom();
            } else {
                this.update();
            }
            this.touchEndTime = event.timeStamp;
        } else if (this.touchDuration <= this.options.momentumTime && this.scale > this.minScale) {
            this.applyMomentum();
        } else {
            this.update();
        }
    };

    Plugin.prototype.gestureStart = function (event) {
        event.preventDefault();

        this.stopTransition();

        var self = this;
        var $content = this.content;

        this.startScale = this.scale;

        $content.on(this.events.GESTURE_CHANGE, function (event) {
            self.gestureChange(event);
        }).on(this.events.GESTURE_END, function (event) {
            self.gestureEnd(event);
        });
    };

    Plugin.prototype.gestureChange = function (event) {
        event.preventDefault();

        var scale = this.startScale * event.originalEvent.scale;

        // Slow down if scale is out of limits
        if (scale < this.minScale) {
            scale += (this.minScale - scale) / 2;
        } else if (scale > this.maxScale) {
            scale += (this.maxScale - scale) / 2;
        }

        this.zoom(scale, this.gestureX, this.gestureY);
    };

    Plugin.prototype.gestureEnd = function (event) {
        event.preventDefault();

        var $content = this.content;

        $content
            .off(this.events.GESTURE_CHANGE)
            .off(this.events.GESTURE_END);

        if (this.scale < this.minScale) {
            this.zoom(this.minScale, this.gestureX, this.gestureY, true);
        } else if (this.scale > this.maxScale) {
            this.zoom(this.maxScale, this.gestureX, this.gestureY, true);
        } else {
            this.update();
        }
    };

    Plugin.prototype.applyMomentum = function () {
        var deltaX = this.x - this.startX;
        var deltaY = this.y - this.startY;
        var $content = this.content;
        var self = this;

        var momentumX = this.getMomentum(this.x, deltaX, this.minX, this.maxX);
        var momentumY = this.getMomentum(this.y, deltaY, this.minY, this.maxY);

        this.x += momentumX.delta;
        this.y += momentumY.delta;

        var duration = Math.max(momentumX.duration, momentumY.duration) + "ms";

        $content.one(this.events.TRANSITION_END, function() {
            self.update();
        });

        $content.css({
            transitionDuration: duration,
            webkitTransitionDuration: duration
        });

        self.transform();
    };

    Plugin.prototype.getMomentum = function (startVal, distance, minVal, maxVal) {
        var velocity = distance / this.touchDuration;
        var acceleration = velocity < 0 ?
                           this.options.accelerationRatio :
                           -this.options.accelerationRatio;
        var delta = -(velocity * velocity) / (2 * acceleration);
        var duration = -velocity / acceleration;

        // This is built on the premise that minVal is always less than 0,
        // and maxVal is always greater than 0
        var minDelta = minVal - this.options.bounceLimit - startVal;
        var maxDelta = maxVal + this.options.bounceLimit - startVal;

        // Adjust delta and time for out-of-boundary values
        if (delta < minDelta || delta > maxDelta) {
            var relativeDelta = delta < 0 ?
                                Math.abs(minDelta / delta) :
                                Math.abs(maxDelta / delta);
            duration *= relativeDelta;
            delta = Math.max(minDelta, Math.min(delta, maxDelta));
        }

        return { delta: delta, duration: duration };
    };

    // Make content fit inside parent element
    Plugin.prototype.resize = function () {
        var $element = this.element;
        var $content = this.content;
        var elementWidth = $element.width();
        var elementHeight = $element.height();
        var contentWidth = $content.outerWidth();
        var contentHeight = $content.outerHeight();
        var elementRatio = elementWidth / elementHeight;
        var contentRatio = contentWidth / contentHeight;
        this.scale = this.minScale = elementRatio > contentRatio ?
                                     elementHeight / contentHeight :
                                     elementWidth / contentWidth;

        this.update();
    };

    Plugin.prototype.update = function () {
        var $element = this.element;
        var $content = this.content;

        var elementWidth = $element.width();
        var elementHeight = $element.height();

        this.width = $content.outerWidth() * this.scale;
        this.height = $content.outerHeight() * this.scale;

        this.minX = this.width < elementWidth ?
                    (elementWidth - this.width) / 2 :
                    elementWidth - this.width;
        this.minY = this.height < elementHeight ?
                    (elementHeight - this.height) / 2 :
                    elementHeight - this.height;
        this.maxX = this.width < elementWidth ? this.minX : 0;
        this.maxY = this.height < elementHeight ? this.minY : 0;

        this.x = Math.max(this.minX, Math.min(this.x, this.maxX));
        this.y = Math.max(this.minY, Math.min(this.y, this.maxY));

        $content.css({
            transitionDuration: "200ms",
            webkitTransitionDuration: "200ms"
        });

        this.transform();
    };

    Plugin.prototype.stopTransition = function () {
        var $content = this.content;

        $content.css({
            transitionDuration: "0ms",
            webkitTransitionDuration: "0ms"
        });
    };

    Plugin.prototype.toggleZoom = function () {
        var scale = this.scale !== this.minScale ?
                                   this.minScale :
                                   this.midScale;
        this.zoom(scale, this.touchX, this.touchY, true);
    };

    Plugin.prototype.zoom = function (scale, centerX, centerY, once) {
        var relativeScale = scale / this.scale;

        var elementOffset = $(this.element).offset();
        var x = centerX - this.x - elementOffset.left;
        var y = centerY - this.y - elementOffset.top;

        this.x = x - x * relativeScale + this.x;
        this.y = y - y * relativeScale + this.y;

        this.scale = scale;

        if (once) {
            this.update();
        } else {
            this.transform();
        }
    };

    Plugin.prototype.transform = function () {
        var $content = this.content;

        var transform = (this.options.translate3d ? "translate3d(" : "translate(") +
                        this.x + "px," +
                        this.y + "px" +
                        (this.options.translate3d ? ",0) " : ") ") +
                        "scale(" + this.scale + ")";

        $content.css({
            transform: transform,
            webkitTransform: transform
        });

        if (this.options.onScale && typeof this.options.onScale === "function") {
            this.options.onScale(this.scale);
        }
    };

    Plugin.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and
        // the options via the instance, e.g. this.element
        // and this.options

        var self = this;
        var $content = this.content;

        $content.on(this.events.TOUCH_START, function (event) {
            self.touchStart(event);
        }).on(this.events.GESTURE_START, function (event) {
            self.gestureStart(event);
        }).on(this.events.DOUBLE_CLICK, function () {
            self.toggleZoom();
        });

        $(window).bind(this.events.RESIZE, function () {
            self.resize();
        });

        this.resize();
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
