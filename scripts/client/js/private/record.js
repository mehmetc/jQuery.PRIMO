/**
 * Private method to build a pointer to the record and enhance it
 * @method _record
 * @private
 * @param {Number} i record on page
 * @returns {Object} enhanced record pointer
 */
function _record(i, allData) {
    var recordData = null;
    var record = jQuery(jQuery('.EXLResult')[i]);

// attributes
    record.index = i;
    record.id = record.find('.EXLResultRecordId[name]').attr('name');
    record.title = record.find('.EXLResultTitle').text().trim();
    record.openUrl = record.find('.EXLMoreTab a').attr('href');
    record.tabs = _tabs(record);
    record.materialType = function () {
        return _materialType(record)
    };
    record.rawData = allData[record.id];

// methods
    record.getIt1 = function () {
        return _getGetIt(record);
    }; // needs tabs


    record.getDedupedRecordIds = function () {
        return _getRecordIdInDedupRecord(record.id).data()
    };

    record.isRemoteRecord = function () {
        return (record.id.substring(0, 2) === 'TN')
    };
    record.isOnEShelf = function () {
        return record.find('.EXLMyShelfStar a').attr('href').search('fn=remove') != -1
    };
    record.isDedupedRecord = function () {
        return _getIsDedupRecord(record.id)
    };

    record.isFrbrRecord = function () {
        return _getIsFrbrRecord(record)
    };

    record.getPNX = function (type) {
        return _getPNXData(record.id, type);
    };

    record.getData = function () {
        if (!recordData) {
            var data;

            if (record.rawData && record.rawData != null) {
                recordData = record.rawData;
            } else {
                data = _getPNXData(record.id, "json");
                if (data && data.length > 0) {
                    recordData = data[0];
                }
            }
        }

        return recordData;
    };


    return record;
}

/**
 * @method _getPNXData
 * @param {String} recordID - The record id
 * @param {String} type - The type of response to return can be one of text,json or xml. XML is the default
 * @returns {Object} PNX record
 * @private
 */
var _getPNXData = function (recordID, type) {
    var pnx = null;
    if (type === undefined) {
        type = 'text'
    }

    jQuery.ajax({
        async: false,
        type: 'get',
        dataType: 'xml',
        url: jQuery.PRIMO.parameters.base_path + '/record/' + recordID + '.pnx'
    }).then(function (data, textStatus, xhr) {
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
    }, function (xhr, textStatus, errorThrown) {
        var pnx_url = '/primo_library/libweb/action/display.do?vid=' + jQuery.PRIMO.session.view.code + '&pds_handle=GUEST&doc=' + recordID + '&showPnx=true';

        jQuery.ajax({
            async: false,
            type: 'get',
            dataType: 'xml',
            url: pnx_url
        }).then(function (data, event, xhr) {
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
        }, function (xhr, textStatus, errorThrown) {
            alert('Unable to load record:' + errorThrown);
        });
    }); //then

    if ($.isArray(pnx)) {
        return pnx[0];
    } else {
        return pnx;
    }
};

var _getLocalPNXData = function(record, type) {
    var pnx = null;
    var xml = _text2xml(record.rawData);

    if (type === undefined) {
        type = 'text'
    }

    switch (type) {
        case 'text':
            pnx = _xml2text(xml);
            break;
        case 'json':
            pnx = $(_xml2json(xml));
            break;
        default:
            pnx = $(xml);
    }

    if ($.isArray(pnx)) {
        return pnx[0];
    } else {
        return pnx;
    }
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
}

/**
 * Private method check if record is a frbr record
 * @private
 * @method _getIsFrbrRecord
 * @param {String} record
 * @returns {Boolean} true/false
 */
function _getIsFrbrRecord(record) {
    return record.find('.EXLResultFRBR').length > 0;
}

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
        data: function () {
            if (dedupRecordIds.length === 0) {
                if (_getIsDedupRecord(id)) {
                    jQuery.ajax({
                        async: false,
                        type: 'get',
                        dataType: 'json',
                        url: jQuery.PRIMO.parameters.base_path + '/record/resolve/' + id
                    }).done(function (data, textStatus, jqXHR) {
                        dedupRecordIds = data;
                    }).fail(function (data, textStatus, jqXHR) {
                        console.log('Error resolving ' + id);
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
    //return _getPNXData(record.id, 'json').display.type;
    return record.getData().display.type;
}


/**
 * @method _getGetIt
 * @param {Object} record
 * @returns {string}
 * @private
 */
function _getGetIt(record) {
    var view_online = record.tabs.getByName('ViewOnline');
    var url = '';
    var urls = [];
    var raw_list = [];

    if (view_online && view_online.length > 0) {
        raw_list = $(view_online.find('input[id*="getitonline1"]')).val().split(/&O\d=/);
        urls = $.map(raw_list, function (d) {
            if (d.match(/^delivery/)) {
                return d.replace(/delivery,.*?,/, '')
            }
        });
        url = urls.length > 0 ? urls[0] : '';
    }

    return url;
}
