/**
 * Retrieves session data only available on the server
 * @method _getSessionData
 * @returns {Object} returns session data.
 * @description Retrieves session data from server with fallback
 * @private
 */
var _getSessionData = (function() {
      var sessionData = null;
      return {
        data: function() {
          if (!sessionData) {
              sessionData = {};
            jQuery.ajax({
              async: false,
              type: 'get',
              dataType: 'json',
              url: '/primo_library/libweb/remote_session_data_helper.jsp'
            }).done(function(data, textStatus, jqXHR){
                sessionData = data;
            }).fail(function(data, textStatus, jqXHR){
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
            });

            $.extend(sessionData.view,{
                  isFullDisplay: (function () {
                      return window.isFullDisplay();
                  })(),

                  frontEndID: (function () {
                      return _getFrontEndID.data();
                  }())
              });
            return sessionData;
          }
        }
      }
})();
