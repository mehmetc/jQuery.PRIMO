/**
 * Class to perform searches needs configuration on PRIMO site too. 'WS and XS IP' mapping table must allow external IP's
 * @class _search
 * @private
 */
function _search() {
    return {
        /**
         * Get Record by record_id
         * @method byRecordId
         * @private
         * @param {String} record id
         * @returns {Object} record hash
         */
        byRecordId: function (rid, options) {
            if (rid === undefined) {
                throw 'You must supply a record id'
            }

            var institution = (options !== undefined) && (options['institution'] !== undefined) ? options['institution'] : jQuery.PRIMO.session.view.institution.code;
            var index = (options !== undefined) && (options['index'] !== undefined) ? options['index'] : 1;
            var bulkSize = (options !== undefined) && (options['bulkSize'] !== undefined) ? options['bulkSize'] : 10;


            var result = [];

            jQuery.get('/PrimoWebServices/xservice/search/brief?institution=' + institution + '&query=rid,contains,' + rid +
                    '&indx=' + index + '&bulkSize=' + bulkSize)
                .done(function (data) {
                    result = $(_xml2json(data));
                })
                .fail(function (data) {
                    console.log('error searching')
                });

            return result;
        },
        /**
         * Get Record by a query in the form of index,match type,query
         * @method byQuery
         * @private
         * @param {String} query
         * @returns {Object} record hash
         */
        byQuery: function (query, options) {
            var result = [];
            try {

                var institution = (options !== undefined) && (options['institution'] !== undefined) ? options['institution'] : jQuery.PRIMO.session.view.institution.code;
                var index       = (options !== undefined) && (options['index'] !== undefined) ? options['index'] : 1;
                var bulkSize    = (options !== undefined) && (options['bulkSize'] !== undefined) ? options['bulkSize'] : 10;
                var apiKey      = (options !== undefined) && (options['apiKey'] !== undefined) ? options['apiKey'] : null;
                var regionURL   = (options !== undefined) && (options['regionURL'] !== undefined) ? options['regionURL'] : 'https://api-eu.hosted.exlibrisgroup.com';

                var restAPI     = (options !== undefined) && (options['restAPI'] !== undefined) ? options['restAPI'] : false;

                //REGIONURL
                // America      https://api-na.hosted.exlibrisgroup.com
                // EU           https://api-eu.hosted.exlibrisgroup.com
                // APAC         https://api-ap.hosted.exlibrisgroup.com

                if (!Array.isArray(query)) {
                    query = [query];
                }

                if (restAPI) {
                    var restURL = 'q=' + query.join(';') + '&inst=' + institution + '&offset=' + index + '&limit=' + bulkSize;
                    if (apiKey) {
                        restURL = regionURL + '/primo/v1/pnxs?' + restURL + '&apikey=' + apiKey;
                    }else{
                        restURL = '/primo_library/libweb/webservices/rest/v1/pnxs?' + restURL;
                    }

                    jQuery.ajax({
                            async: false,
                            cache: false,
                            type: 'get',
                            dataType: 'json',
                            url: restURL,
                            beforeSend: function(jqXHR, s){
                                // removes auto injected header by ExL, prevents CORS error
                            }
                        })
                        .done(function (data, event, xhr) {
                            if (typeof data == "string"){
                                result = JSON.parse(data);
                            } else {
                                result = data;
                            }
                        })
                        .fail(function (data, event, xhr) {
                            console.log('error searching', e.message)
                        });
                    
                    return result;
                } else {
                    var tmpQuery = "";
                    jQuery.each(query, function (index, value) {
                        tmpQuery += '&query=' + value;
                    });

                    query = tmpQuery;

                    jQuery.ajax(
                        {
                            async: false,
                            cache: false,
                            type: 'get',
                            dataType: 'xml',
                            url: '/PrimoWebServices/xservice/search/brief?institution=' + institution + '&indx=' + index + '&bulkSize=' + bulkSize + query
                        })
                        .done(function (data, event, xhr) {
                            result = $(_xml2json(data));
                        })
                        .fail(function (data, event, xhr) {
                            console.log('error searching', e.message)
                        });


                    if (result.length > 0 && result[0].hasOwnProperty('JAGROOT')) {
                        return result[0].JAGROOT.RESULT.DOCSET.DOC;
                    } else if (result.length > 0 && result[0].hasOwnProperty('MESSAGE')) {
                        console.log(result[0].MESSAGE);
                    }
                }
            } catch (e) {
                console.log('error searching: ', e.message);
            }

            return null;
        }
    }
}