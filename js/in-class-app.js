$(document).ready(function(){

  // Array to store all feed sources
  var SOURCES = [
    {
      displayName: "Reddit",
      url: "https://www.reddit.com/r/worldnews/top/.json",
      proxyRequired: false,
      defaultSource: true, // You can have only one default source
      formatResponse: function(response) {
        var items = response.data.children;
        return items.map(function(child) {
            return {
              title: child.data.title,
              author: child.data.author,
              score: child.data.score,
              link: child.data.url,
              thumbnail: child.data.thumbnail,
              tag: child.data.subreddit,
              description: child.data.domain
            };
        });
      }
    },
    {
      displayName: "Mashable",
      url: "http://mashable.com/stories.json",
      proxyRequired: true,
      defaultSource: false,
      formatResponse: null
    },
    {
      displayName: "Digg",
      url: "http://digg.com/api/news/popular.json",
      proxyRequired: true,
      defaultSource: false,
      formatResponse: null
    }
  ];

  // Prefix url for proxy
  var PROXY_URL = "https://accesscontrolalloworiginall.herokuapp.com/";

  // Utils object to store any misc. methods
  var Utils = {

  };

  // App object to store all app relates metods
  var App = {
    init: function() {
      // Methods that need to be called on initialization
      App.bindEvents();
      App.showDefauldFeed();
    },
    showDefauldFeed: function(){
      var defaultFeed = _.findWhere(SOURCES, { defaultSource: true});
      App.requestFeed(defaultFeed);
    },
    showFeed: function(source){
      var request = App.requestFeed(source){
        request.done(function(response){
          console.log(response);
        });
      }
    },
    requestFeed: function(source){
      App.setView('loader');
    return $.ajax( source.url,{
      dataType: 'json'

      });
    },
    bindEvents: function() {
      // Attach event listeners
    },
    setView: function(viewType) {
      var $popup = $('#popUp');
      var $closePopUp = $('.closePopUp');

      if (viewType === 'loader') {
        $popup.removeClass('hidden');
        $closePopUp.addClass('hidden');
        $popup.addClass('loader');
      }
      else if (viewType === 'detail') {
        $popup.removeClass('hidden');
        $closePopUp.removeClass('hidden');
        $popup.removeClass('loader');
      }
      else if (viewType === 'feed') {
        $popup.addClass('hidden');
        $closePopUp.addClass('hidden');
      }
    }
  };

  App.init();
});
