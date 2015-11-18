//Borrowed from http://absurdjs.com/ thanks Kasimir.
function _template(){
    function _render(html, options, isDeferred) {
        isDeferred = typeof isDeferred == "undefined" ? false : isDeferred;

        if (isDeferred) {
            return _deferredRender(html, options);
        } else {
            return _normalRender(html, options);
        }
    }

    function _normalRender(html, options) {
        var re = /{{(.+?)}}/g,
            reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
            code = 'with(obj) { var r=[];\n',
            cursor = 0,
            result;
        var add = function (line, js) {
            js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return add;
        };
        var match;
        while (match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, '');
        try {
            result = new Function('obj', code).apply(options, [options]);
        }
        catch (err) {
            console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
        }
        return result;
    }

    function _deferredRender(html, options) {
        var d = $.Deferred();
        try {
            d.resolve(_render(html, options));
        } catch(e) {
            d.reject(function(){console.log("Error rendering template: " + id, e); return "";});
        }
        return d.promise();
    }

    return {
        render: function(html, options, isDeferred){
            isDeferred = typeof isDeferred == "undefined" ? false : isDeferred;

            return _render(html, options, isDeferred);
        },
        renderById: function(id, options, isDeferred){
            isDeferred = typeof isDeferred == "undefined" ? false : isDeferred;

            var html = $('#'+id).html();
            return _render(html, options, isDeferred);
        }
    }
}