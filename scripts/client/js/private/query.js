function _query(){
    // parse the URL
    function parseURL(){
        var result = window.location.search.replace(/^\?/, '').split('&').map(
            function(el){
                var data = el.split('=');
                var result = {};
                result[decodeURIComponent(data[0])] = decodeURIComponent(data[1]);
                return result;
            });

        result.lookup = function(value){
            var lookupResult = [];

            result.forEach(function(element, index, array){
               // var searchValue = Object.keys(element).find(function(e){ return e.contains(value)});
                var searchValue = Object.keys(element).map(function(e){
                    //replace with contains when available
                    var matchesFound = e.match(value.replace(/\(/g, '\\(').replace(/\)/g, '\\)'));

                    return matchesFound ? e : null;
                }).filter(function(e){return e != null})[0];

                if (searchValue && searchValue != '') {
                    lookupResult.push(array[index][searchValue]);
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
        console.log('Basic');
        $(parsedURL.lookup('freeText')).each(function(i, el){
            query.push({'index':'any', 'precision':'contains', 'term': el});
        });
    } else {
        console.log('Advanced');
        $(parsedURL.lookup('freeText')).each(function(i, el){
            query.push({'index': parsedURL.lookup('UI'+i)[0], 'precision': parsedURL.lookup('StartWith'+i)[0], 'term': parsedURL.lookup('freeText'+i)[0]});
        });

        var advancedSearchKeys= {};
        $('.EXLSearchFieldRibbonFormFieldsGroup2 input:visible,.EXLSearchFieldRibbonFormFieldsGroup2 select:visible').each(function(i,el){
            var key = $(el).attr('id').replace(/^.*[i|I]nput_/, '').replace(/_$/,'');
            advancedSearchKeys[key] = $(el).attr('name');
        });

        $(Object.keys(advancedSearchKeys)).each(function(i,el){
            var key = el;
            var value = parsedURL.lookup(advancedSearchKeys[key])[0];
            query.push({'index': key, 'precision':'contains', 'term': decodeURIComponent(value)});
        })
    }


    var searchRecordCount = parseInt(jQuery('#resultsNumbersTile em:first').text().replace(/[\s,]+/g,''));

    var searchStep = parseInt($('#resultsNumbersTile span:first').text().replace(/[^\d|-]*/g,'').split('-')[1]);
    var searchPage = 1;
    if (isNaN(searchStep)){
        searchStep = 10;
        searchPage = 1;
    } else {
        searchStep = (parseInt($('#resultsNumbersTile span:first').text().replace(/[^\d|-]*/g,'').split('-')[1]) - parseInt($('#resultsNumbersTile span:first').text().replace(/[^\d|-]*/g,'').split('-')[0])) + 1;
        searchPage = Math.floor(parseInt($('#resultsNumbersTile span:first').text().replace(/[^\d|-]*/g,'').split('-')[1])/(searchStep));
    }


    return {
        isDeeplinkSearch: function(){
            return (window.location.href.match('dlSearch.do') != null);
        },
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