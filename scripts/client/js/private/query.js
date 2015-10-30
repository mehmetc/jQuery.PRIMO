function _query(){
    // parse the URL
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
        var keys = parsedURL.lookup('fctN');
        var values = parsedURL.lookup(('fctV'));

        $(keys).each(function(index, element){
            var result = {};
            if (index <= values.length) {
                result[element] = values[index];
            } else {
                result[element] = '';
            }
            facets.push(result);
        });
    }

    var query = [];
    //Get the query. only search.do for now
    //TODO:Handle dlSearch.do
    if (parsedURL.lookup('mode')[0] !== undefined && parsedURL.lookup('mode')[0] === 'Basic'){
        $(parsedURL.lookup('freeText')).each(function(i, el){
            query.push({'index':'any', 'precision':'contains', 'term': el});
        });
    } else {
        $(parsedURL.lookup('freeText')).each(function(i, el){
            query.push({'index': (parsedURL.lookup('UI'+i)[0] || 'any'), 'precision': (parsedURL.lookup('StartWith'+i)[0] || 'contains'), 'term': (parsedURL.lookup('freeText'+i)[0] || '')});
        });

        var advancedSearchKeys= {};
        $('.EXLSearchFieldRibbonFormFieldsGroup2 input:visible,.EXLSearchFieldRibbonFormFieldsGroup2 select:visible').each(function(i,el){
            var key = $(el).attr('id').replace(/^.*[i|I]nput_/, '').replace(/_$/,'');
            advancedSearchKeys[key] = $(el).attr('name');
        });

        $(Object.keys(advancedSearchKeys)).each(function(i,el){
            var key = el;
            var value = parsedURL.lookup(advancedSearchKeys[key])[0] || '';
            query.push({'index': key, 'precision':'contains', 'term': decodeURIComponent(value)});
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
                query[i] = el;
                if (el.term.trim().length > 0){
                    textQuery += textQuery.length > 0 ? ' AND ' : '';
                    textQuery += '(' + el.index + ' ' + el.precision + ' ' + el.term + ')';
                }
            });

            jQuery(facets).each(function(i, el) {
                jQuery(Object.keys(el)).each(function(j, key){
                    facets[i] = {index:key, term: el[key]};
                    if (el[key].trim().length > 0) {
                        textQuery += textQuery.length > 0 ? ' AND ' : '';
                        textQuery += '(' + key + ' exact ' + el[key] + ')';
                    }
                });
            });
        }

        return textQuery;
    }
    function isDeeplinkSearch(){
        return (window.location.href.match('dlSearch.do') != null);
    }

    query.toString = function(){
        return queryToString();
    };

    return {
        isDeeplinkSearch: isDeeplinkSearch,
        count: searchRecordCount,
        step: searchStep,
        page: searchPage,
        type: parsedURL.lookup('mode')[0],
        tab: parsedURL.lookup('tab')[0],
        sorted_by: parsedURL.lookup('srt')[0],
        scope: parsedURL.lookup('scp.scps')[0],
        facets: facets,
        query: query
    }
}