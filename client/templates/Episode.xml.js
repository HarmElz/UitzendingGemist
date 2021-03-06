var Template = function(episode) {
  function shelf(){
    if(episode.series.episodes.length > 0) {
      return `<shelf>
      <header>
        <title>Meer “${episode.series.name}”</title>
      </header>
      <section>
        ` + episodeLockups(episode.series.episodes, episode.series) + `
      </section>
    </shelf>`
    }
  }

  function episodeLockups(episodes, series) {
    output = ``

    for(i=0; i<episodes.length; i++){
      episode = episodes[i]

      output += `<lockup view="episode" episode="${episode.id}" series="${series.id}">
        <img src="${episode.image ? episode.image : resourceLoader.BASEURL + 'images/static.gif'}" width="308" height="174"/>
        <title class="marqueeOnHighlight">${episode.name}</title>
        <subtitle>${episode.broadcasted_at}</subtitle>
      </lockup>`
    }

    return output
  }

  return `<?xml version="1.0" encoding="UTF-8" ?>
  <document>
  <head>
    <style>
      .marqueeOnHighlight {
        tv-text-highlight-style: marquee-on-highlight;
      }
    </style>
  </head>
    <productTemplate>
      <banner>
        <heroImg src="${episode.image ? episode.image : resourceLoader.BASEURL + 'images/static.gif'}" />
        <infoList>
          <info>
          <header>
          </header>
            <text>${episode.broadcasters}</text>
            <text>${episode.genres}</text>
            <text>${episode.duration} minuten</text>
          </info>
        </infoList>
        <stack>
          <title>${episode.series.name}</title>
          <row>
            <text>${episode.name}</text>
            <text>${episode.broadcasted_at}</text>
          </row>
          <description allowsZooming="true">${episode.description}</description>
          <row>
            <buttonLockup view="video" episode="${episode.id}">
              <badge src="resource://button-play" />
            </buttonLockup>
          </row>
        </stack>
      </banner>
      ` + shelf() + `
    </productTemplate>
  </document>`
}
