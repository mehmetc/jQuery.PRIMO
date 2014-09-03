/**
 * Retrieves session data only available on the server
 * @method
 * @returns {Object} returns session data.
 * @description Retrieves session data only available on the server
 * @private
 */
var _getRemoteSessionData = (function() {
      var remoteSession = null;
      return {
        data: function() {
          if (!remoteSession) {
            remoteSession = {};
            jQuery.ajax({
              async: false,
              type: 'get',
              dataType: 'json',
              url: '/primo_library/libweb/remote_session_data_helper.jsp'
            }).done(function(data, textStatus, jqXHR){
                remoteSession = data;
            });

            return remoteSession;
          }
        }
      }
})();
