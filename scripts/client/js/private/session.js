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
                        cache: false,
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
                cache: false,
                dataType: 'json',
                url: jQuery.PRIMO.parameters.base_path + '/session',
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
                }
            });

            sessionData.reload = function () {
                sessionData = null;
                jQuery.PRIMO.session = getSessionData();
                return sessionData;
            };

            if (((typeof window.performance) !== "undefined") && ((typeof window.performance.timing) !== "undefined")) {
                sessionData.performance = {
                    timing: {
                        getNetworkLatency: function(){return (performance.timing.responseEnd - performance.timing.fetchStart)},
                        getPageRender: function(){return (performance.timing.loadEventEnd - performance.timing.responseEnd)},
                        getPageLoad: function(){return (performance.timing.loadEventEnd - performance.timing.navigationStart)}
                    }
                };
            }

            return sessionData;
        }
    };

    return getSessionData();
};
