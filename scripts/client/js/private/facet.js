function _facet() {
    var facets = [];
    try {
        jQuery.each(jQuery('#facetList .EXLFacetContainer'), function (i, container) {
            container = $(container);
            container.name = $(container).find('*[class*="EXLFacetTitleLabelPHolder"]').attr('class').replace('EXLFacetTitleLabelPHolder', '');
            container.title = $(container).find('*[class*="EXLFacetTitleLabelPHolder"]').text().trim();
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
            })[0];
        };
    } catch(error) {
        console.log('unable to load facets');
    }

    return facets;
}