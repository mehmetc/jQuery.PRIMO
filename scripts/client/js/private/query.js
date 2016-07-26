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
            var tmpTab = $('#exlidSearchTabs li.EXLSearchTabSelected').find('a').attr('href').split('&').filter(function(d){return /^tab/.test(d)});
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