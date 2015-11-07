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
    first = -1
    last = -1

    for(i=0; i<token.length;i++) {
      if(i > 4 && i < token.length - 4){
        if(!isNaN(token[i])) {
          if(first < 0) {
            first = i
          } else if(last < 0){
            last = i
          }
        }
      }
    }

    splits = token.split('')
    firstValue = splits[first]
    lastValue = splits[last]
    splits[first] = lastValue
    splits[last] = firstValue

    url = "http://ida.omroep.nl/odi/?prid=" + id + "&puboptions=adaptive&adaptive=yes&part=1&token=" + splits.join('')

    UitzendingGemist.get(url, function(data){
      stream_url = data['streams'][0].split('&')[0]

      UitzendingGemist.get(stream_url, function(data){
        callback(data['url'])
      })
    })
  },

  load: function(event) {
    var self = this,
    element = event.target,
    templateURL = element.getAttribute("template")
    episodeID = element.getAttribute("episode")

    if (templateURL) {
      self.showLoadingIndicator();

      UitzendingGemist.Episode.find(episodeID, function(episode){
        resourceLoader.loadResource(templateURL,
          episode,
          function(resource) {
            if (resource) {
              var doc = self.makeDocument(resource);
              doc.addEventListener("select", self.load.bind(self));
              self.defaultPresenter.call(self, doc);
            }
          }
        )
      })
    } else if (episodeID) {
      var player = new Player();
      var playlist = new Playlist();

      self.getVideoURL(npoplayer.token, episodeID, function(url){
        var mediaItem = new MediaItem("video", url);

        player.playlist = playlist;
        player.playlist.push(mediaItem);
        player.present();
      })
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