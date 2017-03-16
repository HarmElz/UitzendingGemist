var resourceLoader;

npoplayer = {};

var TimerID;

function updateToken() {
  var templateXHR = new XMLHttpRequest();
   templateXHR.responseType = "document";
   templateXHR.addEventListener("load", function() {parseJsonToken(templateXHR.responseText);}, false);
   templateXHR.open("GET", 'http://ida.omroep.nl/app.php/auth', true);
   templateXHR.send();
}

function parseJsonToken(information) {
   var result = JSON.parse(information);
   npoplayer.token = result.token;
}

App.onLaunch = function(options) {
  var javascriptFiles = [
    `${options.BASEURL}js/ResourceLoader.js`,
    `${options.BASEURL}js/Presenter.js`,
    `${options.BASEURL}js/uitzendinggemist.js`,
    `${options.BASEURL}js/Series.js`,
    `${options.BASEURL}js/Episode.js`
  ];
  updateToken();

  evaluateScripts(javascriptFiles, function(success) {
    if (success) {
      resourceLoader = new ResourceLoader(options.BASEURL);
      resourceLoader.loadResource(
        `${options.BASEURL}templates/MenuBar.xml.js`,
        null,
        function(resource) {
          var doc = Presenter.makeDocument(resource);
          doc.addEventListener("select", Presenter.load.bind(Presenter));
          navigationDocument.pushDocument(doc);
        }
      )
    } else {
      var alert = createAlert("Evaluate Scripts Error", "There was an error attempting to evaluate the external JavaScript files.\n\n Please check your network connection and try again later.");
            navigationDocument.presentModal(alert);
      throw ("Unable to evaluate scripts.");
    }
  });
}

App.onResume = function (options) {
  updateToken();
  TimerID = setInterval(updateToken, 7200000);
}

App.onSuspend = function (options) {
  clearInterval(TimerID);
}

var showAlert = function(error) {
  var alert = createAlert(error.name, error.message);
  Presenter.removeLoadingIndicator();
  navigationDocument.presentModal(alert);
}

var createAlert = function(title, description) {

  var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
    <alertTemplate>
      <title>${title}</title>
      <description>${description}</description>
    </alertTemplate>
    </document>`

  var parser = new DOMParser();

  var alertDoc = parser.parseFromString(alertString, "application/xml");

  return alertDoc
}

var buildResults = function(doc, searchText) {
  var domImplementation = doc.implementation;
  var lsParser = domImplementation.createLSParser(1, null);
  var lsInput = domImplementation.createLSInput();

  lsInput.stringData = `<list>
    <section>
      <header>
        <title>Geen resultaten</title>
      </header>
    </section>
  </list>`;

  Episode.search(searchText, function(episodes){
    if (episodes.length > 0) {
      lsInput.stringData = `<grid>
        <header>
          <title>Zoekresultaten voor “` + searchText + `”</title>
        </header>
      <section>`;

      for (var i = 0; i < episodes.length; i++) {
        episode = episodes[i]
        lsInput.stringData += `<lockup view="episode" episode="${episode.id}" series="${episode.series.id}">
          <img src="${episode.image ? episode.image : resourceLoader.BASEURL + 'images/static.gif'}" width="308" height="174"/>
          <title>${episode.series.name}</title>
          <subtitle class="marqueeOnHighlight">${episode.label}</subtitle>
        </lockup>`;
      }
      lsInput.stringData += `</section></grid>`;
    }

    lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2);
  }, showAlert)
}

var htmlEntities = function(string) {
  return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
