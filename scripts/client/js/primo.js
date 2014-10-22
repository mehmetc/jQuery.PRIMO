/**
 *
 * An ExLibris PRIMO convinience Library
 */

/**
 * @namespace jQuery.PRIMO
 */
jQuery.PRIMO = {
    session: (function() {return _getSessionData.data()})(),
    records: (function () {
        var records_count = jQuery('.EXLResult').length;
        var data = [];

        for (var j = 0; j < records_count; j++) data.push(_record(j));

        return $(data);
    }()),
    search: _search(),
    version: "<%= version %>"
};
