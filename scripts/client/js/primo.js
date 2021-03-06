/**
 *
 * An ExLibris PRIMO convenience Library
 */
jQuery.extend(jQuery.PRIMO, {
    facets: _facet(),
    query: _query(),
    records: (function () {
        var data = [];
        var records_count = jQuery('.EXLResult').length;
        var allData = [];

        jQuery.ajax({
            async: false,
            type: 'get',
            dataType: 'json',
            url: '/primo_library/libweb/jqp/record/*.json'
        }).then(function (data, event, xhr) {
            jQuery.each(data, function (i, d) {
                allData[d.control.recordid] = d;
            });

        });

        for (var j = 0; j < records_count; j++) data.push(_record(j, allData));

// add tabReady handler to all tabs
        $('.EXLResultTabs a').on('click', function (event, xhr, settings) {
            try {
                var tab = $(this).parent()[0];
                var recordIndex = parseInt($(tab).closest('.EXLResult')[0].id.replace(/[^\d]/g,''));
                var record      = jQuery.PRIMO.records[recordIndex];

                _addTabReadyHandler(record, tab);

            } catch (e) {
                console.log(e);
            }
        });

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
