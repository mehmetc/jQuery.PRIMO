/**
 * Reads the FrontEndID from the X-PRIMO-FE-ENVIRONMENT header
 * create or add to /exlibris/primo/p4_1/ng/primo/home/system/tomcat/search/webapps/primo_library#libweb/WEB-INF/urlrewrite.xml
 *
 *  <urlrewrite>
 *      <rule>
 *          <from>.*</from>
 *          <set type="response-header" name="X-PRIMO-FE-ENVIRONMENT">sandbox</set>
 *      </rule>
 *  </urlrewrite>
 *
 *  replace 'sandbox' with the name you want to give to your frontend
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