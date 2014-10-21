;(function ($) {
/**
 * @overview A PRIMO convenience library
 * @licence MIT
 * @copyright KULeuven/LIBIS 2014
 * @author Mehmet Celik <mehmet.celik@libis.kuleuven.be>
 * @description This is a dropin library for Primo. We intend to make the life of frontend developers easier.
 */

/**
 * Private method to build a pointer to the record and enhance it
 * @method _record
 * @private
 * @param {Number} i record on page
 * @returns {Object} enhanced record pointer
 */
function _record(i) {
    var recordData = null;
    var record = jQuery(jQuery('.EXLResult')[i]);

// attributes
    record.index = i;
    record.id = record.find('.EXLResultRecordId[name]').attr('name');
    record.title = record.find('.EXLResultTitle').text().trim();
    record.openUrl = record.find('.EXLMoreTab a').attr('href');
    record.tabs = _tabs(record);
    record.materialType = function(){return _materialType(record)};

// methods
    record.getIt1 = function(){ return _getGetIt(record);} // needs tabs


    record.getDedupedRecordIds =  function(){ return _getRecordIdInDedupRecord(record.id).data() };

    record.isRemoteRecord = (function(){ return (record.id.substring(0, 2) === 'TN')})();

    record.getData = function(){
        if(!recordData){
            var data = _getPNXData(record.id, 'json');
            if (data && data.length > 0 ) {
                recordData =  data[0];
            }
        }

        return recordData;
    };

    record.getPNX = function (type) {
        return _getPNXData(record.id, type);
    };

    return record;
};

/**
 * @method _getPNXData
 * @param {String} recordID - The record id
 * @params {String} type - The type of response to return can be one of text,json or xml. XML is the default
 * @returns {Object} PNX record
 * @private
 */
var _getPNXData = function (recordID, type) {
    var pnx = null;
    if (type === undefined) {
        type = 'text'
    }

    jQuery.ajax(
        {
            async: false,
            type: 'get',
            dataType: 'xml',
            //url: '/primo_library/libweb/showPNX.jsp?id=' + recordIndex,
            url: '/primo_library/libweb/action/display.do?vid=' + jQuery.PRIMO.session.view.code + '&showPnx=true&pds_handle=GUEST&doc=' + recordID,
            success: function (data, event, xhr) {

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
            }
        });
    return pnx;
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
};

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
        data: function(){
            if (dedupRecordIds.length === 0){
                if (_getIsDedupRecord(id)) {
                    jQuery.ajax({
                        async: false,
                        type: 'get',
                        dataType: 'json',
                        data: {"id": id},
                        url: '/primo_library/libweb/dedup_records_helper.jsp'
                    }).done(function(data, textStatus, jqXHR){
                        dedupRecordIds = data;
                    }).fail(function(data, textStatus, jqXHR){
                        console.log('You need the dedup_records_helper.jsp file');
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
    return _getPNXData(record.id).find('type').text();
};


/**
 * @method _getGetIt
 * @param {Object} record
 * @returns {string}
 * @private
 */
function _getGetIt(record){
    var getIt = [];
    var view_online = record.tabs.getByName('ViewOnline');
    var url = '';

    if (view_online && view_online.length > 0){
     url = $(view_online.find('input[id*="getitonline1"]')).val().split('O4=')[1].split('O5=')[0].replace(/delivery,.*?,/,'');
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
         * @method by_record_id
         * @private
         * @param {String} record id
         * @returns {Object} record hash
         */
        by_record_id: function(rid, options){
            if (rid === undefined) {
                throw 'You must supply a record id'
            }

            var institution = options !== undefined ? options['institution'] : jQuery.PRIMO.session.view.code;
            var index       = options !== undefined ? options['index'] : 1;
            var bulkSize    = options !== undefined ? options['bulkSize'] : 10;

            var result      = [];

            jQuery.get('/PrimoWebServices/xservice/search/brief?institution=' + institution + '&query=rid,contains,' + rid +
                       '&indx=' + index + '&bulkSize=' + bulkSize)
                  .done(function(data){
                    result = $(_xml2json(data));
                    })
                  .fail(function(data){
                    console.log('error searching')
                    });

            return result;
        },
        /**
         * Get Record by a query in the form of index,match type,query
         * @method by_query
         * @private
         * @param {String} query
         * @returns {Object} record hash
         */
        by_query: function(query, options) {
            var institution = options !== undefined ? options['institution'] : jQuery.PRIMO.session.view.code;
            var index       = options !== undefined ? options['index'] : 1;
            var bulkSize    = options !== undefined ? options['bulkSize'] : 10;

            if (Array.isArray(query)){
                jQuery.each(query, function(index, value){
                query =+ '&query=' + value;
                });
            } else {
                query = '&query=' + query;
            }

            var result = [];

            jQuery.ajax(
                {
                    async: false,
                    type: 'get',
                    dataType: 'xml',
                    url: '/PrimoWebServices/xservice/search/brief?institution=' + institution + '&indx=' + index + '&bulkSize=' + bulkSize + query
                })
                .done(function(data, event, xhr){
                    result = $(_xml2json(data));
                })
                .fail(function(data, event, xhr){
                    console.log('error searching')
                });
            ;



            return result.length > 0 ? result[0].JAGROOT.RESULT.DOCSET.DOC : null;
        }
    }
}
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
            if (!jQuery.PRIMO.session.view.isFullDisplay) {
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
 * Retrieves session data only available on the server
 * @method _getSessionData
 * @returns {Object} returns session data.
 * @description Retrieves session data from server with fallback
 * @private
 */
var _getSessionData = (function() {
      var sessionData = null;
      return {
        data: function() {
          if (!sessionData) {
              sessionData = {};
            jQuery.ajax({
              async: false,
              type: 'get',
              dataType: 'json',
              url: '/primo_library/libweb/remote_session_data_helper.jsp'
            }).done(function(data, textStatus, jqXHR){
                sessionData = data;
            }).fail(function(data, textStatus, jqXHR){
                // Fallback when file is not available. Maybe we should not do this.
                //TODO: do we need this?
                sessionData = {
                    view: {},
                    user: {
                        id: _getUserInfo.data().id,
                        name: _getUserInfo.data().name,
                        isLoggedIn: function () {
                            return _getUserInfo.data().loggedIn;
                        }
                    }
                }
            });

            $.extend(sessionData.view,{
                  isFullDisplay: (function () {
                      return window.isFullDisplay();
                  })(),

                  frontEndID: (function () {
                      return _getFrontEndID.data();
                  }())
              });
            return sessionData;
          }
        }
      }
})();

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
                        dataType: 'xml',
                        url: '/primo_library/libweb/getUserInfoServlet',
                        success: function (data, event, xhr) {
                            user.id = $(data).find('userId').text();
                            user.name = $(data).find('userName').text();
                            user.loggedIn = $(data).find('isLoggedIn').text() === 'true';
                        }
                    });
            }

            return user;
        }
    };
})();
/**
 * Reads the FrontEndID from the X-PRIMO-FE-ENVIRONMENT header
 * @method _getFrontEndID
 * @return {String} FrontEnd ID
 * @private
 */
var _getFrontEndID = (function () {
    var FEID = null;

    return {
        data: function () {
            if (!FEID) {
                FEID = 'unknown';
                jQuery.ajax(
                    {
                        async: false,
                        type: 'get',
                        url: '/primo_library/libweb/static_htmls/header.html',
                        complete: function (xhr, status) {
                            FEID = xhr.getResponseHeader('X-PRIMO-FE-ENVIRONMENT');
                        }
                    });
            }
            return FEID;
        }
    }
})();
/**
 *
 * An ExLibris PRIMO convinience Library
 */

/**
 * @namespace jQuery.PRIMO
 */
jQuery.PRIMO = {
    session: (function() {return _getSessionData.data()})(),
    records: (function () {
        var records_count = jQuery('.EXLResult').length;
        var data = [];

        for (var j = 0; j < records_count; j++) data.push(_record(j));

        return $(data);
    }()),
    search: _search()
};

})(jQuery);