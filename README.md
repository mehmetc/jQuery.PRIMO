jQuery.PRIMO
============

The missing model for PRIMO v4.9 and better.  
This is a work in progress! 
If you want a feature, have a comment, found a bug you can:

- ping me. [new issue](https://github.com/mehmetc/jQuery.PRIMO/issues/new)
- fork -> add changes -> send pull request  

See the [releases](https://github.com/mehmetc/jQuery.PRIMO/releases) for downloads and release notes

### WARNING
jQuery.PRIMO.js is intended to be used with a **vanilla**(unchanged) view. 
You might not get the intended experience if you changed/removed/renamed class names, id's etc. 

[Contact me](https://github.com/mehmetc/jQuery.PRIMO/issues/new) if you are experiencing problems. 
Installation  
------------
From February 2016 this will be a part of the general Primo release cycle. But if you have server access you can install it yourself.
###### jQuery.PRIMO exists of 2 parts:

- jQuery.PRIMO.js 
This is the client library that needs to be loaded inside your browser. It will expose the model.
- jQuery.PRIMO.jar (This is a seperate [project](https://github.com/mehmetc/jQuery.PRIMO.jar))
This is the server library. It exposes a Rest API used by the client library. 
  
#### Install and setup 
 
* copy jQuery.PRIMO.jar into $(fe_web)/WEB_INF/lib 
* copy jQuery.PRIMO.min.js into $(fe_web)/javascript
* add javascript snippet to a tile/html(footer.html for [example](https://github.com/mehmetc/jQuery.PRIMO/raw/master/test/resources/jQPFooter.html))  
```js 
    <script type='text/javascript' src='/primo_library/libweb/javascript/jQuery.PRIMO.min.js'></script>
``` 
* if you want to be able to retrieve the Original Record(MarcXML) then you need to uncomment or add
```xml
    <mapping resource="com/exlibris/primo/domain/entities/OriginalSourceRecord.hbm.xml"/>
```          
to the hibernate mapping file /exlibris/primo/p4_1/ng/primo/home/system/search/conf/hibernate.cfg.xml
The hibernate mapping file will be overwritten after each update this means you need to reapply this patch
after every Primo upgrade.
* restart your front end
* test it. 
    - Open/Reload your view
    - Open a console in your browser and type:
```js    
    jQuery.PRIMO.version;
```     

That is it.

I also created 3 screencasts(no audio) as a guide.

[![Installing jQuery.PRIMO](https://i.vimeocdn.com/video/553515621_590x332.jpg)](https://vimeo.com/153275621 "Installing jQuery.PRIMO v1.0.0")

[![Setup jQuery.PRIMO.js](https://i.vimeocdn.com/video/562009192_590x332.jpg)](https://vimeo.com/160106433 "Setup jQuery.PRIMO within the footer")


Or if you want to isolate jQuery.PRIMO.
 
 
[![Setup jQuery.PRIMO.js](https://i.vimeocdn.com/video/553619741_590x332.jpg)](https://vimeo.com/153357262 "Setup jQuery.PRIMO")


### Just for testing
You can inject the script into your results page, for testing. This works best using Firefox.
Open the JavaScript console and paste the next line. You will not be able to use the more advanced functions 
but it should give you an idea of what it can be used for.
```js
    $.getScript('https://github.com/mehmetc/jQuery.PRIMO/raw/master/dist/jQuery.PRIMO.js')
``` 
Browsers are getting stricter with every release. If you get strange errors just copy the complete source into your console.    
    
Compilation  (TODO)
-----------
If you would want to compile jquery.PRIMO.js then follow these steps
- Install [npm](http://nodejs.org/) and [gulp](http://gulpjs.com/)
- `npm install`
- `gulp`

#Exposed model
![jQuery.PRIMO Object Model](./docs/jquery.PRIMO.png "jQuery.PRIMO Object Model")

#Examples  
- [Use templates and keep your sanity](#templates)     
- [Events & Callbacks](#events)     
     
###### Objects             
- [misc](#misc)  
- [session](#session)
- [query](#query)
- [facets](#facets)
- [records](#records)
- [search](#search)  
  
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
Some functions and attributes will only be available when [jQuery.PRIMO.jar](https://github.com/mehmetc/jQuery.PRIMO.jar) is installed on the server.
Otherwise it will load a minimum of session data from the default _getUserInfoServlet_ service.    

- [user](#user)
- [view](#view)
- [ip](#ip)
- [pds](#pds)
- [performance](#performance)

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

#### Get the Personalized Ranking Categories
```js
    jQuery.PRIMO.session.user.ranking.categories;
```

#### Get the Personalized Ranking 'Prefer newer material' value
```js
    jQuery.PRIMO.session.user.ranking.prefer_new;
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
This is the hashCode() of the machines hostname. It is usefull for debugging or if you want a feature to only work on for example your staging enviroment.

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
When you are logged in you will get the bor-info from PDS. It serializes the xml into json.  

#### Get the url for PDS
```js
    jQuery.PRIMO.session.pds.url;
```

#### Get PDS Handle (only available after login)
```js
    jQuery.PRIMO.session.pds.handle;
```

### GET borrower info _Object_ from PDS. 
```js
    jQuery.PRIMO.session.pds.borInfo;
```

##**PERFORMANCE**<a name="performance"></a>
**Only available if the browser supports it.**
Be careful the getPageLoad and getPageRender methods are non blocking. 
This means they will _only_ return sain values after the page is completely loaded and rendered.

### Timing

#### Get timing for Network latency
```js
    jQuery.session.performance.timing.getNetworkLatency();
```

#### Get timing for Page Load
```js
    jQuery.PRIMO.session.performance.timing.getPageLoad();
```
    
#### Get timing for Page Render    
```js
    jQuery.PRIMO.session.performance.timing.getPageRender();
```
   

##**RECORDS**<a name="records"></a>
Extends the **DOM**.  

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

##**FACETS**<a name="facets"></a>
Extends the **DOM**. 

#### Get all facet names
```js
    jQuery.PRIMO.facets.getNames();
```

#### Get facet by name
```js
    jQuery.PRIMO.facets.getByName('facet_lang')
```

#### Get title for a facet by name
_facet_lang_ is the technical name. Title will return the screen name. The screen name depends on the view language.
```js
    jQuery.PRIMO.facets.getByName('facet_lang').title
```

#### Get ALL value objects for facet_lang
```js
    jQuery.PRIMO.facets.getByName('facet_lang').values
```

#### Get ALL values for first facet
```js
    jQuery.map(jQuery.PRIMO.facets[0].values, function(f,i){return f.value})
```

#### Get FIRST value for facet_lang
```js
    jQuery.PRIMO.facets.getByName('facet_lang').values[0].value
```

#### Get number of hits for FIRST facet of facet_lang
```js
    jQuery.PRIMO.facets.getByName('facet_lang').values[0].count
```

##**TABS**<a name="tabs"></a>
Extends the **DOM**. 

#### Add a new tab to all records
```js
      jQuery.PRIMO.records.each(
        function(index, record){
          record.tabs.addTab('HelloTab',{
            label: 'Hello World',
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
            record.tabs.addTab('ShareTab', {label: 'Share',tooltip:'Share', state:'enabled', click:function (event, tab, record, options) {
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
    jQuery.PRIMO.records[0].tabs.addTab('KULeuvenTab', {label: 'KULeuven', 
                                                        state:'enabled',
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
       jQuery.PRIMO.records[1].tabs.addTab('UrlTab', {label: 'Url', 
                                                      state:'enabled',
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
    jQuery.PRIMO.records[5].tabs.getByName('DetailsTab');
```   
  
#### Programmatically click on a tab
```js
    jQuery.PRIMO.records[0].tabs.getByName('DetailsTab').find('a').click();
```  
  
#### Get the link behind the details tab
```js
    jQuery.PRIMO.records[5].tabs.getByName('DetailsTab').find('a').attr('href');
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

###### function byQuery(query, options)

*query*: can be a string or an array 
*options*: can be one of
    - institution: your institution code defaults = view institution code
    - index: index to start returning from defaults = 1
    - bulkSize: amount of records to return. default = 10

### search for water
```js
    var result = jQuery.PRIMO.search.byQuery('any,contains,water');
```    

### search for water in title and pollution in subject return 100 records starting from position 10 on the result set.
```js
    var result = jQuery.PRIMO.search.byQuery(['title,contains,water', 'subject,contains,pollution'], {"index":10, "bulkSize":100});
```    

##**QUERY**<a name="query"></a>
Parses the URL and scrapes the **DOM** for data.

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

### Get search tab  (search scope)
```js
    jQuery.PRIMO.query.tab;
```    
           
### Get search sort 
```js
    jQuery.PRIMO.query.sorted_by;
```               
      
### Get query
This will return an _Array_ of _Object_ parsed from the URL not the DOM 
The Object contains the index, precision and term.
```js
    jQuery.PRIMO.query.query;
```      

contains

```json
    [
        {
         "index":"any",
         "precision":"contains",
         "term":"perceval"
        }
    ]
```
 
 
### Get query as text (like the xService syntax)
```js
    jQuery.PRIMO.query.query.toText();
```

returns 

```text
    (any contains perceval)
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

# Rendering HTML using templates<a name="templates"></a>

```js
    jQuery('body').append(jQuery.PRIMO.template.render('<div> Hello, {{who}}</div>', {who: 'world'}));
```
You can create templates using the script tag

```js
    <script type='text/template' id='helloWorld-tpl'>
        <div>Hello {{who}}</div>
    </script>
```
and use them in your javascript

```js    
    <script type='text/javascript'>
        jQuery('body').append(jQuery.PRIMO.template.renderById('helloWorld-tpl', {who: 'world'}));
    </script>    
```

### Print all titles using a template

Loop over all records and print title
```js
   <script type='text/template' id='allTitles-tpl'>
       <div id="allTitles">
            <ol>
                {{ for(var i=0;i<records.length;i++){ }}
                    <li>{{ records[i].title }}</li>
                {{ } }}
            </ol>       
       </div>
   </script> 
```

Render the allTitles template and append it to the body
```js
    <script type='text/javascript'>
        jQuery('body').append(jQuery.PRIMO.template.renderById('allTitles-tpl', {records: $.PRIMO.records}));
    </script>    
```

### Add a search tab to Google Scolar (for simple search)
###### Idea by Lukas Koster

Template to add extra Search Scope Tab
```js
<script type='text/template' id='searchTab-tpl'> 
    <li class="EXLSearchTab" id="{{id}}">
      <a href="{{href}}" title="{{description}}" target="{{target}}">
        <span>{{label}}</span>
      </a>
    </li>
</script>
```

Render the template using some variables 
```js   
<script type='text/javascript'>
    var query = jQuery.PRIMO.query.query.map(function(d){return d.term}).join(" ");
    var renderedTemplate = jQuery.PRIMO.template.renderById('searchTab-tpl',
                        {id: 'exlidTabGoogleScolar',
                        label: 'Google Scholar',
                        description: 'Perform search on Google Scholar',
                        href:'http://scholar.google.com/scholar?as_q=' + query,									
                        target:'_blank'});

    jQuery('#exlidSearchTabs').append(renderedTemplate);
</script>
```      
      
# **Events & Callbacks**<a name="events"></a>
!!This is experimental might change in the future.

#### tabReady CALLBACK
When a tab is done loading a tabReady callback is fired. You can attach a callback function to a tab that gets executed when the tab content is loaded.


Add the record id to the details tab when opened.
```js
    $.each($.PRIMO.records, function(i, record){
        record.tabs.getByName('DetailsTab')[0].onTabReady = function(record, container, tab){
            $($(container.tabUtils.tabContent).find('.EXLDetailsContent ul')[0]).prepend("<li><strong>Record id:</strong><span class='EXLDetailsDisplayVal'>" + record.id + "</span></li>");
        }
    });
```      
      
      
      
# Contributing to jQuery.PRIMO
- Fork the project.
- Create a new branch to implement your bugfixes or features
- Commit and push until you are happy with your contribution.
- Send a pull request.
      
# License
MIT (c) 2015 KULeuven/LIBIS written by Mehmet Celik