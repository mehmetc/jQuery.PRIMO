jQuery.PRIMO
============

A client side convenience library for PRIMO v4.6 and better. 
This is a work in progress. This might not work for you at all but if more people use it the better it will get. 
If you want a feature, have a comment, found a bug or just want to talk ping me.  

See the [releases](https://github.com/mehmetc/jQuery.PRIMO/releases) for downloads and release notes


Installation  (TODO)
------------

### Just for testing
You can inject the script into your results page, for testing. This works best using Firefox.
Open the JavaScript console and paste the next line. You will not be able to use the more advanced functions 
but it should give you an idea of what it can be used for.
```js
    $.getScript('https://raw.githubusercontent.com/mehmetc/jQuery.PRIMO/master/dist/jqprimo/jquery.PRIMO.js')
``` 
Browsers are getting stricter with every release. If you get strange errors just copy the complete source into your console.    
    
### A permanent solution
- Copy the contents of the dist/* directory to fe_web
```bash
    scp dist/* primo@my_primo.example.com:/exlibris/primo/p4_1/ng/primo/home/system/tomcat/search/webapps/primo_library?libweb
```    
- Add jquery.PRIMO.min.js to **static_htmls/footer.html** or to a custom tile and add the snippet below to it
```js    
    <script type='text/javascript' src='/primo_library/libweb/jqprimo/jquery.PRIMO.min.js'></script>
```    

If you do not have shell access to your server you can use "File Uploader"(Primo Home > Primo Utilities > File Uploader)
on the backend but you will not be able to upload the helper files. I have no solution for this besides asking ExLibris to upload these.

The helper files will add extra functionality to the library like looking up records id in a deduped record, get the original record, ...

Compilation  (TODO)
-----------
If you would want to compile jquery.PRIMO.js then follow these steps
- Install [npm](http://nodejs.org/) and [gulp](http://gulpjs.com/)
- `npm install`
- `gulp`



#Examples  
  
- [misc](#misc)  
- [session](#session)
- [records](#records)
- [search](#search)  
- [query](#query)
  
##**MISC**<a name="misc"></a>  
#### Version of jQuery.PRIMO library
```js
    jQuery.PRIMO.version;
```

#### Reload jQuery.PRIMO
```js
    jQuery.PRIMO.reload();
```

##**SESSION**<a name="session"></a>
- [user](#user)
- [view](#view)
- [ip](#ip)
- [pds](#pds)

#### Get the session id
```js
    jQuery.PRIMO.session.sessionId;
```

#### Reload session data
```js
    jQuery.PRIMO.session.reload();
```

###**USER**<a name="user"></a>
#### Read the current sessions user id
```js
    jQuery.PRIMO.session.user.id;    
```

#### Read the current session user name
```js
    jQuery.PRIMO.session.user.name;            
```

#### Read the current session user email
```js
    jQuery.PRIMO.session.user.email;            
```

#### Check if the current user is logged in
```js
    jQuery.PRIMO.session.user.isLoggedIn();    
```

#### Check if the current user is on campus
```js
    jQuery.PRIMO.session.user.isOnCampus();    
```
###**VIEW**<a name="view"></a>
#### Get the current view code
```js
    jQuery.PRIMO.session.view.code;
```

#### Get the current view's institution name
```js
    jQuery.PRIMO.session.view.institution.name;
```  

#### Get the current view's institution code
```js
    jQuery.PRIMO.session.view.institution.code;
```  

#### Get the current view's interface language
```js
    jQuery.PRIMO.session.view.interfaceLanguage;
```  

#### Is the current view in full display mode
```js
    jQuery.PRIMO.session.view.isFullDisplay();    
```

#### Get the current view frontend id
The file:
```
  jqprimo/helpers/frontend_id
```
should contain a marker for the frontend where jQuery.PRIMO is installed.
For example:
    staging or test or 1 or ...

Then you can get the frontend id this can be handy when you are debugging

```js
    jQuery.PRIMO.session.view.frontEndID;    
```

###**IP**<a name="ip"></a>

####Get IP address as seen on PRIMO
```js
    jQuery.PRIMO.session.ip.address;
```

####Get institution name by IP 
```js
    jQuery.PRIMO.session.ip.institution.name;
```

####Get institution code by IP 
```js
    jQuery.PRIMO.session.ip.institution.code;
```    

##**PDS**<a name="pds"></a>
#### Get the url for PDS
```js
    jQuery.PRIMO.session.pds.url;
```

#### Get PDS Handle (only available after login)
```js
    jQuery.PRIMO.session.pds.handle;
```

### GET borrower info _Object_ from PDS. 
This uses General Configuration -> Installation -> PDS_URL to build the PDS access url 
and it returns /bor/bor-info. 
```js
    jQuery.PRIMO.session.pds.borInfo;
```

##**RECORDS**<a name="records"></a>
- [tabs](#tabs)

#### Get number of records on screen (this is an Array)
```js
    jQuery.PRIMO.records.length;
```

#### Get the record id of the 6th field
```js
    jQuery.PRIMO.records[5].id;    
```

#### Get the record index
```js
    jQuery.PRIMO.records[5].index;    
```

#### Get title of 6th record
```js
    jQuery.PRIMO.records[5].title;    
```

#### Get OpenUrl of 6th record
```js
    jQuery.PRIMO.records[5].openUrl;
```

#### Get type of 6th record
```js
    jQuery.PRIMO.records[5].materialType();
```    

#### Get getIt1 of 6th record
```js
    jQuery.PRIMO.records[5].getIt1();
```    

#### Is the 6th record a remote record
```js
    jQuery.PRIMO.records[5].isRemoteRecord();
```

#### Is the 6th record on the eShelf
```js
    jQuery.PRIMO.records[5].isOnEShelf();
```

#### Get the PNX data as text,json,xml of the 6th record
```js
    jQuery.PRIMO.records[5].getPNX('text');
    jQuery.PRIMO.records[5].getPNX('json');
    jQuery.PRIMO.records[5].getPNX();    
```

#### Get the material type of the first record
```js
    jQuery.PRIMO.records[0].getData().display.type;
```

#### Check if 6th record was deduped
```js
    jQuery.PRIMO.records[5].isDedupedRecord();
```

#### Get all record ids for a deduped record
```js
    jQuery.PRIMO.records[2].getDedupedRecordIds();
```

#### Highlight all journals on screen
```js
      jQuery.PRIMO.records.each(
        function(){ 
            if (this.getData().display.type === 'journal') {
                this.css('background-color', 'yellow')
            } 
        }
      ); 
```

#### Make the 'View Online' tab popout
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

##**TABS**<a name="tabs"></a>

#### Add a new tab to all records
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
      
#### Add a new share tab and make the sendTo tab appear.
```js
    jQuery.PRIMO.records.each(
        function(index, record){
            record.tabs.addTab('Share', {tooltip:'Share', state:'enabled', click:function (event, tab, record, options) {
                if (tab.isOpen()) {
                    tab.close();
                } else {
                    var tab_content = "";
                    var details_url = $(record.tabs).filter('.EXLDetailsTab').find('a').attr('href');
    
                    tab_content += "<div style='overflow:auto;height:100%;padding:20px;'>";
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
                            
                            eshelfUpdate(record.children(), record.isOnEShelf());
                        }, 'html'
                    );
    
                    details_url = 'http://' + location.hostname + location.pathname.substr(0, location.pathname.lastIndexOf('/')) + '/display.do?tabs=detailsTab&ct=display&fn=search&doc=' + record.id + "&recIds=" + record.id;
    
                    tab.open(tab_content, {reload:false, url:details_url});
                }
            }
        });
       }
    );                
```          
      
#### Open an URL in the tab of the first record
```js
    jQuery.PRIMO.records[0].tabs.addTab('KULeuven', {state:'enabled',
                                                url:'http://www.kuleuven.be',
                                                click:function(event, tab, record, options) {
                                                    if (tab.isOpen()) {
                                                        tab.close();
                                                    } else {
                                                        tab.open('<iframe src="'+options.url+'"/>', {reload: true});
                                                    }
                                                }
                                               });      
```
#### Open the URL in a new window. Works as a normal link.
```js
       jQuery.PRIMO.records[1].tabs.addTab('url', {state:'enabled',
                                                   url:'http://www.kuleuven.be', url_target: '_blank',
                                                   click: null
                                                  }); 
```                                                  
  
#### Get all tab names for the 6th record
```js  
    jQuery.PRIMO.records[5].tabs.getNames();
```

#### Get all active tabs
```js
    jQuery.PRIMO.records[5].tabs.getEnabled();
``` 

#### Get the details tab by name
```js
    jQuery.PRIMO.records[5].tabs.getByName('Details');
```   
  
#### Programmatically click on a tab
```js
    jQuery.PRIMO.records[0].tabs.getByName('Details').find('a').click();
```  
  
#### Get the link behind the details tab
```js
    jQuery.PRIMO.records[5].tabs.getByName('Details').find('a').attr('href');
```  
    
#### Get the name of the first tab
```js
    jQuery.PRIMO.records[5].tabs[0].name;    
```    

#### Get the index of the first tab
```js
    jQuery.PRIMO.records[5].tabs[0].index;
```    

#### Get the container of the second tab
```js
   jQuery.PRIMO.records[5].tabs[1].container;
```
    
#### Check if tab is open
```js
    jQuery.PRIMO.records[5].tabs[4].isOpen();
```    
    
##**SEARCH**<a name="search"></a>  
#### Search for water 
*This wraps the default [XServices API](https://developers.exlibrisgroup.com/primo/apis/webservices/xservices/search/briefsearch) this means that 'WS and XS IP' restrictions apply*
**TODO: move to server** 

```js
    var result = jQuery.PRIMO.search.by_query('any,contains,water');
```    

##**QUERY**<a name="query"></a>
### Get result set count
```js
   jQuery.PRIMO.query.count;
```

### Get current page number
```js
    jQuery.PRIMO.query.page;
```
       
### Get number of records on page
```js
    jQuery.PRIMO.query.step;
```
should be equal to
```js
    jQuery.PRIMO.records.length;
```

### Get search type basic/advanced
```js
    jQuery.PRIMO.query.type;
```

### Get search tab
```js
    jQuery.PRIMO.query.tab;
```    
           
### Get search sort 
```js
    jQuery.PRIMO.query.sorted_by;
```               
      
### Get query
This will return an _Object_ or an _Array_ depending on the query.type
```js
    jQuery.PRIMO.query.query;
```      

### Get search scope
```js
    jQuery.PRIMO.query.scope;
```

### Get facets
```js
    jQuery.PRIMO.query.facets;
```
    
### Is this a dlSearch.do search?
```js
    jQuery.PRIMO.query.isDeeplinkSearch();
```    
      
# Contributing to jQuery.PRIMO
- Fork the project.
- Create a new branch to implement your bugfixes or features
- Commit and push until you are happy with your contribution.
- Send a pull request.
      
# License
MIT (c) 2015 KULeuven/LIBIS written by Mehmet Celik