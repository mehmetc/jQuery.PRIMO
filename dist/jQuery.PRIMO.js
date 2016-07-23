;(function ($) {
/**
 * @overview A PRIMO convenience library
 * @licence MIT
 * @copyright KULeuven/LIBIS 2014
 * @author Mehmet Celik <mehmet.celik@libis.kuleuven.be>
 * @description This is a dropin library for Primo. Made with help of the community focussing on making your life easier.
 * extend, not reinvent
 */

/**
 * @namespace jQuery.PRIMO
 */
    jQuery.PRIMO = {
        parameters: {base_path: '/primo_library/libweb/jqp'}
    };


function _facet() {
    var facets = [];
    try {
        jQuery.each(jQuery('#facetList .EXLFacetContainer'), function (i, container) {
            container = $(container);

            var containerLabel = $(container).find('*[class*="EXLFacetTitleLabelPHolder"]');

            if (containerLabel.length > 0) {
                container.name = $(container).find('*[class*="EXLFacetTitleLabelPHolder"]').attr('class').replace('EXLFacetTitleLabelPHolder', '');
                container.title = $(container).find('*[class*="EXLFacetTitleLabelPHolder"]').text().trim();
            } else {
                try {
                    var facetName = container.find('.EXLFacet a').attr('href').match(/fctN=(.*?)\&/);
                    if (facetName.length > 1) {
                        container.name = facetName[1];
                    } else {
                        container.name = '';
                    }
                    container.title = container.find('h4').text().trim() || '';
                } catch(e) {
                    container.name = '';
                    container.title = '';
                }
            }

            container.index = i;
            container.values = [];
            $.each(container.find('.EXLFacet'), function (j, facet) {
                facet = $(facet);
                facet.value = $(facet).find('a').text().trim() || '';
                facet.url = $(facet).find('a').attr('href') || '';
                facet.count = $(facet).find('span').text().trim().replace(/\.|\,/g, '').replace(/\(/g, '').replace(/\)/g, '') || 0;

                container.values.push(facet);
            });

            facets.push(container);
        });

        /**
         * Get all facet names from DOM
         * @method getNames
         * @private
         * @returns {Array} facet names
         */
        facets.getNames = function () {
            return $.map(facets, function (facet, i) {
                return facet.name;
            })
        };

        /**
         * Get pointer to DOM from
         * @method getByName
         * @private
         * @param {String} facet name one of what is returned by getNames()
         * @returns {Object} facet
         */
        facets.getByName = function (name) {
            return facets.filter(function (facet, i) {
                return facet.name === name;
            })[0]; //TODO: should it only return the first match or all?
        };
    } catch(error) {
        console.log('unable to load facets', error);
    }

    return facets;
}
function _query(){

    /**
     * parse the URL
     * @method parseURL
     * @private
     * @returns {Object} parsed url
     */
    function parseURL(){
        var result = jQuery(window.location.search.replace(/^\?/, '').split('&')).map(
            function(){
                var el = this;
                var data = el.split('=');
                var result = {};
                result[decodeURIComponent(data[0])] = decodeURIComponent(data[1]);
                return result;
            });

        result.lookup = function(value){
            var lookupResult = [];

            jQuery.each(result, function(index, element){
                var searchValue = jQuery(Object.keys(element)).map(function(){
                    var e = this;
                    //replace with contains when available
                    var matchesFound = e.match(value.replace(/\(/g, '\\(').replace(/\)/g, '\\)'));

                    return matchesFound ? e : null;
                }).filter(function(e){return e != null})[0];

                if (searchValue && searchValue != '') {
                    lookupResult.push(result[index][searchValue]);
                }
            });

            return lookupResult;
        };

        return result;
    }

    var parsedURL = parseURL();

    var facets = [];

//Get All FACETS
    if (parsedURL.lookup('ct')[0] !== undefined){
        var keys = {"inc": [], "exc": []};

        jQuery.merge(keys["inc"], parsedURL.lookup('fctN'));
        jQuery.merge(keys["inc"], parsedURL.lookup('mulIncFctN'));
        jQuery.merge(keys["exc"], parsedURL.lookup('mulExcFctN'));

        var values = {"inc": [], "exc": []};
        jQuery.merge(values['inc'], parsedURL.lookup('fctV'));
        jQuery.merge(values['inc'], parsedURL.lookup('fctIncV'));
        jQuery.merge(values['exc'], parsedURL.lookup('fctExcV'));

        jQuery(Object.keys(keys)).each(function(indexKeyType, keyType){
            jQuery(keys[keyType]).each(function(index, element){
                var value = '';
                if (index <= values[keyType].length) {
                    value = values[keyType][index];
                } else {
                    value = '';
                }

                facets.push({'index': element, 'precision':'exact', 'term': value, 'operator': 'AND', 'exclude': (keyType === 'exc')});
            });
        });
    }

    var query = [];
    //Get the query. only search.do for now
    //TODO:Handle dlSearch.do
    if (parsedURL.lookup('mode')[0] !== undefined && parsedURL.lookup('mode')[0] === 'Basic'){   // simple search
        $(parsedURL.lookup('freeText')).each(function(i, el){
            query.push({'index':'any', 'precision':'contains', 'term': el, 'operator': 'AND', 'exclude':false});
        });
    } else {    //advanced search
        $(parsedURL.lookup('freeText')).each(function(i, el){
            query.push({'index': (parsedURL.lookup('UI'+i)[0] || 'any'),
                        'precision': (parsedURL.lookup('StartWith'+i)[0] || 'contains'),
                        'term': (parsedURL.lookup('freeText'+i)[0] || ''),
                        'operator': (parsedURL.lookup('boolOperator'+i)[0] || 'AND'),
                        'exclude':false
                        });
        });

        var advancedSearchKeys= {};
        jQuery('.EXLSearchFieldRibbonFormFieldsGroup2 input:visible,.EXLSearchFieldRibbonFormFieldsGroup2 select:visible').each(function(i,el){
            var key = $(el).attr('id').replace(/^.*[i|I]nput_/, '').replace(/_$/,'');
            advancedSearchKeys[key] = $(el).attr('name');
        });

        jQuery(Object.keys(advancedSearchKeys)).each(function(i,el){
            var key = el;
            var value = parsedURL.lookup(advancedSearchKeys[key])[0] || '';
            query.push({'index': key, 'precision':'contains', 'term': decodeURIComponent(value), 'operator': 'AND', 'exclude':false});
        })
    }

    var searchRecordCount = parseInt(jQuery('#resultsNumbersTile em:first').text().replace(/[\s,]+/g,'').replace(/\.|\,/g,''));

    var searchStep = parseInt($('#resultsNumbersTile span:first').text().replace(/[^\d|-]*/g,'').split('-')[1]);
    var searchPage = 1;
    if (isNaN(searchStep)){
        searchStep = 10;
        searchPage = 1;
    } else {
        searchStep = (parseInt($('#resultsNumbersTile span:first').text().replace(/[^\d|-]*/g,'').split('-')[1]) - parseInt($('#resultsNumbersTile span:first').text().replace(/[^\d|-]*/g,'').split('-')[0])) + 1;
        searchPage = Math.floor(parseInt($('#resultsNumbersTile span:first').text().replace(/[^\d|-]*/g,'').split('-')[1])/(searchStep));
    }

    /**
     * Convert query object into text
     * @method queryToString
     * @private
     * @returns {String} query text
     */
    function queryToString(){
        var textQuery = "";
        if (isDeeplinkSearch()){
            var url_query = jQuery(window.location.search.replace(/^\?/, '').split('&')).map(
                function(){
                    var el = this;
                    var data = el.split('=');
                    var result = {};
                    result[decodeURIComponent(data[0])] = decodeURIComponent(data[1]);
                    return result;
                });

            textQuery = url_query.length > 0 ? url_query[0]['query'].replace(/\,/g,' ') : '';
        }
        else {
            jQuery(query).each(function(i, el) {
                if (el.term.trim().length > 0){
                    textQuery += '(' + el.index + ' ' + el.precision + ' ' + el.term + ')';
                    textQuery += ((el.term.length > 0) && (i < query.length-1)) ? ' ' + el.operator.trim() + ' ' : '';
                }
            });

            jQuery(facets).each(function(i, el){
                if (el.term.trim().length > 0){
                    textQuery += ((textQuery.length > 0) && (i < query.length-1)) ? ' ' + el.operator.trim() + ' ' : '';
                    textQuery += el.exclude ? ' NOT' : '';
                    textQuery += '(' + el.index + ' ' + el.precision + ' ' + el.term + ')';
                }
            });
        }

        return textQuery;
    }

    /**
     * check if query is a deep search
     * @method isDeeplinkSearch
     * @private
     * @returns {Boolean}
     */
    function isDeeplinkSearch(){
        return (window.location.href.match('dlSearch.do') != null);
    }

    query.toText = function(){
        return queryToString();
    };

    /**
     * get scope values
     * @method findScope
     * @private
     * @returns {String}
     */
    function findScope() {
        var scope = parsedURL.lookup('scp.scps')[0];

        if (scope === undefined) {
            scope = '';
        }

        return scope;
    }

    /**
     * get tab name
     * @method findScope
     * @private
     * @returns {String}
     */
    function findTab(){
        var tab = parsedURL.lookup('tab')[0];

        if (tab === undefined) {
            var tmpTab = $('#exlidSearchTabs li.EXLSearchTabSelected').find('a').attr('href').split('&').filter(function(d){return d.startsWith('tab')});
            if (tmpTab && tmpTab.length > 0){
                tab = tmpTab[0].replace(/^tab=/,'');
            }
        }

        return tab;
    }

    /**
     * get sort order
     * @method findSortOrder
     * @private
     * @returns {String}
     */
    function findSortOrder() {
        var sortedBy = parsedURL.lookup('srt')[0];

        if (sortedBy === undefined){
            sortedBy = '';
        }

        return sortedBy;
    }

    /**
     * get the search type(mode)
     * @method findType
     * @private
     * @returns {String}
     */
    function findType() {
        var type = parsedURL.lookup('mode')[0];
        if (type === undefined) {
            type = 'Basic';
        }

        return type;
    }


    return {
        isDeeplinkSearch: isDeeplinkSearch,
        count: searchRecordCount,
        step: searchStep,
        page: searchPage,
        type: findType(),
        tab: findTab(),
        sortedBy: findSortOrder(),
        scope: findScope(),
        facets: facets,
        query: query
    }
}
/**
 * Private method to build a pointer to the record and enhance it
 * @method _record
 * @private
 * @param {Number} i record on page
 * @returns {Object} enhanced record pointer
 */
function _record(i, allData) {
    var recordData = null;
    var record = jQuery(jQuery('.EXLResult')[i]);

// attributes
    record.index = i;
    record.id = record.find('.EXLResultRecordId[name]').attr('name');
    record.title = record.find('.EXLResultTitle').text().trim();
    record.openUrl = record.find('.EXLMoreTab a').attr('href');
    record.tabs = _tabs(record);
    record.materialType = function () {
        return _materialType(record)
    };
    record.rawData = allData[record.id];

// methods
    record.getIt1 = function () {
        return _getGetIt(record);
    }; // needs tabs


    record.getDedupedRecordIds = function () {
        return _getRecordIdInDedupRecord(record.id).data()
    };

    record.isRemoteRecord = function () {
        return (record.id.substring(0, 2) === 'TN')
    };
    record.isOnEShelf = function () {
        return record.find('.EXLMyShelfStar a').attr('href').search('fn=remove') != -1
    };
    record.isDedupedRecord = function () {
        return _getIsDedupRecord(record.id)
    };

    record.isFrbrRecord = function () {
        return _getIsFrbrRecord(record)
    };

    record.getPNX = function (type) {
        return _getPNXData(record.id, type);
    };

    record.getData = function () {
        if (!recordData) {
            var data;

            if (record.rawData && record.rawData != null) {
                recordData = record.rawData;
            } else {
                data = _getPNXData(record.id, "json");
                if (data && data.length > 0) {
                    recordData = data[0];
                }
            }
        }

        return recordData;
    };


    return record;
}

/**
 * @method _getPNXData
 * @param {String} recordID - The record id
 * @param {String} type - The type of response to return can be one of text,json or xml. XML is the default
 * @returns {Object} PNX record
 * @private
 */
var _getPNXData = function (recordID, type) {
    var pnx = null;
    if (type === undefined) {
        type = 'text'
    }

    jQuery.ajax({
        async: false,
        type: 'get',
        dataType: 'xml',
        url: jQuery.PRIMO.parameters.base_path + '/record/' + recordID + '.pnx'
    }).then(function (data, textStatus, xhr) {
        if (xhr.getResponseHeader('Content-Type').search(/xml/) >= 0) {
            switch (type) {
                case 'text':
                    pnx = _xml2text(data);
                    break;
                case 'json':
                    pnx = $(_xml2json(data));
                    break;
                default:
                    pnx = $(data);
            }
        } else {
            alert('PDS redirect detected. Do not know how to handle that, yet.');
        }
    }, function (xhr, textStatus, errorThrown) {
        var pnx_url = '/primo_library/libweb/action/display.do?vid=' + jQuery.PRIMO.session.view.code + '&pds_handle=GUEST&doc=' + recordID + '&showPnx=true';

        jQuery.ajax({
            async: false,
            type: 'get',
            dataType: 'xml',
            url: pnx_url
        }).then(function (data, event, xhr) {
            if (xhr.getResponseHeader('Content-Type').search(/xml/) >= 0) {
                switch (type) {
                    case 'text':
                        pnx = _xml2text(data);
                        break;
                    case 'json':
                        pnx = $(_xml2json(data));
                        break;
                    default:
                        pnx = $(data);
                }
            } else {
                alert('PDS redirect detected. Do not know how to handle that, yet.');
            }
        }, function (xhr, textStatus, errorThrown) {
            alert('Unable to load record:' + errorThrown);
        });
    }); //then

    if ($.isArray(pnx)) {
        return pnx[0];
    } else {
        return pnx;
    }
};

var _getLocalPNXData = function(record, type) {
    var pnx = null;
    var xml = _text2xml(record.rawData);

    if (type === undefined) {
        type = 'text'
    }

    switch (type) {
        case 'text':
            pnx = _xml2text(xml);
            break;
        case 'json':
            pnx = $(_xml2json(xml));
            break;
        default:
            pnx = $(xml);
    }

    if ($.isArray(pnx)) {
        return pnx[0];
    } else {
        return pnx;
    }
};

/**
 * Private method check if record is a deduped record
 * @private
 * @method _getIsDedupRecord
 * @param {String} id record id
 * @returns {Boolean} true/false
 */
function _getIsDedupRecord(id) {
    return id.search(/^dedupmrg/) != -1;
}

/**
 * Private method check if record is a frbr record
 * @private
 * @method _getIsFrbrRecord
 * @param {String} record
 * @returns {Boolean} true/false
 */
function _getIsFrbrRecord(record) {
    return record.find('.EXLResultFRBR').length > 0;
}

/**
 * Private method to retrieve record id's of a deduped record
 * @method _getRecordIdInDedupRecord
 * @private
 * @param {String} record id
 * @returns {Array} list of record id's
 */
function _getRecordIdInDedupRecord(id) {
    var dedupRecordIds = [];

    return {
        data: function () {
            if (dedupRecordIds.length === 0) {
                if (_getIsDedupRecord(id)) {
                    jQuery.ajax({
                        async: false,
                        type: 'get',
                        dataType: 'json',
                        url: jQuery.PRIMO.parameters.base_path + '/record/resolve/' + id
                    }).done(function (data, textStatus, jqXHR) {
                        dedupRecordIds = data;
                    }).fail(function (data, textStatus, jqXHR) {
                        console.log('Error resolving ' + id);
                    });
                }
            }

            return dedupRecordIds;
        }
    }
}

/**
 * Private method to retrieve the material type of a record.
 * @method _materialType
 * @private
 * @param {Object} record the record object
 * @returns {String} the material type
 */
function _materialType(record) {
    //return _getPNXData(record.id, 'json').display.type;
    return record.getData().display.type;
}


/**
 * @method _getGetIt
 * @param {Object} record
 * @returns {string}
 * @private
 */
function _getGetIt(record) {
    var view_online = record.tabs.getByName('ViewOnline');
    var url = '';
    var urls = [];
    var raw_list = [];

    if (view_online && view_online.length > 0) {
        raw_list = $(view_online.find('input[id*="getitonline1"]')).val().split(/&O\d=/);
        urls = $.map(raw_list, function (d) {
            if (d.match(/^delivery/)) {
                return d.replace(/delivery,.*?,/, '')
            }
        });
        url = urls.length > 0 ? urls[0] : '';
    }

    return url;
}

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

/**
 * Private method to get information on a single tab
 * @method _tabs
 * @private
 * @param {String} record record id
 * @param {Number} i tab id
 * @returns {Object} Object tab object
 */
function _tab(record, i) {
    var tab = null;
    try {
        if (typeof(i) == 'number') {
            tab = record.find('.EXLResultTab')[i];
            if (tab.length == 0) {
                tab = null;
            }
        }
        else if (typeof(i) == 'string') {
            tab = record.find('.EXLResultTab:contains("' + i + '")');

            if (tab.length == 0) {
                tab = record.find(".EXLResultTab[id*='" + i + "']");
            }

            if (tab.length == 0) {
                tab = record.find(".EXLResultTab[id*='" + i.toLowerCase() + "']");
            }

            if (tab == null || tab.length == 0) {
                tab = $(record.tabs).find('a[title*="' + i + '"]').parent();
            }

            if (tab == null || tab.length == 0) {
                tab = $(record).find('li[class*="' + i + '"]');
            }

            if (tab !== null && tab.length == 0) {
                tab = null;
            }
        }

        if (tab !== null) {
            var tabName;
            if (jQuery(tab).attr('name') === undefined) {
                //tabName = jQuery(tab).attr('id').split('-')[1].toLowerCase().replace('tab','');
                tabName = jQuery(tab).attr('id').split('-')[1].replace('tab', '');
            } else {
                tabName = jQuery(tab).attr('name').trim();
            }

            var container = null;
            var containerTmpName = (tabName.trim().charAt(0).toLowerCase() + tabName.trim().slice(1)).replace(/tab$/gi, '');
            var containerName = 'Container-' + containerTmpName + 'Tab';
            c = record.find('*[class*="' + containerName + '"]');

            if (c.length > 0) {
                container = c;
            }

            tab.index = i;
            tab.label = jQuery(tab).find('a').text().trim();
            tab.name = tabName;
            tab.container = container;
            tab.isOpen = function () {
                return jQuery(tab).hasClass('EXLResultSelectedTab');
            };
            tab.close = function () {
                if (!jQuery.PRIMO.session.view.isFullDisplay()) {
                    record.find('.EXLResultSelectedTab').removeClass('EXLResultSelectedTab');
                    record.find('.EXLTabsRibbon').addClass('EXLTabsRibbonClosed');
                    tab.container.hide();
                }
            };
            tab.open = function (content, options) {
                defaults = {
                    reload: false,
                    headerContent: '',
                    url: '#'
                };
                var o = jQuery.extend(defaults, options);
                currentTab = record.tabs.getByName(tabName);
                record.find('.EXLTabsRibbonClosed').removeClass('EXLTabsRibbonClosed');
                record.find('.EXLResultSelectedTab').removeClass('EXLResultSelectedTab');
                jQuery(currentTab).addClass('EXLResultSelectedTab');
                record.find('.EXLResultTabContainer').hide();
                currentTab.container.show();

                if ((!currentTab.container.data('loaded')) || (o.reload)) {
                    var popOut = '<div class="EXLTabHeaderContent">' + o.headerContent + '</div><div class="EXLTabHeaderButtons"><ul><li class="EXLTabHeaderButtonPopout"><a href="' + o.url + '" target="_blank"><img src="../images/icon_popout_tab.png" /></a></li><li></li><li class="EXLTabHeaderButtonCloseTabs"><a href="#" title="hide tabs"><img src="../images/icon_close_tabs.png" alt="hide tabs"></a></li></ul></div>';
                    var header = '<div class="EXLTabHeader">' + popOut + '</div>';
                    var body = '<div class="EXLTabContent">' + content + '</div>';
                    currentTab.container.html(header + body);
                    currentTab.container.data('loaded', true);
                    currentTab.container[0].tabUtils.state.status = exlTabState.FETCHED;
                }
            };

            if ($.inArray('onTabReady', Object.keys(tab)) == -1) {
                tab.onTabReady = function (record, tab) {
                };
            }
        }
    } catch (error) {
        console.log("unable to load tab");
    }
    return tab;
};


/**
 * Private method to get information on all tabs
 * @method _tabs
 * @private
 * @params {String} record record id
 * @returns {Object} tab data
 */
function _tabs(record) {
    var tabData = [];
    var tab_count = record.find('.EXLResultTab').length;

    for (k = 0; k < tab_count; k++) {
        tabData.push(_tab(record, k));
    }

    if (tabData.addTab == null) {
        tabData.addTab = function (tabName, options) {
            options.record = record;
            _addTab(tabName, options);
        }
    }

    tabData.getNames = function () {
        tabNames = [];
        jQuery.each(tabData, function () {
            tabNames.push(this.name);
        });
        return tabNames;
    };

    tabData.getEnabled = function () {
        return jQuery.map(record.tabs,
            function (tab, i) {
                tab = jQuery(tab);
                if (tab.css('display') != 'none') {
                    return record.tabs[i].name; //jQuery(tab).text().trim();
                }
                return null;
            });
    };

    tabData.getByName = function (name) {
        return _tab(record, name);
    };

    return tabData;
}

/**
 * Adds a new tab to tabs
 * @method _addTab
 * @private
 * @param {String} tabName name of tab
 * @param {Hash} [options] a hash with any of these {record, state:'enabled/disabled', css, url:'#', url_target: '_blank', tooltip, headerContent, click:callbackFunction}
 * @example
 * jQuery.PRIMO.records[0].tabs.add('my Tab',
 {state:'enabled', click:function(event, tab, record, options){
                             if (tab.isOpen()){
                                 tab.close();
                             } else {
                                 tab.open('Hello from tab, {reload:true});
                             }
                         }
 });
 */
function _addTab(tabName, options) {
    defaults = {
        record: null,
        state: 'disabled',
        css: tabName.trim().toLowerCase().replace(/tab$/, '') + 'Tab',
        url: '#',
        url_target: '',
        tooltip: '',
        label: tabName,
        headerContent: '',
        click: function (e) {
            alert('To be implemented...');
        }
    };

    var o = jQuery.extend(defaults, options);


    if (jQuery.inArray(tabName, o.record.tabs.getNames()) < 0) { // not in tablist -> new tab
        //var customTabId = 'exlidResult'+ o.record.index + '-' + tabName.toLowerCase() + 'Tab';
        var customTabId = 'exlidResult' + o.record.index + '-' + tabName;
        var customTab = '<li id="' + customTabId + '" class="EXLResultTab ' + o.css + '" name="' + tabName + '">';
        customTab += '  <span style="display:' + (o.state == 'disabled' ? 'block' : 'none') + '">' + o.label + '</span>';
        customTab += '  <a id="' + customTabId + 'Link" style="display:' + (o.state == 'disabled' ? 'none' : 'block') + '"';
        customTab += '     title="' + (o.tooltip || o.label) + '"';
        customTab += '     target="' + o.url_target + '"';
        customTab += '      href="' + o.url + '">' + o.label + '</a>';
        customTab += '</li>';
        var customTabContainer = '<div class="EXLResultTabContainer EXLContainer-' + o.css + '"></div>';

        o.record.find('.EXLResultTab').last().after(customTab);
        if (o.record.hasClass('EXLSummary')) {
            o.record.append(customTabContainer);
        } else {
            o.record.find('.EXLSummary').append(customTabContainer);
        }

        var containerName = 'Container-' + o.css;
        var container = o.record.find('*[class*="' + containerName + '"]');

        if (container) {
            container = container[0];
            if (jQuery.inArray('tabUtils', Object.keys(container)) == -1) {
                container.tabUtils = new TabSet(containerName, o.record.tabs.length, container, o.record.id, tabName);
            }
        }

        var customClassQuery = '.' + o.css + ' a';
        if (o.click !== null) {
            o.record.find(customClassQuery).click(function (e) {
                e.preventDefault();
                if (o.state == 'enabled') {
                    tab = o.record.tabs.getByName(tabName);
                    o.click(e, tab, o.record, o);
                    _addTabReadyHandler(o.record, tab[0]);

                }
            });
        }
    }
    else {
        //TODO
    }

    o.record.tabs = _tabs(o.record);
}


/**
 * Adds a callback to the tabs
 * @method _addTabReadyHandler
 * @private
 * @param {Object} record object
 * @param {Object} tab object
 **/
function _addTabReadyHandler(record, tab) {
    if (tab.container != null) {
        var tabUtils = tab.container[0].tabUtils;
        if (tabUtils) {
            var timeoutID = null;
            var tabHandlerTimeout = 0;
            timeoutID = setInterval(function () {
                if (tabUtils.isTabReady()) {
                    clearTimeout(timeoutID);
                    console.log("firing tabReady for " + tab.id);
                    if ($.inArray('onTabReady', Object.keys(tab)) != -1) {
                        tab.onTabReady(record, tab.container[0], tab);
                    }
                } else {
                    if (tabHandlerTimeout > 10){
                        clearTimeout(timeoutID);
                        console.log("timing out tabReady for " + tab.id);
                    } else {
                        console.log("not ready tabReady for " + tab.id);
                    }
                    tabHandlerTimeout++;
                }
            }, 500);
        }
    }
}
//Borrowed from http://absurdjs.com/ thanks Kasimir.
function _template(){
    function _render(html, options, isDeferred) {
        isDeferred = typeof isDeferred == "undefined" ? false : isDeferred;

        if (isDeferred) {
            return _deferredRender(html, options);
        } else {
            return _normalRender(html, options);
        }
    }

    function _normalRender(html, options) {
        var re = /{{(.+?)}}/g,
            reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
            code = 'with(obj) { var r=[];\n',
            cursor = 0,
            result;
        var add = function (line, js) {
            js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return add;
        };
        var match;
        while (match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, '');
        try {
            result = new Function('obj', code).apply(options, [options]);
        }
        catch (err) {
            console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
        }
        return result;
    }

    function _deferredRender(html, options) {
        var d = $.Deferred();
        try {
            d.resolve(_render(html, options));
        } catch(e) {
            d.reject(function(){console.log("Error rendering template: " + id, e); return "";});
        }
        return d.promise();
    }

    return {
        render: function(html, options, isDeferred){
            isDeferred = typeof isDeferred == "undefined" ? false : isDeferred;

            return _render(html, options, isDeferred);
        },
        renderById: function(id, options, isDeferred){
            isDeferred = typeof isDeferred == "undefined" ? false : isDeferred;

            var html = $('#'+id).html();
            return _render(html, options, isDeferred);
        }
    }
}
/**
 * Transform an XML document into JSON
 * @method _xml2json
 * @param {document} xml
 * @param {boolean} extended
 * @returns {object}
 * @description borrowed from http://www.fyneworks.com/jquery/xml-to-json/
 * @private
 */
function _xml2json(xml, extended) {
    if(!xml) return {}; // quick fail

    //### PARSER LIBRARY
    // Core function
    function parseXML(node, simple){
        if(!node) return null;
        var txt = '', obj = null, att = null;
        var nt = node.nodeType, nn = jsVar(node.localName || node.nodeName);
        var nv = node.text || node.nodeValue || '';
        /*DBG*/ //if(window.console) console.log(['x2j',nn,nt,nv.length+' bytes']);
        if(node.childNodes){
            if(node.childNodes.length>0){
                /*DBG*/ //if(window.console) console.log(['x2j',nn,'CHILDREN',node.childNodes]);
                $.each(node.childNodes, function(n,cn){
                    var cnt = cn.nodeType, cnn = jsVar(cn.localName || cn.nodeName);
                    var cnv = cn.text || cn.nodeValue || '';
                    /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>a',cnn,cnt,cnv]);
                    if(cnt == 8){
                        /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>b',cnn,'COMMENT (ignore)']);
                        return; // ignore comment node
                    }
                    else if(cnt == 3 || cnt == 4 || !cnn){
                        // ignore white-space in between tags
                        if(cnv.match(/^\s+$/)){
                            /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>c',cnn,'WHITE-SPACE (ignore)']);
                            return;
                        }
                        /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>d',cnn,'TEXT']);
                        txt += cnv.replace(/^\s+/,'').replace(/\s+$/,'');
                        // make sure we ditch trailing spaces from markup
                    }
                    else{
                        /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>e',cnn,'OBJECT']);
                        obj = obj || {};
                        if(obj[cnn]){
                            /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>f',cnn,'ARRAY']);

                            // http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
                            if(!obj[cnn].length) obj[cnn] = myArr(obj[cnn]);
                            obj[cnn] = myArr(obj[cnn]);

                            obj[cnn][ obj[cnn].length ] = parseXML(cn, true/* simple */);
                            obj[cnn].length = obj[cnn].length;
                        }
                        else{
                            /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>g',cnn,'dig deeper...']);
                            obj[cnn] = parseXML(cn);
                        };
                    }
                });
            };//node.childNodes.length>0
        };//node.childNodes
        if(node.attributes){
            if(node.attributes.length>0){
                /*DBG*/ //if(window.console) console.log(['x2j',nn,'ATTRIBUTES',node.attributes])
                att = {}; obj = obj || {};
                $.each(node.attributes, function(a,at){
                    var atn = jsVar(at.name), atv = at.value;
                    att[atn] = atv;
                    if(obj[atn]){
                        /*DBG*/ //if(window.console) console.log(['x2j',nn,'attr>',atn,'ARRAY']);

                        // http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
                        //if(!obj[atn].length) obj[atn] = myArr(obj[atn]);//[ obj[ atn ] ];
                        obj[cnn] = myArr(obj[cnn]);

                        obj[atn][ obj[atn].length ] = atv;
                        obj[atn].length = obj[atn].length;
                    }
                    else{
                        /*DBG*/ //if(window.console) console.log(['x2j',nn,'attr>',atn,'TEXT']);
                        obj[atn] = atv;
                    };
                });
                //obj['attributes'] = att;
            };//node.attributes.length>0
        };//node.attributes
        if(obj){
            obj = $.extend( (txt!='' ? new String(txt) : {}),/* {text:txt},*/ obj || {}/*, att || {}*/);
            //txt = (obj.text) ? (typeof(obj.text)=='object' ? obj.text : [obj.text || '']).concat([txt]) : txt;
            txt = (obj.text) ? ([obj.text || '']).concat([txt]) : txt;
            if(txt) obj.text = txt;
            txt = '';
        };
        var out = obj || txt;
        //console.log([extended, simple, out]);
        if(extended){
            if(txt) out = {};//new String(out);
            txt = out.text || txt || '';
            if(txt) out.text = txt;
            if(!simple) out = myArr(out);
        };
        return out;
    };// parseXML
    // Core Function End
    // Utility functions
    var jsVar = function(s){ return String(s || '').replace(/-/g,"_"); };

    // NEW isNum function: 01/09/2010
    // Thanks to Emile Grau, GigaTecnologies S.L., www.gigatransfer.com, www.mygigamail.com
    function isNum(s){
        // based on utility function isNum from xml2json plugin (http://www.fyneworks.com/ - diego@fyneworks.com)
        // few bugs corrected from original function :
        // - syntax error : regexp.test(string) instead of string.test(reg)
        // - regexp modified to accept  comma as decimal mark (latin syntax : 25,24 )
        // - regexp modified to reject if no number before decimal mark  : ".7" is not accepted
        // - string is "trimmed", allowing to accept space at the beginning and end of string
        var regexp=/^((-)?([0-9]+)(([\.\,]{0,1})([0-9]+))?$)/
        return (typeof s == "number") || regexp.test(String((s && typeof s == "string") ? jQuery.trim(s) : ''));
    };
    // OLD isNum function: (for reference only)
    //var isNum = function(s){ return (typeof s == "number") || String((s && typeof s == "string") ? s : '').test(/^((-)?([0-9]*)((\.{0,1})([0-9]+))?$)/); };

    var myArr = function(o){

        // http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
        //if(!o.length) o = [ o ]; o.length=o.length;
        if(!$.isArray(o)) o = [ o ]; o.length=o.length;

        // here is where you can attach additional functionality, such as searching and sorting...
        return o;
    };
    // Utility functions End
    //### PARSER LIBRARY END

    // Convert plain text to xml
    if(typeof xml=='string') xml = _text2xml(xml);

    // Quick fail if not xml (or if this is a node)
    if(!xml.nodeType) return;
    if(xml.nodeType == 3 || xml.nodeType == 4) return xml.nodeValue;

    // Find xml root node
    var root = (xml.nodeType == 9) ? xml.documentElement : xml;

    // Convert xml to json
    var out = parseXML(root, true /* simple */);

    // Clean-up memory
    xml = null; root = null;

    // Send output
    return out;
};

/**
 * Convert text to XML DOM
 *
 * @param {string} str - xml string
 * @returns {document} xmlDoc - xml document
 * @description borrowed from http://www.fyneworks.com/jquery/xml-to-json/
 * @private
 */
function _text2xml(str) {
    return $.parseXML(str);
};

/**
 * Transform XML into text
 *
 * @param {document} xmlDoc - xml document
 * @returns {String}
 * @private
 */
function _xml2text(xmlDoc){
    var xmlString;
    //IE
    if (window.ActiveXObject){
        xmlString = xmlDoc.xml;
    }
    // code for Mozilla, Firefox, Opera, etc.
    else{
        xmlString = (new XMLSerializer()).serializeToString(xmlDoc);
    }
    return xmlString;
}

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
    version: "1.1.6",
    reload: function () {
        jQuery.PRIMO.session.reload();
    },
    template: _template()
});


})(jQuery);