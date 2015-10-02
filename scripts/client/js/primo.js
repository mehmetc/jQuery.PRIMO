/**
 *
 * An ExLibris PRIMO convinience Library
 */
    jQuery.extend(jQuery.PRIMO, {
        facets: _facet(),
        query: _query(),
        records: (function () {
            var data = [];
            var records_count = jQuery('.EXLResult').length;

            for (var j = 0; j < records_count; j++) data.push(_record(j));
            return $(data);
        }()),
        search: _search(),
        session: _getSessionData(),
        version: "<%= version %>",
        reload: function () {
            jQuery.PRIMO.session.reload();
        },
        template: _template()
    });
