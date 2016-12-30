/*! rQuery DOM Library v1.0.0 | @link https://github.com/restive/rquery | @copyright Restive LLC <dev@restive.io> | @license MIT */

/*jshint -W097 */
/*jshint -W117 */
/*jshint devel: true, plusplus: false, nonew: false, eqnull: true*/
/* global process, self, global, module, window, console */
"use strict";

/**
 * Polyfills
 */
if(typeof String.prototype.forEach !== 'function') {
    Array.prototype.forEach = function (callback, context) {
        for (var i = 0; i < this.length; i++) {
            callback.apply(context, [this[i], i, this]);
        }
    };
}
if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

/*! _r - rScript functional helpers */
(function(root, name, make){
    if (typeof module !== 'undefined' && module.exports){ module.exports = make($);}
    else {root[name] = make();}
}(window, '_r', function() {

    var hasOwnProperty = window.hasOwnProperty || Object.prototype.hasOwnProperty;

    /**
     * Checks if an object has a given property defined on itself
     * @param obj {Object} the object
     * @param prop {String} the name of the property
     * @returns {boolean|*|Function}
     */
    function has (obj, prop)
    {
        /*jshint -W116 */
        return obj != null && hasOwnProperty.call(obj, prop);
        /*jshint +W116 */
    }

    function count (mixed_var, mode) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Waldo Malqui Silva
        // +   bugfixed by: Soren Hansen
        // +      input by: merabi
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Olivier Louvignes (http://mg-crea.com/)
        // +   improved by: Obinwanne Hill on 15-03-2015 (https://about.me/obinwanne.hill)
        // +   dependencies: isArray() and isObject()
        // *     example 1: count([[0,0],[0,-4]], 'COUNT_RECURSIVE');
        // *     returns 1: 6
        // *     example 2: count({'one' : [1,2,3,4,5]}, 'COUNT_RECURSIVE');
        // *     returns 2: 6
        var key, nvld = false, cnt = 0;

        if (mixed_var === null || typeof mixed_var === 'undefined')
        {
            return 0;
        }
        else if (!isArray(mixed_var) && !isObject(mixed_var))
        {
            nvld = true;
        }

        if (has(mixed_var, 'length'))
        {
            return mixed_var.length;
        }

        //Return 1 if !isArray && !Object && does not have .length
        if(nvld)
        {
            return 1;
        }

        if (mode === 'COUNT_RECURSIVE')
        {
            mode = 1;
        }

        if (mode !== 1)
        {
            mode = 0;
        }

        for (key in mixed_var) {
            if (has(mixed_var, key))
            {
                cnt++;
                if (mode === 1 && mixed_var[key] && (isArray(mixed_var[key]) || isObject(mixed_var[key])))
                {
                    cnt += count(mixed_var[key], 1);
                }
            }
        }

        return cnt;
    }

    /**
     * Join array elements with a string
     * @param delimiter {string} the join delimiter
     * @param pieces {array} the array of strings to implode
     * @returns {*}
     */
    function implode(delimiter, pieces){

        if(!(_r.isArray(pieces) || _r.isObject(pieces)))
        {
            return false;
        }

        delimiter = (!delimiter) ? '' : delimiter;

        if(_r.count(pieces) === 1)
        {
            //return first element without delimiter if array count is 1
            return pieces[0];
        }
        else if (_r.count(pieces) < 1)
        {
            //return empty string on blank array
            return "";
        }

        var retr_str = '';
        if(_r.isArray(pieces))
        {
            //array

            for(var i = 0; i < _r.count(pieces); i++)
            {
                retr_str += (i === 0) ? pieces[i] : delimiter+pieces[i];
            }
        }
        else
        {
            //object

            var j = 0;
            for (var key in pieces)
            {
                if (pieces.hasOwnProperty(key))
                {
                    retr_str += (j === 0) ? pieces[key] : delimiter+pieces[key];

                    j++;
                }
            }
        }

        return retr_str;
    }

    function in_array (needle, haystack, argStrict) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: vlado houba
        // +   input by: Billy
        // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
        // *     example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);
        // *     returns 1: true
        // *     example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'});
        // *     returns 2: false
        // *     example 3: in_array(1, ['1', '2', '3']);
        // *     returns 3: true
        // *     example 3: in_array(1, ['1', '2', '3'], false);
        // *     returns 3: true
        // *     example 4: in_array(1, ['1', '2', '3'], true);
        // *     returns 4: false
        var key = '',
            strict = !! argStrict;

        if (strict) {
            for (key in haystack) {
                if (haystack[key] === needle) {
                    return true;
                }
            }
        } else {
            for (key in haystack) {
                /* jshint -W116 */
                if (haystack[key] == needle) {
                    return true;
                }
                /* jshint +W116 */
            }
        }

        return false;
    }

    /**
     * Merges one array with another
     * @param first {Array} the primary array
     * @param second {Array} the array being merged into primary
     * @returns {*}
     */
    function merge( first, second ) {
        var len = +second.length,
            j = 0,
            i = first.length;

        while ( j < len ) {
            first[ i++ ] = second[ j++ ];
        }

        // Support: IE<9
        // Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
        if ( len !== len ) {
            while ( second[j] !== undefined ) {
                first[ i++ ] = second[ j++ ];
            }
        }

        first.length = i;

        return first;
    }

    function array_keys (input, search_value, argStrict) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: jd
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   input by: P
        // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
        // *     example 1: array_keys( {firstname: 'Kevin', surname: 'van Zonneveld'} );
        // *     returns 1: {0: 'firstname', 1: 'surname'}

        var search = typeof search_value !== 'undefined',
            tmp_arr = [],
            strict = !!argStrict,
            include = true,
            key = '';

        if (input && typeof input === 'object' && input.change_key_case) { // Duck-type check for our own array()-created PHPJS_Array
            return input.keys(search_value, argStrict);
        }

        for (key in input) {
            if (has(input, key)) {
                include = true;
                if (search) {
                    if (strict && input[key] !== search_value) {
                        include = false;
                    }/* jshint -W116 */
                    else if (input[key] != search_value) {
                        include = false;
                    }/* jshint +W116 */
                }

                if (include) {
                    tmp_arr[tmp_arr.length] = key;
                }
            }
        }

        return tmp_arr;
    }

    function array_values (input) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Obinwanne Hill on 15-03-2015 (https://about.me/obinwanne.hill)
        // *       example 1: array_values( {firstname: 'Kevin', surname: 'van Zonneveld'} );
        // *       returns 1: {0: 'Kevin', 1: 'van Zonneveld'}
        var tmp_arr = [],
            key = '';

        if (input && typeof input === 'object' && input.change_key_case) { // Duck-type check for our own array()-created PHPJS_Array
            return input.values();
        }

        for (key in input) {
            if(has(input, key))
            {
                tmp_arr[tmp_arr.length] = input[key];
            }
        }

        return tmp_arr;
    }

    function array_combine (keys, values) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Obinwanne Hill on 15-03-2015 (https://about.me/obinwanne.hill)
        // *     example 1: array_combine([0,1,2], ['kevin','van','zonneveld']);
        // *     returns 1: {0: 'kevin', 1: 'van', 2: 'zonneveld'}
        var new_array = {},
            keycount = keys && keys.length,
            i = 0;

        // input sanitation
        if (typeof keys !== 'object' || typeof values !== 'object' || // Only accept arrays or array-like objects
            typeof keycount !== 'number' || typeof values.length !== 'number' || !keycount) { // Require arrays to have a count
            return false;
        }

        // number of elements does not match
        if (keycount !== values.length) {
            return false;
        }

        for (i = 0; i < keycount; i++) {
            new_array[keys[i]] = values[i];
        }

        return new_array;
    }

    function microtime (get_as_float) {
        // http://kevin.vanzonneveld.net
        // +   original by: Paulo Freitas
        // *     example 1: timeStamp = microtime(true);
        // *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000
        var now = new Date().getTime() / 1000;
        var s = parseInt(now, 10);

        return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
    }


    /**
     * Checks if a variable is a String
     * @param str {*} The variable to test
     * @return {Boolean}
     */
    function isString(str)
    {
        return (typeof str === "string" || str instanceof String);
    }

    /**
     * Checks if a variable is a Number
     * @param num {*} The variable to test
     * @return {Boolean}
     */
    function isNumber(num)
    {
        return (!isNaN(parseFloat(num)) && isFinite(num));
    }

    /**
     * Checks if a variable is a Boolean
     * @param bool {*} The variable to test
     * @return {Boolean}
     */
    function isBool(bool)
    {
        return (bool === true || bool === false);
    }

    /**
     * Checks if the variable is an array
     * @param arr {*} The variable to test
     * @return {Boolean}
     */
    function isArray(arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    }

    /**
     * Checks if a variable is an Object
     * @param obj {*} The variable to test
     * @return {Boolean}
     */
    function isObject(obj)
    {
        if (isArray(obj))
        {
            return false;
        }

        return typeof obj === "object";
    }

    /**
     * Checks if a value is null or undefined
     * @param {*} val the value to check
     * @returns {boolean}
     */
    function isNullOrUndefined(val)
    {
        return ((typeof val === "undefined" || val === null));
    }

    /**
     * Converts a string array to an integer array
     * It converts all the string values of an array into their integer equivalents
     * @param str_arr {Array} The array to convert
     * @return {Array}
     */
    function arrayToInteger(str_arr)
    {
        var int_arr_item_int,
            array_count_int,
            keys_arr = [],
            values_arr = [],
            values_int_arr = [],
            final_int_arr = [];

        keys_arr = array_keys(str_arr);
        values_arr = array_values(str_arr);

        array_count_int = _r.count(str_arr);
        for(var i = 0; i < array_count_int; i++)
        {
            int_arr_item_int = parseInt(values_arr[i]);
            values_int_arr.push(int_arr_item_int);
        }

        final_int_arr = array_combine(keys_arr, values_int_arr);
        return final_int_arr;
    }


    /**
     * Sorts an array in numerical order and returns an array containing the keys of the array in the new sorted order
     * @param values_arr {Array} The array to sort
     * @return {Array}
     */
    function getSortedKeys(values_arr)
    {
        var array_with_keys = [],
            i = 0;
        for (i = 0; i < values_arr.length; i++) {
            array_with_keys.push({ key: i, value: values_arr[i] });
        }

        array_with_keys.sort(function(a, b) {
            if (a.value < b.value) { return -1; }
            if (a.value > b.value) { return  1; }
            return 0;
        });

        var keys = [];
        for (i = 0; i < array_with_keys.length; i++) {
            keys.push(array_with_keys[i].key);
        }

        return keys;
    }

    /**
     * Finds the nearest matching number in an array containing integers
     * It is recommended that you sort the array in order before using it with this function
     * @param haystack_arr {Array} The array containing the integer values
     * @param needle_int {Number} The reference integer which is used to find the match
     * @param return_key_only_bool {Boolean} If true, will return the key position of the nearest match. Default is false.
     * @param is_ceil_bool {Boolean} If true, will return the nearest highest number even if a lower number is technically 'closer'. Default value is true.
     * @param disable_ceil_offset_int {Number} Please see explanation below.
     * For example, let's say needle_int is 120 and the nearest matching numbers are 115 on the lower end and 140 on the higher end
     * Being the is_ceil_bool is true by default, 140 would ordinarily be the nearest number selected. However, if disable_ceil_offset is set to 5, this will set is_ceil_bool to false, and 115 will be returned as the nearest number selected because the difference between it (the true nearest matching number) and 120 (needle_int) is 5 or less, even though needle_int is higher and under normal circumstances 120 would have been returned instead
     * @return {Number}
     */
    function getClosestNumberMatchArray(haystack_arr, needle_int)
    {
        var myArgs = Array.prototype.slice.call(arguments),
            return_key_only_bool = (isBool(myArgs[2])) ? myArgs[2]: false,
            is_ceil_bool = (isBool(myArgs[3])) ? myArgs[3]: true,
            disable_ceil_offset_int = (isNumber(myArgs[4])) ? myArgs[4] : 0,
            value_diff_int,
            value_diff_keys_sort_arr = [],
            value_diff_values_arr = [],
            key_final_int,
            value_final_int,
            value_final_needle_diff_int
            ;

        haystack_arr = arrayToInteger(haystack_arr);
        needle_int = parseInt(needle_int);

        for(var i = 0; i < _r.count(haystack_arr); i++)
        {
            value_diff_int = needle_int - haystack_arr[i];
            value_diff_int = Math.abs(value_diff_int);
            value_diff_values_arr.push(value_diff_int);
        }

        value_diff_keys_sort_arr = getSortedKeys(value_diff_values_arr);
        key_final_int = value_diff_keys_sort_arr[0];
        value_final_int = haystack_arr[key_final_int];

        value_final_needle_diff_int = value_final_int - needle_int;
        value_final_needle_diff_int = Math.abs(value_final_needle_diff_int);

        //Manage for when needle_int is higher than nearest matching number, and highest matching number is required
        if(value_final_int < needle_int)
        {
            is_ceil_bool = (value_final_needle_diff_int <= disable_ceil_offset_int) ? false : is_ceil_bool;
            key_final_int = (is_ceil_bool) ? key_final_int + 1 : key_final_int;
        }

        //return value or key
        value_final_int = haystack_arr[key_final_int];
        return (return_key_only_bool) ? key_final_int: value_final_int;
    }

    /**
     * This function checks if a number is an integer decimal and if the integral part of the decimal is even
     * For example, 640.123 will be true, 641.123 will be false
     * @param number_int {Number} The Integer Decimal
     * @return {Boolean}
     */
    function isEvenDecimal(number_int)
    {
        var number_str = ''+number_int+'';
        return ((/^ *[\-]?[0-9]+(0|2|4|6|8)\.[0-9]+ *$/i.test(number_str)));
    }

    var _r = {
        has: has,
        count: count,
        implode: implode,
        in_array: in_array,
        merge: merge,
        array_keys: array_keys,
        array_values: array_values,
        array_combine: array_combine,
        microtime: microtime,
        isString: isString,
        isNumber: isNumber,
        isBool: isBool,
        isArray: isArray,
        isObject: isObject,
        isNullOrUndefined: isNullOrUndefined,
        arrayToInteger: arrayToInteger,
        getSortedKeys: getSortedKeys,
        getClosestNumberMatchArray: getClosestNumberMatchArray,
        isEvenDecimal: isEvenDecimal
    };
    return _r;

}));

(function(_r){

    if (!Object.create)
    {
        Object.create = function(o, properties)
        {
            if (typeof o !== 'object' && typeof o !== 'function')
            {
                throw new TypeError('Object prototype may only be an Object: ' + o);
            }
            else if (o === null)
            {
                throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");
            }

            /*jshint -W116 */
            if (typeof properties != 'undefined')
            {
                throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");
            }
            /*jshint +W116 */

            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    function Dom(){}
    Dom.prototype = Object.create(Array.prototype);

    /**
     * Creates a DOM object
     * @param selector {String} the selector
     * @param context {Object} the context
     * @param undefined
     * @returns {Dom}
     * @private
     */
    function _DomCreate(selector, context, undefined){
        var init_dom_obj = new _initDom(selector, context, undefined);
        var dom_obj = new Dom();

        if(init_dom_obj.el === null)
        {
            //no element found
            dom_obj = {};
            dom_obj.empty = true;
            dom_obj.length = (!dom_obj.length) ? 0 : dom_obj.length;
        }
        else
        {
            dom_obj = _r.merge(dom_obj, init_dom_obj.core);
        }

        dom_obj.context = init_dom_obj.context;
        dom_obj.selector = init_dom_obj.selector;

        if(dom_obj.length > 0)
        {
            dom_obj.selectorMethod = init_dom_obj.selectorMethod;
            dom_obj.label = init_dom_obj.label;
            dom_obj.instanceType = init_dom_obj.instanceType;
            dom_obj.objectStore = init_dom_obj.objectStore;
            dom_obj.empty = false;
        }
        if(dom_obj.length === 1)
        {
            dom_obj.tagName = init_dom_obj.tagName;
        }

        return dom_obj;
    }

    /**
     * Selects an object from the DOM
     * @param selector {String} the selector
     * @param context {Object} the context [default is document]
     * @param undefined
     * @returns {*}
     * @private
     */
    function _initDom(selector, context, undefined)
    {
        //set default context if undefined
        context = (!context) ? window.document : context;

        var el,
            _context,
            _selector,
            _selector_method,
            _is_find_op_bool = false,
            _is_nodelist_op_bool = false,
            _is_window_obj_bool = false;

        if(_isWindow(selector) || selector === 'window')
        {
            _is_window_obj_bool = true;
            el = window;
        }
        else if(_r.isObject(selector))
        {
            el = selector;
        }
        else if(selector === 'head' || selector === 'body')
        {
            el = context[selector] || context.getElementsByTagName(selector)[0];
        }
        else if(selector === 'html')
        {
            el = context.getElementsByTagName(selector);
        }
        else if(/^ *(.+?,\s*\S+|[_a-zA-Z0-9\-]+\.[_a-zA-Z0-9\-]+|.*? *\[.+?\]) *$/i.test(selector))
        {
            //if multiple selectors are provided
            /**
             * 1: if multiple selectors are provided e.g. $("p.main, a.other")
             * 2: if tagname.class selector
             * 3: if attribute-value selector
             */
            _is_nodelist_op_bool = true;

            el = context.querySelectorAll(selector);
            _selector_method = 'querySelectorAll';
        }
        else
        {
            /*! Salt.js DOM Selector Lib. By @james2doyle */
            /*! + improved by: Obinwanne Hill on 24-04-2015 */

            var selector_key = selector.slice(0, 1),
                matches = {
                    '#': 'getElementById',
                    '.': 'getElementsByClassName',
                    '@': 'getElementsByName',
                    '=': 'getElementsByTagName',
                    '*': 'querySelectorAll'
                }[selector_key],
                selector_value = selector.slice(1);

            if(_isInstanceOfRQuery(context))
            {
                _is_find_op_bool = true;

                //archive context before updating it
                _context = context;

                context = context[0];
                matches = 'querySelectorAll';
                selector_value = selector;
            }
            else
            {
                //add fallback if getElementsByClassName is not supported e.g. IE8
                if(matches === 'getElementsByClassName' && !document.getElementsByClassName)
                {
                    matches = 'querySelectorAll';
                    selector_value = selector;
                }

                //if matches is undefined, assume selector is a HTML tag
                if(!matches)
                {
                    matches = 'getElementsByTagName';
                    selector_value = selector;
                }
            }

            if(matches !== 'getElementById')
            {
                /**
                 * Set as NodeList operation
                 * all matches methods beside getElementById return a List-like result
                 */
                _is_nodelist_op_bool = true;
            }

            // now pass the selector without the key/first character
            el = context[matches](selector_value);

            _selector_method = (matches) ? matches : '';
        }

        /*jshint -W040 */
        if((!el || el.length < 1) && !_is_window_obj_bool)
        {
            this.el = null;
            this.core = [];

            this.context = context;
            this.selector = selector;
        }
        else
        {
            //define selector
            _selector = (_r.isObject(selector)) ? _getSelectorFromObject(selector) : selector;

            this.core = [];
            if(el.length && el.length >= 1 && _is_nodelist_op_bool)
            {
                //handle NodeLists, etc. + objects from find operation

                var _init_core_arr = [];
                var _initForEach = function (array, callback, scope) {
                    for (var i = 0; i < array.length; i++) {
                        callback.call(scope, i, array[i]);
                    }
                };
                _initForEach(el, function (index) {
                    _init_core_arr.push(el[index]);
                });

                this.core = _init_core_arr;
            }
            else
            {
                this.core.push(el);
            }

            //update _selector if find operation
            if(_is_find_op_bool)
            {
                _selector = (_context && _r.isString(_context.selector)) ? _context.selector+' '+_selector : _selector;
            }

            this.label = 'rquery';
            this.context = context;
            this.selector = _selector;
            this.selectorMethod = _selector_method;
            this.objectStore = {};
            this.instanceType = null;

            var el_count_int = _r.count(this.core);
            if(el_count_int > 0)
            {
                if(_is_nodelist_op_bool)
                {
                    this.instanceType = 'list';
                }
                else
                {
                    this.tagName = (_r.isString(el.nodeName)) ? el.nodeName.toLowerCase() : '';
                    this.instanceType = 'element';
                }
            }
        }
        /*jshint +W040 */
    }

    var _this,
        _this_el_obj,
        _this_count_int,
        _ref_obj,
        _parent_ref_obj;

    /**
     * Creates an rQuery object
     * This is a wrapper class for _DomCreate
     * @param selector see _DomCreate
     * @param context see _DomCreate
     * @param undefined see _DomCreate
     * @returns {Dom}
     */
    var rQuery = function(selector, context, undefined){
        return _DomCreate(selector, context, undefined);
    };

    /**
     * Checks whether the object is a window object
     * @param obj {*} the object to test
     * @returns {boolean}
     * @private
     */
    function _isWindow( obj ) {
        /*jshint -W116 */
        return (obj != null && (obj == obj.window || typeof obj.window === 'object'));
        /*jshint +W116 */
    }

    /**
     * Determines if an object is an instance of RQuery
     * @param obj {*} the object to test
     * @returns {boolean}
     * @private
     */
    function _isInstanceOfRQuery(obj)
    {
        return ((obj.label === 'rquery'));
    }

    /**
     * Determines the selector for a given object
     * @param obj {Object} the object
     * @returns {*}
     * @private
     */
    function _getSelectorFromObject(obj)
    {
        var id_str = (obj.id) ? obj.id : '',
            class_temp_str = obj.className,
            class_str = (_r.isString(class_temp_str)) ? class_temp_str.replace(/\s+/g, '.') : '',
            node_name_str = (obj.nodeName) ? obj.nodeName.toLowerCase() : ''
            ;


        if(_r.isString(id_str) && id_str.length > 0)
        {
            return '#'+id_str;
        }

        if (_isWindow(obj))
        {
            return 'window';
        }

        if (_r.in_array(node_name_str,['body', 'html', 'head']))
        {
            return node_name_str;
        }

        if (_r.isString(class_str) && class_str.length > 0)
        {
            return node_name_str+'.'+class_str;
        }

        return node_name_str;
    }

    /**
     * Returns a list of Node types supported by the browser
     * @returns {Array}
     * @private
     */
    function _getSupportedNodeTypes()
    {
        //Define supported collections for later dynamic function calls
        var node_type_arr = ['NodeList', 'HTMLCollection', 'StaticNodeList'],
            node_type_supported_arr = [];
        for (var i = 0; i < node_type_arr.length; i++)
        {
            if(window[node_type_arr[i]]){
                node_type_supported_arr.push(node_type_arr[i]);
            }
        }
        return node_type_supported_arr;
    }

    /**
     * Determines the type of object
     * @param elem {Object} the reference object
     * @returns {*}
     */
    function _getObjectType(elem)
    {
        var obj_type_str = Object.prototype.toString.call(elem).slice(8, -1),
            supported_nodelist_types_arr = _getSupportedNodeTypes();

        if (typeof elem === 'object')
        {
            var regex_1 = /^ *(HTMLCollection|NodeList|StaticNodeList|Object) *$/gi,
                regex_2 = /^ *.*?(Window|Global|Object) *$/gi,
                regex_3 = /^ *.*?(Element|Object) *$/gi,
                match_1 = regex_1.exec(obj_type_str),
                match_2 = regex_2.exec(obj_type_str),
                match_3 = regex_3.exec(obj_type_str)
                ;

            if(match_1 &&
                _r.has(elem, 'length') &&
                (elem.length === 0 || (typeof elem[0] === "object" && elem[0].nodeType > 0)))
            {
                //check if StaticNodeList
                if(_r.in_array('StaticNodeList', supported_nodelist_types_arr) && elem instanceof window.StaticNodeList)
                {
                    return 'StaticNodeList';
                }

                //check if Window Object
                if(_r.has(elem, 'self'))
                {
                    return 'Window';
                }

                //return HTMLCollection or NodeList
                return match_1[1];
            }
            else if(match_2 &&
                _r.has(elem, 'self'))
            {
                return 'Window';
            }
            else if (match_3)
            {
                //return Element
                return 'Element';
            }

            return null;
        }
    }

    /**
     * Converts a HTML string to a node object
     * @param html_str {String} the HTML string to convert
     * @return {Object}
     * @private
     */
    function _stringToNode(html_str)
    {
        var wrapper_obj = document.createElement('div');

        //remove linebreaks and whitespace
        html_str = html_str.replace(/\n\s*|\s*\n/g, '');

        wrapper_obj.innerHTML = html_str;

        return _getElementChildren(wrapper_obj);
    }

    /**
     * Gets the element of a RQuery object
     * @param obj {Object} the object
     * @private
     */
    function _getElement(obj)
    {
        return (obj.instanceType === 'element' && obj.length === 1) ? obj[0] : obj ;
    }

    /**
     * Gets the children of an element
     * @param {Object} elem_obj the element from which the children are to be retrieved
     * @returns {Array}
     * @private
     */
    function _getElementChildren(elem_obj)
    {
        var childNodes = elem_obj.childNodes,
            children = [],
            i = childNodes.length;

        while (i--) {
            if (childNodes[i].nodeType == 1) {
                children.unshift(childNodes[i]);
            }
        }

        return children;
    }

    rQuery.label = 'rquery';
    rQuery.version = '1.0.0';

    /**
     * Map of native forEach
     * @type {Function|Array.forEach}
     */
    Dom.prototype.each = function(callback){
        var elements = _getElement(this),
            i,
            key
            ;

        /*jshint -W116 */
        if(typeof elements.length == 'number')
        {
            for (i = 0; i < elements.length; i++)
            {
                if(callback.call(elements[i], i, elements[i]) === false)
                {
                    return elements;
                }
            }
        }
        else
        {
            if(_r.in_array(_getObjectType(elements), ['Element', 'Window']))
            {
                callback.call(elements, 0, elements);
                return elements;
            }
            else
            {
                for (key in elements)
                {
                    if (callback.call(elements[key], key, elements[key]) === false)
                    {
                        return elements;
                    }
                }
            }
        }
        /*jshint +W116 */
    };

    /**
     * Gets the descendants of an element filtered by selector
     * @param selector {String} the selector
     * @returns {*}
     */
    Dom.prototype.find = function(selector) {
        return _DomCreate(selector, this, undefined);
    };

    /**
     * Create a deep copy of the set of matched elements
     * @returns {*}
     */
    Dom.prototype.clone = function(){
        _this = _getElement(this);
        var _this_clone = _this.cloneNode(true);
        return $(_this_clone);
    };

    /**
     * Gets [or sets] the value of an attribute
     * @param name {String} the identifier of the attribute
     * @param value {String} the value to set. If provided, the method will be a setter.
     * @returns {*}
     */
    Dom.prototype.attr = function(name, value){
        _this = this;
        _this_count_int = _r.count(_this);

        if(_this_count_int > 0)
        {
            _this_el_obj = _this[0];

            if(value)
            {
                if(_this_count_int > 1)
                {
                    //list

                    _this.each(function(index, el)
                    {
                        el.setAttribute(name, value);
                    });
                    return _this;
                }
                else
                {
                    //element

                    _this_el_obj.setAttribute(name, value);
                }
            }
            else
            {
                //list + element

                return _this_el_obj.getAttribute(name);
            }
        }

        return this;
    };

    /**
     * Gets [or sets] the style property of an element
     * @param el {Object} the element
     * @param prop {String} the style property
     * @param value {String} the value to set [optional]
     * @returns {*}
     * @private
     */
    function _style(el, prop)
    {
        var myArgs = Array.prototype.slice.call(arguments),
            value = (_r.isString(myArgs[2])) ? myArgs[2] : null
            ;

        if(!_r.isNullOrUndefined(value))
        {
            //set value

            el.style[prop] = value;
        }
        else
        {
            //get value

            if(el.currentStyle)
            {
                return el.currentStyle[prop];
            }
            else if (window.getComputedStyle)
            {
                return window.getComputedStyle(el)[prop];
            }
        }
    }

    /**
     * Gets [or sets] the computed style properties
     * @param prop {String} the property name
     * @param value {String} the value to set. If provided, this method will be a setter
     * @returns {*}
     */
    Dom.prototype.css = function(prop, value) {

        _this = this;
        _this_count_int = _r.count(_this);

        if(_this_count_int > 0)
        {
            _this_el_obj = _this[0];

            if(_r.isString(value))
            {
                if(_this_count_int > 1)
                {
                    //list

                    _this.each(function(index, el)
                    {
                        _style(el, prop, value);
                    });
                    return _this;
                }
                else
                {
                    //element

                    _style(_this_el_obj, prop, value);
                }
            }
            else
            {
                //list + element

                return _style(_this_el_obj, prop, value);
            }
        }

        return this;
    };

    /**
     * Attach or Detach an event
     * Wrapper class
     * @param op {String} The event operation. Either 'on' or 'off'
     * @param eventType {String} the event type
     * @param callback {Function} the function to execute when the event is triggered
     * @param ctx {Object} the context e.g. this
     * @returns {*}
     * @private
     */
    function _doEvent(op, eventType, callback, ctx) {
        var event_func_str = (op === 'on') ? 'addEventListener' : 'removeEventListener',
            event_func_ms_str = (op === 'on') ? 'attachEvent' : 'detachEvent',
            event_type_str
            ;

        eventType = eventType.split(' ');
        for (var i = 0; i < eventType.length; i++)
        {
            event_type_str = eventType[i];
            if (ctx[event_func_str])
            {
                ctx[event_func_str](event_type_str, callback);

            }
            else if (ctx[event_func_ms_str])
            {
                ctx[event_func_ms_str]("on" + eventType, callback);

                var event_type_list_arr = ("blur focus focusin focusout load resize scroll unload click dblclick input " +
                "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
                "change select submit keydown keypress keyup error contextmenu").split(" ");
                if(!_r.in_array(event_type_str, event_type_list_arr))
                {
                    //is probably custom event

                    var doc_elem_obj = document.documentElement;
                    /*jshint -W083 */
                    if(event_func_ms_str === 'attachEvent')
                    {
                        doc_elem_obj[event_type_str] = 0;
                        doc_elem_obj[event_func_ms_str]('onpropertychange', function (e) {
                            /*jshint -W116 */
                            if(e.propertyName == event_type_str) {
                                //callback();
                                callback();
                            }/*jshint +W116 */
                        });
                        /*jshint +W083 */
                    }
                    else
                    {
                        doc_elem_obj[event_func_ms_str]('onpropertychange', callback);
                    }
                }
            }
            else {
                ctx["on" + event_type_str] = (op === 'on') ? callback : null;
            }
        }
        return ctx;
    }

    /**
     * Cancels the event if it canceleable
     * @param event {Object} the event object
     */
    rQuery.preventDefault = function(event)
    {
        if(event.preventDefault)
        {
            event.preventDefault();
        }

        if(_data('isRQueryActive'))
        {
            //support IE
            event.returnValue = false;
        }
    };

    /**
     * Stops bubbling of an event to its parent
     * @param event {Object} the event object
     */
    rQuery.stopPropagation = function(event)
    {
        if (event.stopPropagation)
        {
            event.stopPropagation();
        }

        if(_data('isRQueryActive'))
        {
            //support IE
            event.cancelBubble = true;
        }
    };

    /**
     * on and off dual event handler method
     * @param context {Object} the context; this is usually this reference
     * @param eventName {String} the event handler name; either on or off
     * @param eventType {String} the event type e.g. click, etc.
     * @param callback {Function} the callback function
     * @returns {*}
     * @private
     */
    function _onOrOffEvent(context, eventName, eventType, callback)
    {
        _this = context;
        _this_count_int = _r.count(_this);

        if(_this_count_int > 0)
        {
            if(_this_count_int > 1)
            {
                //list

                _this.each(function(index, el)
                {
                    _doEvent(eventName, eventType, callback, el);
                });
                return _this;
            }
            else
            {
                //element

                _this_el_obj = _this[0];

                return _doEvent(eventName, eventType, callback, _this_el_obj);
            }
        }
    }

    /**
     * Attach an event handler for one or more events to the selected elements
     * @param eventType {String} The event identifier
     * @param callback {Function} The event handler
     * @returns {Object}
     */
    Dom.prototype.on = function(eventType, callback) {
        return _onOrOffEvent(this, 'on', eventType, callback);
    };

    /**
     * Remove an event handler
     * @param eventType {String} The event identifier
     * @param callback {Function} The event handler
     * @returns {Object}
     */
    Dom.prototype.off = function(eventType, callback) {
        return _onOrOffEvent(this, 'off', eventType, callback);
    };

    /**
     * Manually executes an event handler attached to the element
     * @param eventName {String} The event identifier
     * @param eventData {Function} data that is passed along
     * @return {*}
     */
    Dom.prototype.trigger = function(eventName) {
        _this = _getElement(this);

        var myArgs = Array.prototype.slice.call(arguments),
            eventData = (myArgs[1]) ? myArgs[1]: {},
            event;

        if (window.CustomEvent)
        {
            event = new CustomEvent(eventName, {detail: eventData});
            _this.dispatchEvent(event);
        }
        else if (document.createEvent)
        {
            event = document.createEvent('Event');
            event.initEvent(eventName, true, true, eventData);
            _this.dispatchEvent(event);
        }
        else
        {
            if(_this[eventName])
            {
                _this[eventName]();
            }
            document.documentElement[eventName] = 1;
        }

        return this;
    };

    /**
     * Adds or removes a class from a DOM Object
     * Wrapper class
     * @param op {String} The Class operation. Either 'add' or 'remove'
     * @param name {String} The Class name(s)
     * @param ctx {Object} The Object Context
     */
    function _doClass(op, name, ctx)
    {
        //get existing class
        var class_orig_str = ctx.getAttribute("class");
        class_orig_str = (!class_orig_str) ? '': class_orig_str;

        var i,
            class_orig_arr = (class_orig_str) ? class_orig_str.split(/\s+/g): [],
            class_new_arr = name.split(/\s+/g),
            class_new_str = '';

        if (!ctx.classList)
        {
            //classList not defined: probably old browser

            var class_item_str,
                class_list_arr = (op === 'remove') ? class_orig_arr : class_new_arr,
                class_list_haystack_arr = (op === 'remove') ? class_new_arr : class_orig_arr
                ;
            class_new_str = (op === 'remove') ? class_new_str : class_orig_str;

            for(i = 0; i < class_list_arr.length; i++)
            {
                class_item_str = class_list_arr[i].trim();
                if(!_r.in_array(class_item_str, class_list_haystack_arr))
                {
                    class_new_str += (op === 'remove') ? class_item_str+" " : " "+class_item_str;
                }
            }
            ctx.className = class_new_str.trim();

            //repaint
            ctx.innerHTML = ctx.innerHTML.replace('>', '>');
        }
        else
        {
            for(i = 0; i < class_new_arr.length; i++)
            {
                var class_list_item_new_str = class_new_arr[i].trim();
                ctx.classList[op](class_list_item_new_str);
            }
        }
    }

    /**
     * Adds or removes one or more classes
     * Wrapper class for _doClass
     * @param ctx {Object} the context
     * @param op {String} the name of the operation. Either 'add' or 'remove'
     * @param name {String} the class name(s)
     * @returns {*}
     * @private
     */
    function _addRemoveClass(ctx, op, name)
    {
        _this = ctx;
        _this_count_int = _r.count(_this);

        //return if string is empty
        if(_r.isString(name) && name.length < 1)
        {
            return _this;
        }

        //trim class data
        name = name.trim();

        if(_this_count_int > 0) {
            _this_el_obj = _this[0];

            if (_r.isString(name)) {
                if (_this_count_int > 1) {
                    //list

                    _this.each(function (index, el) {
                        _doClass(op, name, el);
                    });
                }
                else {
                    //element

                    _doClass(op, name, _this_el_obj);
                }
            }
            else {
                //list + element

                _doClass(op, name, _this_el_obj);
            }

            return _this;
        }
    }

    /**
     * Checks if an element has a class
     * @param ctx {Object} the context
     * @param name {String} the name of the class
     * @returns {*}
     * @private
     */
    function _hasClass(ctx, name)
    {
        if (!ctx.classList) {
            return ctx.className && new RegExp("(\\s|^)" + name + "(\\s|$)", "gi").test(ctx.className);
        }
        else {
            return ctx.classList.contains(name);
        }
    }

    /**
     * Checks if an element has a class
     * @param name {String} the class name
     * @return {Boolean}
     */
    Dom.prototype.hasClass = function(name) {
        _this = _getElement(this);
        return _hasClass(_this, name);
    };

    /**
     * Adds the specified class(es) to the selected element
     * @param name {String} the class name
     * @return {*}
     */
    Dom.prototype.addClass = function(name) {
        return _addRemoveClass(this, 'add', name);
    };

    /**
     * Removes the specified class(es) from the selected element
     * @param name {String} the class name
     * @return {*}
     */
    Dom.prototype.removeClass = function(name) {
        return _addRemoveClass(this, 'remove', name);
    };

    /**
     * Toggles a class off and on from the selected element
     * @param name {String} the class name
     * @return {Dom}
     */
    Dom.prototype.toggleClass = function(name){
        _this = _getElement(this);
        if(_hasClass(_this, name))
        {
            //remove
            _addRemoveClass(this, 'remove', name);
        }
        else
        {
            //add
            _addRemoveClass(this, 'add', name);
        }
        return this;
    };

    /**
     * Removes an attribute from the DOM
     * @param name {String} the name of the attribute
     * @returns {*}
     */
    Dom.prototype.removeAttr = function(name){
        _this = _getElement(this);
        _this.removeAttribute(name);

        return this;
    };


    /**
     * Get the immediately following sibling of an element
     * @return {*}
     */
    Dom.prototype.next = function(){
        _this = _getElement(this);
        if (_this.nextElementSibling){
            return rQuery(_this.nextElementSibling);
        }
        var el = _this;
        do { el = el.nextSibling; } while (el && el.nodeType !== 1);
        return rQuery(el);
    };

    /**
     * Get the immediately preceding sibling of an element
     * @return {*}
     */
    Dom.prototype.prev = function(){
        _this = _getElement(this);
        if (_this.previousElementSibling){
            return rQuery(_this.previousElementSibling);
        }
        var el = _this;
        do { el = el.previousSibling; } while (el && el.nodeType !== 1);
        return rQuery(el);
    };

    /**
     * Get the parent of the element
     * @return {*}
     */
    Dom.prototype.parent = function(){
        _this = _getElement(this);
        return rQuery(_this.parentNode);
    };

    /**
     * Get the child of the element
     * @param pos_int {Number} the position of the child. By default, the first child is returned
     * Note: Child position starts from 0 i.e. 0 for first child, 1 for second, etc.
     * Note: Returns only one child
     * Note: Returns undefined if element has no child
     * @return {*}
     */
    Dom.prototype.child = function(){
        var myArgs = Array.prototype.slice.call(arguments),
            pos_int = (_r.isNumber(myArgs[0])) ? myArgs[0]: 0,
            _this = _getElement(this);
        return (_this.children.length > 0) ? rQuery(_this.children[pos_int]) : undefined;
    };

    /**
     * Get the current value of the element
     * This is for form elements only
     * @param value {String} the value to set [optional]
     * @return {*|String}
     */
    Dom.prototype.val = function(){
        var myArgs = Array.prototype.slice.call(arguments);
        _this = _getElement(this);
        if(_r.isString(myArgs[0]) || _r.isNumber(myArgs[0]) || _r.isBool(myArgs[0])) {
            if(_this.length > 1)
            {
                //list
                _this.each(function (index, el) {
                    el.value = ''+myArgs[0]+'';
                });
            }
            else
            {
                //element
                _this.value = ''+myArgs[0]+'';
            }

            return this;
        }
        else
        {
            return _this.value;
        }
    };

    /**
     * Get [or set] the html contents of the element
     * @param value {String} the HTML string to set [optional]
     * @return {*|Boolean|String}
     */
    Dom.prototype.html = function(){
        var myArgs = Array.prototype.slice.call(arguments);
        _this = _getElement(this);
        if(_r.isString(myArgs[0]))
        {
            if(_this.length > 1)
            {
                //list
                _this.each(function (index, el) {
                    el.innerHTML = myArgs[0];
                });
            }
            else
            {
                //element
                _this.innerHTML = myArgs[0];
            }

            return this;
        }
        else
        {
            return _this.innerHTML;
        }
    };

    /**
     * Shows or hides an element
     * @param {Object} ctx the context
     * @param {String} op the operation type. Either 'show' or 'hide'
     * @returns {Dom}
     * @private
     */
    function _showHide(ctx, op)
    {
        var display_val_str = (op === 'hide') ? 'none' : '';
        _this = ctx;
        _this_count_int = _r.count(_this);
        if(_this_count_int > 0)
        {
            _this.each(function (index, el) {
                el.style.display = display_val_str;
            });
        }

        /*jshint validthis: true */
        return this;
    }

    /**
     * Displays an element
     * @returns {Dom}
     */
    Dom.prototype.show = function(){
        return _showHide(this, 'show');
    };

    /**
     * Hides an element
     * @returns {Dom}
     */
    Dom.prototype.hide = function(){
        return _showHide(this, 'hide');
    };

    /**
     * Show or hide an element based on state
     * For example, if the item is hidden, show it; and if it is shown, hide it
     */
    Dom.prototype.toggle = function(){
        _this = _getElement(this);
        var value = _style(_this, 'display');

        if(value === 'none')
        {
            _this.style.display = '';
        }
        else
        {
            _this.style.display = 'none';
        }

        return this;
    };

    /**
     * Removes an element
     */
    Dom.prototype.remove = function(){
        _this = _getElement(this);
        _this.parentNode.removeChild(_this);
    };

    /**
     * Insert an element to the end of all elements within a reference element
     * Analogous to JQuery $.append method
     * @param ref_obj {Element} The reference [destination] element
     * @return {*}
     */
    Dom.prototype.append = function(ref_obj) {
        _this = _getElement(this);
        _ref_obj = _getElement(ref_obj);
        _ref_obj = (_r.isString(ref_obj)) ? _stringToNode(ref_obj) : _ref_obj;
        if(_ref_obj.length > 0)
        {
            _ref_obj.forEach(function(el){
                _this.appendChild(el);
            });
        }
        else if(_ref_obj)
        {
            _this.appendChild(_ref_obj);
        }
        return this;
    };

    /**
     * Insert an element to the end of all elements within a reference element
     * Analogous to JQuery $.appendTo method
     * @param ref_obj {Element} The reference [destination] element
     * @return {*}
     */
    Dom.prototype.appendTo = function(ref_obj) {
        _this = _getElement(this);
        ref_obj = (_r.isString(ref_obj) && (ref_obj === "head" || ref_obj === "body")) ? rQuery(ref_obj): ref_obj;
        _ref_obj = _getElement(ref_obj);
        _ref_obj = (_r.isString(ref_obj)) ? _stringToNode(ref_obj) : _ref_obj;
        if(_getObjectType(_this) === 'Element')
        {
            _ref_obj.appendChild(_this);
            return this;
        }
        _appendToList(_ref_obj, this);
        return this;
    };

    /**
     * Insert an element to the end of all elements with a reference [NodeList/HTMLCollection/StaticNodeList]
     * @param obj {Object} the reference object
     * @param _this {Object} the context
     * @returns {*}
     * @private
     */
    function _appendToList(obj, _this){
        _this.each(function(index, el) {
            obj.appendChild(el);
        });
        return _this;
    }

    /**
     * Insert an element to the start of all elements within a reference element
     * Analogous to JQuery $.prepend method
     * @param ref_obj {Element} The reference [destination] element
     * @return {*}
     */
    Dom.prototype.prepend = function(ref_obj) {
        _this = _getElement(this);
        _ref_obj = _getElement(ref_obj);
        _ref_obj = (_r.isString(_ref_obj)) ? _stringToNode(_ref_obj) : _ref_obj;
        if(_ref_obj.length > 0)
        {
            for (var i = _ref_obj.length - 1; i >= 0; i--)
            {
                _this.insertBefore(_ref_obj[i], _this.firstChild);
            }
        }
        else if(_ref_obj)
        {
            _this.insertBefore(_ref_obj, _this.firstChild);
        }
        return this;
    };

    /**
     * Insert an element to the start of all elements within a reference element
     * Analogous to JQuery $.prependTo method
     * @param ref_obj {Element} The reference [destination] element
     * @return {*}
     */
    Dom.prototype.prependTo = function(ref_obj) {
        _this = _getElement(this);
        ref_obj = (_r.isString(ref_obj) && (ref_obj === "head" || ref_obj === "body")) ? rQuery(ref_obj): ref_obj;
        _ref_obj = _getElement(ref_obj);
        _ref_obj = (_r.isString(_ref_obj)) ? _stringToNode(_ref_obj) : _ref_obj;
        if(_getObjectType(_this) === 'Element') {
            _ref_obj.insertBefore(_this, _ref_obj.firstChild);
            return this;
        }

        if(this.selector_method !== 'querySelectorAll')
        {
            _this = document.querySelectorAll(this.selector);
        }
        _prependToList(_ref_obj, _this);
        return this;
    };

    /**
     * Insert an element to the start of all elements with a reference [NodeList/HTMLCollection/StaticNodeList]
     * @param obj {Object} the reference object
     * @param _this {Object} the context
     * @returns {*}
     * @private
     */
    function _prependToList(obj, _this){

        for (var i = _this.length-1; i >= 0; i--)
        {
            obj.insertBefore(_this[i], obj.firstChild);
        }
        return _this;
    }

    /**
     * Insert an element before a reference element
     * Analogous to JQuery $.insertBefore method
     * @param ref_obj {Element} The reference [destination] element
     * @return {*}
     */
    Dom.prototype.addBefore = function(ref_obj) {
        _this = _getElement(this);
        _ref_obj = _getElement(ref_obj);
        _parent_ref_obj = _ref_obj.parentNode;
        _parent_ref_obj.insertBefore(_this, _ref_obj);
        return this;
    };

    /**
     * Insert an element after a reference element
     * Analogous to JQuery $.insertAfter method
     * @param ref_obj {Element} The reference [destination] element
     * @return {*}
     */
    Dom.prototype.addAfter = function(ref_obj) {
        _this = _getElement(this);
        _ref_obj = _getElement(ref_obj);
        _parent_ref_obj = _ref_obj.parentNode;
        _parent_ref_obj.insertBefore(_this, _ref_obj.nextSibling);
        return this;
    };

    /**
     * Gets the width or height of an element
     * @param ctx {Object} the context
     * @param prop {String} the property name. Either width or height
     * @param op_type_str {String} the type of operation. Either outer, inner, or main
     * @param inc_margin_bool {String} determines if the margin is included in calculation. Valid for outer op_type_str only
     * @returns {*}
     * @private
     */
    function _getDimension(ctx, prop)
    {
        var myArgs = Array.prototype.slice.call(arguments),
            el = ctx[0],
            selector = ctx.selector,
            op_type_str = (_r.isString(myArgs[2])) ? myArgs[2] : 'main',
            inc_margin_bool = (_r.isBool(myArgs[3])) ? myArgs[3] : false,
            is_getcomputedstyle_bool = ((typeof window.getComputedStyle !== 'undefined')),
            outer_margin_idx_1_str = (prop === 'height') ? 'marginTop' : 'marginLeft',
            outer_margin_idx_2_str = (prop === 'height') ? 'marginBottom' : 'marginRight',
            outer_border_idx_1_str = (prop === 'height') ? 'borderTopWidth' : 'borderLeftWidth',
            outer_border_idx_2_str = (prop === 'height') ? 'borderBottomWidth' : 'borderRightWidth',
            outer_padding_idx_1_str = (prop === 'height') ? 'paddingTop' : 'paddingLeft',
            outer_padding_idx_2_str = (prop === 'height') ? 'paddingBottom' : 'paddingRight',
            fallback_func_str = (prop === 'height') ? 'clientHeight' : 'clientWidth',
            style_obj,
            dim_int,
            dim_padding_int = 0,
            dim_border_int = 0,
            dim_margin_int = 0
            ;

        //Compute for window object
        if(_isWindow(el))
        {
            return document.documentElement[fallback_func_str];
        }

        //Compute for HTML object
        if(selector === "html" || el === document)
        {
            var func_type_str = (prop === "height") ? "Height" : "Width",
                el_win = window,
                el_doc = document.documentElement,
                el_body = document.body || document.getElementsByTagName("body")[0],
                el_body_s_dim_int = (el_body['scroll'+func_type_str]) ? el_body['scroll'+func_type_str] : 0,
                el_body_o_dim_int = (el_body['offset'+func_type_str]) ? el_body['offset'+func_type_str] : 0,
                el_body_c_dim_int = (el_body['client'+func_type_str]) ? el_body['client'+func_type_str] : 0,
                el_doc_s_dim_int = (el_doc['scroll'+func_type_str]) ? el_doc['scroll'+func_type_str] : 0,
                el_doc_o_dim_int = (el_doc['offset'+func_type_str]) ? el_doc['offset'+func_type_str] : 0,
                el_doc_c_dim_int = (el_doc['client'+func_type_str]) ? el_doc['client'+func_type_str] : 0,
                el_win_i_dim_int = (el_win['inner'+func_type_str]) ? el_win['inner'+func_type_str] : 0
                ;

            return (prop === "height") ? Math.max(el_body_s_dim_int, el_body_o_dim_int, el_doc_s_dim_int, el_doc_o_dim_int, el_doc_c_dim_int) : el_win_i_dim_int || el_doc_c_dim_int || el_body_c_dim_int || el_body_o_dim_int;
        }

        //Get the Primary Dimension
        dim_int = (prop === 'height') ? el.offsetHeight : el.offsetWidth;

        //Compute the rest
        if(is_getcomputedstyle_bool)
        {
            //Use getComputedStyle
            style_obj = window.getComputedStyle(el, null);
            if(op_type_str === 'outer')
            {
                dim_margin_int = (inc_margin_bool) ? parseInt(style_obj[outer_margin_idx_1_str]) + parseInt(style_obj[outer_margin_idx_2_str]) : 0;
            }
            else if (op_type_str === 'inner')
            {
                dim_border_int = parseInt(style_obj[outer_border_idx_1_str]) + parseInt(style_obj[outer_border_idx_2_str]);
                dim_border_int = -dim_border_int;
            }
            else
            {
                dim_int = parseInt(style_obj[prop]);
            }
        }
        else
        {
            //Use currentStyle or native
            if(op_type_str === 'outer')
            {
                var dim_margin_1_int = (parseInt(el.currentStyle[outer_margin_idx_1_str], 10)) ? parseInt(el.currentStyle[outer_margin_idx_1_str], 10): 0,
                    dim_margin_2_int = (parseInt(el.currentStyle[outer_margin_idx_2_str], 10)) ? parseInt(el.currentStyle[outer_margin_idx_2_str], 10): 0
                    ;
                dim_margin_int = (inc_margin_bool) ? dim_margin_1_int + dim_margin_2_int : 0;
            }
            else if (op_type_str === 'inner')
            {
                var dim_border_1_int = (parseInt(el.currentStyle[outer_border_idx_1_str], 10)) ? parseInt(el.currentStyle[outer_border_idx_1_str], 10): 0,
                    dim_border_2_int = (parseInt(el.currentStyle[outer_border_idx_2_str], 10)) ? parseInt(el.currentStyle[outer_border_idx_2_str], 10): 0
                    ;
                dim_border_int = dim_border_1_int + dim_border_2_int;
                dim_border_int = -dim_border_int;
            }
            else
            {
                if(parseInt(el.currentStyle[prop], 10))
                {
                    dim_int = parseInt(el.currentStyle[prop], 10);
                }
                else
                {
                    dim_int = el[fallback_func_str];

                    var dim_padding_1_int = (parseInt(el.currentStyle[outer_padding_idx_1_str], 10)) ? parseInt(el.currentStyle[outer_padding_idx_1_str], 10): 0,
                        dim_padding_2_int = (parseInt(el.currentStyle[outer_padding_idx_2_str], 10)) ? parseInt(el.currentStyle[outer_padding_idx_2_str], 10): 0
                        ;
                    dim_padding_int = dim_padding_1_int + dim_padding_2_int;
                    dim_padding_int = -dim_padding_int;
                }
            }
        }

        return dim_int + dim_padding_int + dim_border_int + dim_margin_int;
    }

    /**
     * Get or set the current vertical position of the scroll bar
     * @param value {Number} an integer indicating the new position to set the scroll bar to [optional]
     * @returns {Number}
     * @private
     */
    function _scrollTop()
    {
        var myArgs = Array.prototype.slice.call(arguments),
            value = (_r.isNumber(myArgs[0])) ? myArgs[0] : false,
            ctx = (myArgs[1]) ? myArgs[1] : $('body'),
            _ctx = ctx[0],
            doc_scroll_obj;

        if(ctx.selector === 'body' || ctx.selector === 'html')
        {
            doc_scroll_obj = (document.documentElement && document.documentElement.scrollTop) ? document.documentElement : document.body;
        }
        else
        {
            doc_scroll_obj = _ctx;
        }

        if(value)
        {
            doc_scroll_obj.scrollTop = value;
        }
        return parseInt(doc_scroll_obj.scrollTop);
    }

    /**
     * Get or set the current horizontal position of the scroll bar
     * @param value {Number} an integer indicating the new position to set the scroll bar to [optional]
     * @returns {Number}
     * @private
     */
    function _scrollLeft()
    {
        var myArgs = Array.prototype.slice.call(arguments),
            value = (_r.isNumber(myArgs[0])) ? myArgs[0] : false,
            ctx = (myArgs[1]) ? myArgs[1] : $('body'),
            _ctx = ctx[0],
            doc_scroll_obj;

        if(ctx.selector === 'body' || ctx.selector === 'html')
        {
            doc_scroll_obj = (document.documentElement && document.documentElement.scrollLeft) ? document.documentElement : document.body;
        }
        else
        {
            doc_scroll_obj = _ctx;
        }

        if(value)
        {
            doc_scroll_obj.scrollLeft = value;
        }
        return parseInt(doc_scroll_obj.scrollLeft);
    }

    /**
     * Get the current coordinates of the first element in the set of matched elements, relative to the document
     * @param ctx {*} the context [must be DOM element within <body>]
     * @returns {*}
     * @private
     */
    function _offset(ctx)
    {
        var _rect_obj = ctx.getBoundingClientRect(),
            _scroll_left_int = _scrollLeft(),
            _scroll_top_int = _scrollTop()
            ;

        return {left: _rect_obj.left+_scroll_left_int, top: _rect_obj.top+_scroll_top_int};
    }

    /**
     * Get the current coordinates of the first element in the set of matched elements, relative to the offset parent
     * Returns an object containing the properties top and left
     * @returns {*}
     */
    Dom.prototype.position = function(){
        var _this = this[0];
        return {left: _this.offsetLeft, top: _this.offsetTop};
    };

    /**
     * Get the current coordinates of the first element in the set of matched elements, relative to the document
     * Returns an object containing the properties top and left
     * @returns {*}
     */
    Dom.prototype.offset = function(){
        var _this = this[0];
        return _offset(_this);
    };

    /**
     * Get or set the current vertical position of the scroll bar
     * Wrapper class for _scrollTop()
     * @returns {Number}
     */
    Dom.prototype.scrollTop = function(value){
        return _scrollTop(value, this);
    };

    /**
     * Get or set the current horizontal position of the scroll bar
     * Wrapper class for _scrollTop()
     * @returns {Number}
     */
    Dom.prototype.scrollLeft = function(value){
        return _scrollLeft(value, this);
    };

    /**
     * Gets the width of an element
     * Analogous to JQuery $.width()
     * @return {Number}
     */
    Dom.prototype.width = function(){
        var width_str = _getDimension(this, 'width').toString(),
            op_offset_int = (width_str.indexOf('px') < 0) ? 0 : 2;
        return parseInt(width_str.slice(0, width_str.length - op_offset_int), 10);
    };

    /**
     * Gets the inner width of an element
     * Analogous to JQuery $.innerWidth()
     * @return {Number}
     */
    Dom.prototype.innerWidth = function(){
        var width_str = _getDimension(this, 'width', 'inner').toString(),
            op_offset_int = (width_str.indexOf('px') < 0) ? 0 : 2;
        return parseInt(width_str.slice(0, width_str.length - op_offset_int), 10);
    };

    /**
     * Gets the outer width of an element
     * Analogous to JQuery $.outerWidth()
     * @param inc_margin_bool {Boolean} determines whether the margin value should be included
     * @return {Number}
     */
    Dom.prototype.outerWidth = function(inc_margin_bool){
        var width_str = _getDimension(this, 'width', 'outer', inc_margin_bool).toString(),
            op_offset_int = (width_str.indexOf('px') < 0) ? 0 : 2;
        return parseInt(width_str.slice(0, width_str.length - op_offset_int), 10);
    };

    /**
     * Gets the height of an element
     * Analogous to JQuery $.height()
     * @return {Number}
     */
    Dom.prototype.height = function(){
        var height_str = _getDimension(this, 'height').toString(),
            op_offset_int = (height_str.indexOf('px') < 0) ? 0 : 2;
        return parseInt(height_str.slice(0, height_str.length - op_offset_int), 10);
    };

    /**
     * Gets the height of an element
     * Analogous to JQuery $.innerHeight()
     * @return {Number}
     */
    Dom.prototype.innerHeight = function(){
        var height_str = _getDimension(this, 'height', 'inner').toString(),
            op_offset_int = (height_str.indexOf('px') < 0) ? 0 : 2;
        return parseInt(height_str.slice(0, height_str.length - op_offset_int), 10);
    };

    /**
     * Gets the outer height of an element
     * Analogous to JQuery $.outerHeight()
     * @param inc_margin_bool {Boolean} determines whether the margin value should be included
     * @return {Number}
     */
    Dom.prototype.outerHeight = function(inc_margin_bool){
        var height_str = _getDimension(this, 'height', 'outer', inc_margin_bool).toString(),
            op_offset_int = (height_str.indexOf('px') < 0) ? 0 : 2;
        return parseInt(height_str.slice(0, height_str.length - op_offset_int), 10);
    };

    /**
     * Gets or sets arbitrary data
     * @param key {String} the key
     * @param val {String|Number|Boolean} the value
     * @param ctx {Object} the context. Default is window
     * @returns {*}
     * @private
     */
    function _data(key, val)
    {
        var myArgs = Array.prototype.slice.call(arguments),
            ctx = (!myArgs[2]) ? window : myArgs[2],
            _this = ctx,
            object_store_fn_str = 'objectStore';

        if(_isWindow(ctx))
        {
            object_store_fn_str = 'rObjectStore';

            //initialize window object store
            if(!ctx[object_store_fn_str])
            {
                ctx[object_store_fn_str] = {};
            }
        }

        //set method
        var _setValue = function(key, value){
            _this[object_store_fn_str][key] = value;
        };

        //get method
        var _getValue = function(key)
        {
            return _this[object_store_fn_str][key];
        };

        if (key)
        {
            if(!_r.isNullOrUndefined(val))
            {
                _setValue(key, val);
                /*jshint -W040 */
                return this;
                /*jshint +W040 */
            }
            else
            {
                return _getValue(key);
            }
        }
    }

    /**
     * Get or set arbitrary data associated with a matched element
     * Wrapper class of _data
     * @param key {String} the identifier of the data value
     * @param val {*} the data value
     * @return {*}
     */
    Dom.prototype.data = function(key, val)
    {
        return _data(key, val, this);
    };

    /**
     * Get or set arbitrary data to window-scope storage
     * Wrapper class of _data
     * @param key {String} the identifier of the data value
     * @param val {*} the data value
     * @returns {*}
     */
    rQuery.data = function(key, val)
    {
        return _data(key, val, window);
    };

    /**
     * Checks whether the object is an RQuery Object
     * @param elem_obj {Object} the Object to test
     * @returns {boolean}
     */
    rQuery.isRQueryObject = function(elem_obj)
    {
        return ((elem_obj.label === 'rquery'));
    };

    /**
     * Extends the Dom object by adding a method
     * @param name {String} the name of the function
     * @param func {Function} the function to add to the Dom object
     */
    rQuery.extend = function(name, func){
        Dom.prototype[name] = func;
    };

    //assign to window object
    window.rQuery = rQuery;

    //assign to $ namespace if it is undefined
    _data('isRQueryActive', false);
    if(!window.$)
    {
        window.$ = window.rQuery;
        _data('isRQueryActive', true);
    }

})(_r);


/*! Plain javascript replacement of .ready() function from jQuery | @link https://github.com/jfriend00/docReady | @copyright John Friend <https://github.com/jfriend00> | @license MIT */
(function(funcName, baseObj) {
    // The public function name defaults to window.docReady
    // but you can modify the last line of this function to pass in a different object or method name
    // if you want to put them in a different namespace and those will be used instead of
    // window.docReady(...)
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function(callback, context) {
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        // IE only safe when readyState is "complete", others safe when readyState is "interactive"
        if (document.readyState === "complete" || (!document.attachEvent && document.readyState === "interactive")) {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    };
})("domReady", $);
// modify this previous line to pass in your own method name
// and object for the method to be attached to
