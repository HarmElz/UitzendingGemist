var Presenter = {
  defaultPresenter: function(xml) {
    if(this.loadingIndicatorVisible) {
      navigationDocument.replaceDocument(xml, this.loadingIndicator);
      this.loadingIndicatorVisible = false;
    } else {
      navigationDocument.pushDocument(xml);
    }
  },

  modalDialogPresenter: function(xml) {
    navigationDocument.presentModal(xml);
  },

  getVideoURL: function(token, id, callback){
    url = "http://ida.omroep.nl/app.php/" + id + "?adaptive=yes&token=" + token;
    UitzendingGemist.getJson(url, function(data){
    var items = data.items[0];
    info_url_a = '';
    info_url_h = '';
    info_url_l = '';
    for(var i=0;i < items.length; i++) {
      var item = items[i];
      if(item.url!=null) {
	if(item.label=='Adaptive') info_url_a = item.url;
        if(item.label=='Hoog') info_url_h = item.url;  
	if(item.label=='Live') info_url_l = item.url;
      }
    }

    if(info_url_l!='') {
	callback(info_url_l);
	return;
    }

    info_url = info_url_a;
    if(info_url_h!='') info_url = info_url_h;
    var spls = info_url.split('?');
    var info_url = spls[0];
    UitzendingGemist.getJson(info_url+'?extension=m3u8&type=json', function(data2){
	callback(data2.url);
    }, showAlert);
    }, showAlert)
  },

  menuBarItemPresenter: function(xml, element) {
    var feature = element.parentNode.getFeature("MenuBarDocument");
    if (feature) {
      var currentDoc = feature.getDocument(element);
      if (!currentDoc) {
        feature.setDocument(xml, element);
      }
    }
  },

  searchPresenter: function(xml, element) {
    this.menuBarItemPresenter.call(this, xml, element);
    var doc = xml;

    var searchField = doc.getElementsByTagName("searchField").item(0);
    var keyboard = searchField.getFeature("Keyboard");

    keyboard.onTextChange = function() {
      var searchText = keyboard.text;
      console.log('search text changed: ' + searchText);
      buildResults(doc, searchText);
    }
  },

  load: function(event) {
    var self = this,
    element = event.target,

    view = element.getAttribute("view")

    episodeID = element.getAttribute("episode")
    seriesID = element.getAttribute("series")
    channel = element.getAttribute("channel")
    hash = element.getAttribute("hash")

    switch(view) {
      case "live":
        resourceLoader.loadResource(resourceLoader.BASEURL + "templates/Live.xml.js",
          {},
          function(resource) {
            if (resource) {
              var doc = self.makeDocument(resource);
              doc.addEventListener("select", self.load.bind(self));
              self.menuBarItemPresenter.call(self, doc, element);
            }
          }
        )
      break
      case "popular":
        Episode.popular(function(episodes){
          resourceLoader.loadResource(resourceLoader.BASEURL + "templates/Popular.xml.js",
            episodes,
            function(resource) {
              if (resource) {
                var doc = self.makeDocument(resource);
                doc.addEventListener("select", self.load.bind(self));
                self.menuBarItemPresenter.call(self, doc, element);
              }
            }
          )
        }, showAlert)
      break
      case "recent":
        Episode.recent(function(episodes){
          resourceLoader.loadResource(resourceLoader.BASEURL + "templates/Recent.xml.js",
            episodes,
            function(resource) {
              if (resource) {
                var doc = self.makeDocument(resource);
                doc.addEventListener("select", self.load.bind(self));
                self.menuBarItemPresenter.call(self, doc, element);
              }
            }
          )
        }, showAlert)
      break
      case "search":
        resourceLoader.loadResource(resourceLoader.BASEURL + "templates/Search.xml.js",
          [],
          function(resource) {
            if (resource) {
              var doc = self.makeDocument(resource);
              doc.addEventListener("select", self.load.bind(self));
              self.searchPresenter.call(self, doc, element);
            }
          }
        )
      break
      case "episode":
        self.showLoadingIndicator();

        Episode.find(episodeID, seriesID, function(episode){
          resourceLoader.loadResource(resourceLoader.BASEURL + "templates/Episode.xml.js",
            episode,
            function(resource) {
              if (resource) {
                var doc = self.makeDocument(resource);
                doc.addEventListener("select", self.load.bind(self));
                self.defaultPresenter.call(self, doc);
              }
            }
          )
        }, showAlert)
      break
      case "video":
        var player = new Player();
        var playlist = new Playlist();

        self.getVideoURL(npoplayer.token, episodeID, function(url){
          var mediaItem = new MediaItem("video", url);

          player.playlist = playlist;
          player.playlist.push(mediaItem);
          player.present();
        })
      break
      case "liveVideo":
        var meta_url = 'http://npo.nl/live/npo-'+channel;
        request = new XMLHttpRequest()
        request.open("GET", meta_url);
        request.addEventListener("load", function(){
          var ep = request.responseText.indexOf('video-player-container');
          var eq = request.responseText.indexOf('>', ep);
	        var eps = request.responseText.substring(ep, eq);
	        var fp = eps.indexOf('data-prid="');
	        var fq = eps.indexOf('"', fp+11);
	        var meta = eps.substring(fp+11, fq);

	        var player = new Player();
          var playlist = new Playlist();

          self.getVideoURL(npoplayer.token, meta, function(url){
            request = new XMLHttpRequest()
            request.open("GET", url);
            request.addEventListener("load", function(){
	            var end = request.responseText.lastIndexOf('")');
              var begin = request.responseText.indexOf('("');
              var urlx = request.responseText.substring(begin+2, end).replace(/\\/g, '');
	            var mediaItem = new MediaItem("video", urlx);

              player.playlist = playlist;
              player.playlist.push(mediaItem);
              player.present();
	          });
	          request.send();
          });
	      });
        request.send();
      break
    }
  },

  makeDocument: function(resource) {
    if (!Presenter.parser) {
      Presenter.parser = new DOMParser();
    }

    var doc = Presenter.parser.parseFromString(resource, "application/xml");
    return doc;
  },

  showLoadingIndicator: function() {
    if (!this.loadingIndicator) {
      this.loadingIndicator = this.makeDocument(this.loadingTemplate);
    }

    if (!this.loadingIndicatorVisible) {
      navigationDocument.pushDocument(this.loadingIndicator);
      this.loadingIndicatorVisible = true;
    }
  },

  removeLoadingIndicator: function() {
    if (this.loadingIndicatorVisible) {
      navigationDocument.removeDocument(this.loadingIndicator);
      this.loadingIndicatorVisible = false;
    }
  },

  loadingTemplate: `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
      <loadingTemplate>
        <activityIndicator>
          <text>Loading...</text>
        </activityIndicator>
      </loadingTemplate>
    </document>`
}
