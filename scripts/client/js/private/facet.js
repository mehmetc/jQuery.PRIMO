function _facet() {
    var facets = [];
    jQuery.each(jQuery('#facetList .EXLFacetContainer'), function (i, container) {
        container = $(container);
        container.name = $(container).find('*[class*="EXLFacetTitleLabelPHolder"]').attr('class').replace('EXLFacetTitleLabelPHolder', '');
        container.values = [];
        $.each(container.find('.EXLFacet'), function (i, facet) {
            facet = $(facet);
            facet.value = $(facet).find('a').text().trim();
            facet.count = $(facet).find('span').text().trim().replace(/\.|\,/g, '').replace(/\(/g, '').replace(/\)/g, '');

            container.values.push(facet);
        });

        facets.push(container);
    });

    facets.getNames = function () {
        return $.map(facets, function (facet,i) {
            return facet.name;
        })
    };

    facets.getByName = function(name){
      return facets.filter(function(facet, i){
          return facet.name === name;
      })[0];
    };

    return facets;
}