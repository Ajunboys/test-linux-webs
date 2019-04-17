/*
 AngularJS v1.3.16
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(angular) {

    'use strict';

    if ( !angular ) {
        throw new Error('angular-module-shim: Missing Angular');
    }

    var origFn = angular.module;
    var hash = {};

    angular.module = function(name,requires,configFn) {

        var requires = requires || [];
        var registered = hash[name];
        var module;

        if ( registered ) {
            module = origFn(name);
            module.requires.push.apply(module.requires,requires);
            // Register the config function if it exists.
            if (configFn) {
                module.config(configFn);
            }
        } else {
            hash[name] = true;
            module = origFn(name,requires,configFn);
        }

        return module;
    };
})(window.angular);
//# sourceMappingURL=angular-module-shim.js.map