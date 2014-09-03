/**
 *
 * An ExLibris PRIMO convinience Library
 */

/**
 * @namespace
 * @property {object} session                               - session data
 * @property {object} session.view                          - info on current view
 * @property {string} session.view.frontEndID               - frontend id that rendered the view
 * @property {string} session.view.name                     - view name
 * @property {string} session.view.language                 - current view language
 * @property {object} session.view.institution              - institution set to the view
 * @property {object} session.view.institution.name         - institution name
 * @property {string} session.view.institution.name.vid     - institution name according to the VID
 * @property {string} session.view.institution.name.ip      - institution name mapped on user IP
 * @property {string} session.view.institution.name.view    - institution name mapped to user view
 * @property {object} session.view.institution.code         - institution code
 * @property {string} session.view.institution.code.vid     - institution code by VID
 * @property {string} session.view.institution.code.ip      - institution code mapped on user IP
 * @property {string} session.view.institution.code.view    - institution code mapped on user view
 * @method   {boolean} session.view.isFullDisplay           - is the current view in full display mode
 * @property {object} session.user                          - user data
 * @property {string} session.user.id                       - user id
 * @property {string} session.user.name                     - user name
 * @property {object} session.user.group                    - user group
 * @property {string} session.user.group.id                 - group id
 * @property {string} session.user.group.name               - group name
 * @property {boolean} session.user.isOnCampus              - is the user on campus
 * @method   {boolean} session.user.isLoggedIn              - is the user logged in
 * @property {array} records                                - available records
 *
 *
 *
 * ### Get current view name
 * @example
 * > console.log(jQuery.PRIMO.session.view.name);
 * "KULeuven"
 *
 */
jQuery.PRIMO = {
    session: {
        view: (function () {
            return $.extend({}, _getRemoteSessionData.data(),{
                isFullDisplay: (function () {
                    return window.isFullDisplay();
                })(),

                frontEndID: (function () {
                    return _getFrontEndID.data();
                }())
            });
        })(),
        user: {
            id: _getUserInfo.data().id,
            name: _getUserInfo.data().name,
            group: {
                id: '',
                name: ''
            },
            isOnCampus: '',
            isLoggedIn: function () {
                return _getUserInfo.data().loggedIn;
            }
        }

    },
    records: (function () {
        var records_count = jQuery('.EXLResult').length;
        var data = [];

        for (var j = 0; j < records_count; j++) data.push(_record(j));

        return $(data);
    }())
};
