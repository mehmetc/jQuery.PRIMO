jQuery.PRIMO
============

A client side convenience library for PRIMO v4.6 or better.


Installation  (TODO)
------------
You can inject the script into your results page, for testing. This works best using Firefox.
Do a search and open the JavaScript console and paste the next line.

    `$.getScript('https://raw.githubusercontent.com/mehmetc/jQuery.PRIMO/master/dist/jquery.PRIMO.js')`

If you get strange errors just copy the complete source into your console.    
    
If want a more permanent solution: 
- Use the 'File Uploader' on the backend to copy `dist/jquery.PRIMO.min.js` to your PRIMO server.     
- Add a custom tile to the end of your customized layout set using the 'Views Wizard'. Do this for the 3 pages(home, brief, full).
  The content of the custom tile must include
    <script type='text/javascript' src='/primo_library/libweb/uploaded_files/YOUR_VID/jquery.PRIMO.min.js'></script>
  Change YOUR_VID into the VID you selected in the 'File Uploader'

Compilation  (TODO)
-----------
- Install [npm](http://nodejs.org/) and [gulp](http://gulpjs.com/)
- `npm install`
- `gulp`




##Examples  
  
###Read the current sessions user id
```js
    jQuery.LIMO.session.user.id;    
```

###Read the current session user name
```js
    jQuery.LIMO.session.user.name;            
```

###Check if the current user is logged in
```js
    jQuery.LIMO.session.user.isLoggedIn();    
```

###Get the current view code
```js
    jQuery.LIMO.session.view.name;
```

###Is the current view in full display mode
```js
    jQuery.LIMO.session.view.isFullDisplay();    
```

###Get the record id of the 6th field
```js
    jQuery.LIMO.records[5].id;    
```

###Get the PNX data as text of the 6th record
```js
    jQuery.LIMO.records[5].getPNX('text');    
```

###Get the material type of the first record
```js
    jQuery.LIMO.records[0].getData().display.type
```

###Highlight all journals on screen
```js
      jQuery.LIMO.records.each(
        function(){ 
            if (this.getData().display.type === 'journal') {
                this.css('background-color', 'yellow')
            } 
        }
      ); 
```

###Make the 'View Online' tab popout
```js
    jQuery.LIMO.records.each(
        function(index, record){
            var view_online = record.tabs.getByName('viewOnline');
            try{
                view_online.attr('target', '_blank').attr('href', record.getIt1);                          
            } catch (e) {
                console.log('Error setting url');
            }
            
        }
    );    
```

###Add a new tab to all records
```js
      jQuery.LIMO.records.each(
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
        };
      );
```      
      
### Add a new share tab and make the sendTo tab appear.
```js
    jQuery.LIMO.records.each(
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