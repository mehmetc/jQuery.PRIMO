jQuery.PRIMO
============

A client side convenience library for PRIMO v4.6 and better.


Installation  (TODO)
------------

### Just for testing
You can inject the script into your results page, for testing. This works best using Firefox.
Open the JavaScript console and paste the next line. You will not be able to use the more advanced functions 
but it should give you an idea of what it can be used for.
```js
    $.getScript('https://raw.githubusercontent.com/mehmetc/jQuery.PRIMO/master/dist/jquery.PRIMO.js')
``` 
Browsers are getting stricter with every release. If you get strange errors just copy the complete source into your console.    
    
### A more permanent solution    
- Copy the contents of scripts/server/* to fe_web 
```bash
    scp scripts/server/* primo@my_primo.example.com:/exlibris/primo/p4_1/ng/primo/home/system/tomcat/search/webapps/primo_library#libweb
```    
- Copy jquery.PRIMO.min.js to fe_web
```bash
    scp dist/jquery.PRIMO.min.js primo@my_primo.example.com:/exlibris/primo/p4_1/ng/primo/home/system/tomcat/search/webapps/primo_library#libweb
```    
- Add jquery.PRIMO.min.js to static_htmls/footer.html or to a custom tile
```js    
    <script type='text/javascript' src='/primo_library/libweb/jquery.PRIMO.min.js'></script>
```    
  

Compilation  (TODO)
-----------
If you would want to compile jquery.PRIMO.js then follow these steps
- Install [npm](http://nodejs.org/) and [gulp](http://gulpjs.com/)
- `npm install`
- `gulp`



##Examples  
  
###Read the current sessions user id
```js
    jQuery.PRIMO.session.user.id;    
```

###Read the current session user name
```js
    jQuery.PRIMO.session.user.name;            
```

###Check if the current user is logged in
```js
    jQuery.PRIMO.session.user.isLoggedIn;    
```

###Check if the current user is on campus
```js
    jQuery.PRIMO.session.user.isOnCampus;    
```

###Get the current view code
```js
    jQuery.PRIMO.session.view.code;
```

###Get the current view's institution
```js
    jQuery.PRIMO.session.view.institution.name;
```  

###Is the current view in full display mode
```js
    jQuery.PRIMO.session.view.isFullDisplay;    
```

###Get the record id of the 6th field
```js
    jQuery.PRIMO.records[5].id;    
```

###Get the PNX data as text,json,xml of the 6th record
```js
    jQuery.PRIMO.records[5].getPNX('text');
    jQuery.PRIMO.records[5].getPNX('json');
    jQuery.PRIMO.records[5].getPNX();    
```

###Get the material type of the first record
```js
    jQuery.PRIMO.records[0].getData().display.type
```

###Get all record ids for a deduped record
```js
    jQuery.PRIMO.records[2].getDedupedRecordIds()
```

###Highlight all journals on screen
```js
      jQuery.PRIMO.records.each(
        function(){ 
            if (this.getData().display.type === 'journal') {
                this.css('background-color', 'yellow')
            } 
        }
      ); 
```

###Make the 'View Online' tab popout
```js
    jQuery.PRIMO.records.each(
        function(index, record){
            var view_online = record.tabs.getByName('ViewOnline');
            try{
                view_online.find('a').attr('target', '_blank').attr('href', record.getIt1);                          
            } catch (e) {
                console.log('Error setting url');
            }
            
        }
    );    
```

###Add a new tab to all records
```js
      jQuery.PRIMO.records.each(
        function(index, record){
          record.tabs.addTab('Hello World',{
            state:'enabled', 
            click:function(event, tab, record, options){
                    if (tab.isOpen()){
                        tab.close();
                    } else {
                        tab.open('Hello from tab', {reload:true});
                    }
                  }	
          });          
        }
      );
```      
      
### Add a new share tab and make the sendTo tab appear.
```js
    jQuery.PRIMO.records.each(
        function(index, record){
            record.tabs.addTab('Share', {tooltip:'Share', state:'enabled', click:function (event, tab, record, options) {
                if (tab.isOpen()) {
                    tab.close();
                } else {
                    var tab_content = "";
                    var details_url = $(record.tabs).filter('.EXLDetailsTab').find('a').attr('href');
    
                    tab_content += "<div style='overflow:auto;height:100%;padding:20px;'>"
                    tab_content += '  <div class="share_options_import"></div>';
                    tab_content += '</div>';
    
                    $.get(details_url,
                        function(data){
                            var html = $($.parseHTML(data)).find('.EXLTabHeaderButtonSendToList li');
                            var permalink = html.filter('.EXLButtonSendToPermalink').length == 0 ? false : true;
                            var citation = html.filter('.EXLButtonSendToCitation').length == 0 ? false : true;
    
                            if (permalink) {
                                html.filter('.EXLButtonSendToPermalink').find('a').attr('onclick', html.filter('.EXLButtonSendToPermalink').find('a').attr('onclick').replace(/-1/g, record.index));
                            }
    
                            if (citation){
                                html.filter('.EXLButtonSendToCitation').find('a').attr('onclick', html.filter('.EXLButtonSendToCitation').find('a').attr('onclick').replace(/-1/g, record.index));
                            }
                            $('.share_options_import').empty().append(html);
                        }, 'html'
                    );
    
                    details_url = 'http://' + location.hostname + location.pathname.substr(0, location.pathname.lastIndexOf('/')) + '/display.do?tabs=detailsTab&ct=display&fn=search&doc=' + record.id + "&recIds=" + record.id;
    
                    tab.open(tab_content, {reload:true, url:details_url});
                }
            }
        });
       }
    );        
```      
      
      
      
      
      
# Contributing to jQuery.PRIMO
- Fork the project.
- Create a new branch to implement your bugfixes or features
- Commit and push until you are happy with your contribution.
- Send a pull request.
      
# License
MIT (c) 2014 KULeuven/LIBIS written by Mehmet Celik     