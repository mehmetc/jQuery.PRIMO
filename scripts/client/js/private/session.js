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
                        dataType: 'text',
                        url: jQuery.PRIMO.parameters.base_path + '/helpers/frontend_id',
                        success: function (data, event, xhr) {
                            FEID = data.trim();
                        },
                        error: function(){
                            FEID='unknown';
                        }
                    });
            }
            return FEID;
        }
    }
})();

/**
 * Retrieves user id, name and if user is logged in
 * @method _getUserInfo
 * @returns {Object} returns a User object.
 * @description There is also a native window.getUserInfo() method it does exactly the same thing but is less efficient.
 * @private
 */
var _getUserInfo = (function () {
    var user = null;
    return {
        data: function () {
            if (!user) {
                user = {};
                jQuery.ajax(
                    {
                        async: false,
                        type: 'get',
                        dataType: 'xml',
                        url: '/primo_library/libweb/getUserInfoServlet',
                        success: function (data, event, xhr) {
                            user.id = jQuery(data).find('userId').text();
                            user.name = jQuery(data).find('userName').text();
                            user.loggedIn = jQuery(data).find('isLoggedIn').text() === 'true';
                        }
                    });
            }

            return user;
        }
    };
})();

/**
 * Retrieves session data only available on the server
 * @method _getSessionData
 * @returns {Object} returns session data.
 * @description Retrieves session data from server with fallback
 * @private
 */
var _getSessionData = function () {
    var sessionData = null;
    var getSessionData = function () {
        if (!sessionData) {
            sessionData = {};
            jQuery.ajax({
                async: false,
                type: 'get',
                dataType: 'json',
                url: jQuery.PRIMO.parameters.base_path + '/helpers/remote_session_data_helper.jsp',
                success: function (data, textStatus, jqXHR) {
                    sessionData = jQuery.extend(true, {}, data);

                    sessionData.user.isLoggedIn = function () {
                        return data.user.isLoggedIn;
                    };
                    sessionData.user.isOnCampus = function () {
                        return data.user.isOnCampus;
                    };
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // Fallback when file is not available. Maybe we should not do this.
                    //TODO: do we need this?
                    sessionData = {
                        view: {code: $('#vid').val()},
                        user: {
                            id: _getUserInfo.data().id,
                            name: _getUserInfo.data().name,
                            isLoggedIn: function () {
                                return _getUserInfo.data().loggedIn;
                            }
                        }
                    }
                }

            });

            $.extend(sessionData.view, {
                isFullDisplay: function () {
                    return window.isFullDisplay();
                },

                frontEndID: (function () {
                    return _getFrontEndID.data();
                }())
            });

            sessionData.reload = function () {
                sessionData = null;
                jQuery.PRIMO.session = getSessionData();
                return sessionData;
            }

            return sessionData;
        }
    };

    return getSessionData();
};
