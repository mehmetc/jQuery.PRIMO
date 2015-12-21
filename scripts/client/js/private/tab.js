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
        var containerName = 'Container-' + tabName.trim().toLowerCase().replace(/tab$/g, '') + 'Tab';
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
                var body = '<div class="EXLTabContent">' + content + '</div>'
                currentTab.container.html(header + body);
                currentTab.container.data('loaded', true);
            }
        };
        tab.onTabReady = function (record, tab) {
        };
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

    //add event listener
    //jQuery.each(tabData, function (index, tab) {
    //
    //    var events = jQuery._data($("#" + tab.id)[0],'events');
    //    if (events == undefined || (events && events.ajaxComplete && events.ajaxComplete.length == 0)) {
    //        jQuery("#"+tab.id).ajaxComplete(function (event, xhr, settings) {
    //            var thisTab = this;
    //
    //            if (event.target.id == thisTab.id && thisTab.isOpen()) {
    //                if (thisTab.container != null) {
    //                    var tabUtils = thisTab.container[0].tabUtils;
    //
    //                    if (tabUtils && tabUtils.isTabReady()) {
    //                        if ($.inArray('onTabReady', Object.keys(thisTab)) != -1) {
    //                           // var record = $(thisTab).closest(".EXLResult");
    //                            thisTab.onTabReady(record, thisTab);
    //                        }
    //                    }
    //                }
    //            }
    //
    //        });
    //    }
    //
    //});

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

        var customClassQuery = '.' + o.css + ' a';
        if (o.click !== null) {
            o.record.find(customClassQuery).click(function (e) {
                e.preventDefault();
                if (o.state == 'enabled') {
                    tab = o.record.tabs.getByName(tabName);
                    o.click(e, tab, o.record, o);
                }
            });
        }
    }
    else {
        //TODO
    }

    o.record.tabs = _tabs(o.record);
}