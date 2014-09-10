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
