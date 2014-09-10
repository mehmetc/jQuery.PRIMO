/**
 * Reads the FrontEndID from the X-PRIMO-FE-ENVIRONMENT header
 * @method _getFrontEndID
 * @return {String} FrontEnd ID
 * @private
 */
var _getFrontEndID = (function () {
    var FEID = null;

    return {
        data: function () {
            if (!FEID) {
                FEID = 'unknown';
                jQuery.ajax(
                    {
                        async: false,
                        type: 'get',
                        url: '/primo_library/libweb/static_htmls/header.html',
                        complete: function (xhr, status) {
                            FEID = xhr.getResponseHeader('X-PRIMO-FE-ENVIRONMENT');
                        }
                    });
            }
            return FEID;
        }
    }
})();