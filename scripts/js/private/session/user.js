/**
 * Retrieves user id, name and if user is logged in
 * @method
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
                            user.id = $(data).find('userId').text();
                            user.name = $(data).find('userName').text();
                            user.loggedIn = $(data).find('isLoggedIn').text() === 'true';
                        }
                    });
            }

            return user;
        }
    };
})();