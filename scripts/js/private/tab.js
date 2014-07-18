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

    if (typeof(i) == 'number') {
        tab = record.find('.EXLResultTab')[i];
    }
    else if (typeof(i) == 'string') {
        tab = record.find('.EXLResultTab:contains("' + i + '")');

        if (tab == null || tab.length == 0) {
            tab = $(record.tabs).find('a[title*="' + i + '"]').parent();
        }

        if (tab == null || tab.length == 0){
            tab = $(record).find('li[class*="' + i + '"]');
        }
    }

    if (tab !== null) {
        var tabName = jQuery(tab).find('a').text().trim();
        var container = null;
        jQuery.each(tabName.toLowerCase().replace(/\s/g, '').split('&'), function () {
            c = record.find('*[class*="Container-' + this + '"]');

            if (c.length > 0) {
                container = c;
            }
        });

        tab.index = i;
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
                var popOut = '<div class="EXLTabHeaderContent">' + o.headerContent + '</div><div class="EXLTabHeaderButtons"><ul><li class="EXLTabHeaderButtonPopout"><span></span><a href="' + o.url + '" target="_blank"><img src="../images/icon_popout_tab.png" /></a></li><li></li><li class="EXLTabHeaderButtonCloseTabs"><a href="#" title="hide tabs"><img src="../images/icon_close_tabs.png" alt="hide tabs"></a></li></ul></div>';
                var header = '<div class="EXLTabHeader">' + popOut + '</div>';
                var body = '<div class="EXLTabContent">' + content + '</div>'
                currentTab.container.html(header + body);
                currentTab.container.data('loaded', true);
            }
        }
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
        return jQuery.map(record.find('.EXLResultTab'),
            function (tab) {
                tab = jQuery(tab);
                if (tab.css('display') != 'none') {
                    return jQuery(tab).text().trim();
                }
                return null;
            });
    };

    tabData.getByName = function(name){
        return _tab(record, name);
    }


    return tabData;
}

/**
 * Adds a new tab to tabs
 * @method _addTab
 * @private
 * @param {String} tabName name of tab
 * @param {Hash} [options] a hash with any of these {record, state:'enabled/disabled', css, url:'#', tooltip, headerContent, click:callbackFunction}
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
        css: tabName.replace(' ', '').toLowerCase() + 'Tab',
        url: '#',
        tooltip: '',
        headerContent: '',
        click: function (e) {
            alert('To be implemented...');
        }
    }

    var o = jQuery.extend(defaults, options);

    if (jQuery.inArray(tabName, o.record.tabs.getNames()) < 0) { // not in tablist -> new tab
        var customTab = '<li class="EXLResultTab ' + o.css + '">';
        customTab += '  <span style="display:' + (o.state == 'disabled' ? 'block' : 'none') + '">' + tabName + '</span>';
        customTab += '  <a style="display:' + (o.state == 'disabled' ? 'none' : 'block') + '" title="' + o.tooltip + '" href="' + o.url + '">' + tabName + '</a>';
        customTab += '</li>';
        var customTabContainer = '<div class="EXLResultTabContainer EXLContainer-' + o.css + '"></div>';

        o.record.find('.EXLResultTab').last().after(customTab);
        if (o.record.hasClass('EXLSummary')) {
            o.record.append(customTabContainer);
        } else {
            o.record.find('.EXLSummary').append(customTabContainer);
        }

        var customClassQuery = '.' + o.css + ' a';
        o.record.find(customClassQuery).click(function (e) {
            e.preventDefault();
            if (o.state == 'enabled') {
                tab = o.record.tabs.getByName(tabName);
                o.click(e, tab, o.record, o);
            }
        });
    }
    else {

    }

    o.record.tabs = _tabs(o.record);
}