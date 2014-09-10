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
