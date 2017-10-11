

$(document).ready(function(){
  var SOURCES = [
    {
      displayName: "Restaurants",
      url: "https://developers.zomato.com/api/v2.1/geocode?lat=40.7128&lon=-74.0059",
      proxyRequired: false,
      defaultSource: true,
      beforeSend:  function(request) {
        request.setRequestHeader("user-key", '0d02b4f623ae2bfbde60b7fbb65e3b97');
      },
      formatResponse: function(response) {
        console.log(response);
        var items = response.nearby_restaurants;
        return items.map(function(child) {
            return {
              title: child.restaurant.name,
              score: child.restaurant.user_rating.aggregate_rating,
              link: child.restaurant.url,
              tag: child.restaurant.cuisines,
              description: '',
              thumbnail: child.restaurant.thumb,
              address: child.restaurant.location.address,
              lat: child.restaurant.location.latitude,
              lon: child.restaurant.location.longitude
            };
        });
      }
    },
    {
      displayName: "Recipes",
      url: "http://www.recipepuppy.com/api/",
      proxyRequired: true,
      defaultSource: false,
      beforeSend: function(){},
      formatResponse: function(response) {
        var items = response.results;
        return items.map(function(child) {
            return {
              title: child.title,
              score: '',
              link: child.href,
              tag: '',
              description: child.ingredients,
              thumbnail: child.thumbnail,
              address: ''
            };
        });
      }
    }
  ];
  // Prefix url for proxy
  var PROXY_URL = "https://accesscontrolalloworiginall.herokuapp.com/";
  var Utils = {
    markupFromArticles: function(articles) {
      return _.map(articles, function(article) {
        return Utils.markupFromSingleArticle(article);
      }).join('');
    },
    markupFromSingleArticle: function(article) {
      return Utils.articleTemplate(article);
    },
    articleTemplate: _.template('<article class="article clearfix" data-desc="<%= description %>" data-address="<%= address %>">' +
      '<section class="featuredImage">' +
        '<img src="<%= thumbnail %>" alt="">' +
      '</section>' +
      '<section class="articleContent">' +
        '<a href=<%= link %> ><h3><%= title %></h3></a>' +
        '<h6><%= tag %></h6>' +
      '</section>' +
      '<section class="impressions"><%= score %></section>' +
    '</article>')
  };


  var App = {
    init: function() {
      App.bindEvents();
      App.populateDropdown();
      App.showDefaultFeed();

    },

    showDefaultFeed: function() {
      var defaultFeed = _.findWhere(SOURCES, { defaultSource: true });
      App.showFeed(defaultFeed);
      $(".source-name").text(defaultFeed.displayName);
    },

    currentArticles: [],
    showFeed: function(source) {
      var request = App.requestFeed(source);
      request.done(function(response) {
        var currentArticles = source.formatResponse(response);
        App.currentArticles = currentArticles;
        App.renderArticles(currentArticles);
      });
    },

    requestFeed: function(source){
      var url = source.proxyRequired ? PROXY_URL + source.url : source.url;
      App.setView('loader');
      console.log('source.beforeSend',source.beforeSend)
      return $.ajax(url, {
        //dataType: 'json',
        beforeSend: source.beforeSend,
      });
    },

    renderArticles: function(articles) {
      App.setView('feed');
      var articlesHTML = Utils.markupFromArticles(articles);
      $("#main").html(articlesHTML);
    },

    populateDropdown: function() {
      _.each(SOURCES, function(source) {
        $(".sources-dropdown").append('<li><a href="#">' + source.displayName + '</a></li>');
      });
    },

    map:null,
    initMap: function(article){
      App.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: new google.maps.LatLng(article.lat,article.lon),
      mapTypeId:'terrain'
    });
  },

  addMarker: function(article){
    var latLng = new google.maps.LatLng(article.lat,article.lon);
    var marker = new google.maps.Marker({
      position: latLng,
      map: App.map,
    });
  },


    bindEvents: function() {
      $(".sources-dropdown").on("click", "li", function() {
        var $liItem = $(this);
        var index = $liItem.index();
        var feedObject = SOURCES[index];
        App.showFeed(feedObject);
        $(".source-name").text($(this).text());
      });
      $("section").on("click", ".article", function(event) {
        event.preventDefault();
        App.setView('detail');
        var title = $(this).find('h3').text();
        var description = $(this).attr('data-desc');
        var address = $(this).attr('data-address');
        var link = $(this).find('a')[0].href;

        var lat = $(this).data('lat');
        var log = $(this).data('lon');
        var index = $(this).index();
        var article = App.currentArticles[index];

        $("#popUp h1").text(title);
        $("#popUp p#desc").text(description);
        $("#popUp p#address").text(address);
        $(".popUpAction").attr("href", link);

        if(address.length > 0){
          App.showMap();
          App.initMap(article);
          App.addMarker(article);
        } else {
          App.hideMap();
        }
      });


      $(".closePopUp").on("click", function() {
        App.setView('feed');
      });

      $("#main").hide();
      $(".sources-dropdown").on("click",function(){
        $("#main").show();
      });

      $( "#myInput" ).on('keyup', function(){
        var text_to_match = $(this).val().toLowerCase();

        var filtered_articles = App.currentArticles.filter(function(article){
        var title = article.title.toLowerCase();
        var exists_in_text = (title.indexOf(text_to_match) > -1);

        return exists_in_text;
        });
        App.renderArticles(filtered_articles);
      });

    },


    showMap:function(){
      $('#map').removeClass('hidden');
    },
    hideMap:function(){
      $('#map').addClass('hidden');
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
