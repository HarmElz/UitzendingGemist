var resourceLoader;

App.onLaunch = function(options) {
  var javascriptFiles = [
    `${options.BASEURL}js/ResourceLoader.js`,
    `${options.BASEURL}js/Presenter.js`,
    `${options.BASEURL}js/uitzendinggemist.js`,
  ];

  evaluateScripts(javascriptFiles, function(success) {
    if (success) {
      resourceLoader = new ResourceLoader(options.BASEURL);

      UitzendingGemist.Episode.popular(function(episodes){
        var index = resourceLoader.loadResource(
          `${options.BASEURL}templates/Index.xml.js`,
          episodes,
          function(resource) {
            var doc = Presenter.makeDocument(resource);
            doc.addEventListener("select", Presenter.load.bind(Presenter));
            navigationDocument.pushDocument(doc);
          }
        );
      })
    } else {
      throw ("Unable to evaluate scripts.");
    }
  });
}
