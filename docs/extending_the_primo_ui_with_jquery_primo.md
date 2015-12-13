# Extending the Primo UI with jQuery.PRIMO

You can extend or create Primo's UI in multiple ways. Not all of them are good some have a pretty high cost. Let me 
try to give you an overview.

## Creating a UI using
1. Primo xServices API's:
These are data API's, no they are not "RESTFul" but who cares as long as it gets the job done. You can use them to query for PNX records, e-shelf data, tags and reviews. You might be tempted to use them to create your UI but you would still be missing important context information like is my user on campus, is he logged in, what institution or view is associated to the users IP address, ... Not everything has a public API. You would not be able to support auto complete for example. These are good if you want to provide a search API for 3rd parties to use so they do not have to worry about the Primo lingo.

2. Modifying JSP pages:
You can only do this if you have shell access to your environment but even then this is a bad idea. Every upgrade will overwrite your changes and you have to reapply them and this can not be blindly done. ExLibris is changing JSP pages for a reason so you need to evaluate the impact on you code.    

3. View tile's:
The view tile system is a great way to get your content onto the Primo pages. But it is limited to the Home, Brief display and full display pages. You can upload your tiles using the File uploader in the Back Office but the file format is limited to HTML, CSS and Javascript. This is great but changing the user account pages for example with the tiling system is impossible.
  
4. Primo REST API's:
This is comparable to the xServices

5. Other shady ways:
I'm certainly missing others since in computer science the sky is only limited by your imagenation.

I think you understand by now that modifying Primo owned files on the server is not a a good way of doing things and that by only using the xServices or REST api's limits you to the data(PNX, facets, ...) but you actually need metadata to make decisions.

## Extending the UI instead of reinventing it.
We have to face it we all want the same thing. We want to integrate an of the shelf product into our environment that is missing that "important" feature we absolutely need. You heard/read that you can implement this with one of the above methods and that is fine but the most difficult part to forsee is the cost that comes with choosing one of the above methods. 

Lets back up and see what we need so we can implement new features. 
>    * session information
>    * access to displayed records, tabs, ...
>    * ability to upload HTML, CSS and Javascript files
>    * ability to inject the loaded Javascript files into Primo

The first 2 are missing from Primo's toolbox that is the gap that [jQuery.PRIMO]("http://www.github.com/mehmetc/jQuery.PRIMO") tries to fill. It gives you a Model that you can query by linking to existing functions hidden in the default Primo library and adding other useful functions. A Model in [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) of [MVVM](https://en.wikipedia.org/wiki/Model_View_ViewModel) patterns are mostly explained as structures that hold domain-specific data like user accounts (username, group, library, ...)
[Addy Osmani](http://addyosmani.com/) explains it as: 
>Models hold information, but typically don’t handle behaviour. They don’t format information or influence how data appears in the browser as this isn’t their responsibility. Instead, formatting of data is handled by the View, whilst behaviour is considered business logic that should be encapsulated in another layer that interacts with the Model – the ViewModel...

So, [jQuery.PRIMO]("http://www.github.com/mehmetc/jQuery.PRIMO") exposes domain-specific data (user, institution, view, ip, record(PNX, Marc), query, ...) that you can use to extend the Primo UI.

## Extending by exposing a Model
If we want to add new features we have to make decisions and to be able to do this we need data. The screen already contains a lot of usesfull data like the records, facets, the executed query, user name, login status, view code, ... we can extract these from functions that are already available in Primo or from the URL or by simply querying the DOM. Next to this we can use server side helpers in the form of JSP pages that can extract more data like the PNX record or the Original record from the  Primo Session Object. You can find an overview of the exposed model in the diagram below. The attributes and functions marked in italic are only available if the helper files can be loaded. So the helper files are not needed but do improve the amount of data considerably.

![jQuery.PRIMO Object Model](https://raw.githubusercontent.com/mehmetc/jQuery.PRIMO/master/docs/jquery.PRIMO.png "jQuery.PRIMO Object Model")
 
## No intallation required
Maybe you are still a bit sceptical if you want to experience the power of the model we can inject the library into your 
Primo environment. It will not be permament and only you will be able to use the model on the page you have open. 
And the best thing is reload the page and all is normal.   
### The requirements:
>   * This only works with Firefox. (Chrome blocks cross domain calls)
>   * You haven't changed the original element ID's or Class names in the JSP pages.      

### Injecting jQuery.PRIMO
>    * Start Firefox
>    * Goto your Primo
>    * Perform a search 
>    * Open the Javascript Console (Tools -> Web developer -> Web console)

Copy and paste the next command into the console. It will load jQuery.PRIMO into your current page. This means you need 
to redo the step if you refresh the page or move to an other page.

```js
jQuery.getScript('https://raw.githubusercontent.com/mehmetc/jQuery.PRIMO/master/dist/jqprimo/jquery.PRIMO.js');
```    

You will see some file not found errors the is normal since the library is trying to load the helper files.    
  

## Querying the Model
Accessing attributes and functions on the model is easy here are a couple of examples.

1) Getting all the record id's.
```js
    $.map($.PRIMO.records, function(data){return data.id});
```

The jQuery.PRIMO.records object is an array of DOM elements. The DOM elements get extended with id, index and title 
attributes, functions and a tabs Array.
 
2) Querying for the title of the 6th record.
```js
    jQuery.PRIMO.records[5].title;    
```

3) Querying for the material type of the first record
```js
    jQuery.PRIMO.records[0].getData().display.type;
``` 

I think you get the picture.

## Making something useful
Lets create a banner that will notify the user that he will get more results if he logs on.

```js
    if (!$.PRIMO.session.user.isLoggedIn()) {        
        $('body').prepend('<span id="myLoginMessage" style="display:block;top:0;background-color:orange;width:100%;text-align:center;">Please login for more results</span>');
    }
```

If the user is not logged in inject a html to the body element of the page asking the user to login.

## Conclusion
This is just the tip of the iceberg of what you can do with [jQuery.PRIMO]("http://www.github.com/mehmetc/jQuery.PRIMO"). Go checkout the project on [GitHub]("http://www.github.com/mehmetc/jQuery.PRIMO")

