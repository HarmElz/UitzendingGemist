var UitzendingGemist = {
  Broadcast: {
    recent: function(callback, errorCallback){
      UitzendingGemist.get(
        "http://apps-api.uitzendinggemist.nl/broadcasts/recent.json",
        callback, errorCallback
      )
    },
  },

  Episode: {
    popular: function(callback, errorCallback){
      UitzendingGemist.get(
        "http://apps-api.uitzendinggemist.nl/episodes/popular.json",
        callback, errorCallback
      )
    },

    search: function(query, callback, errorCallback){
      UitzendingGemist.get(
        "http://apps-api.uitzendinggemist.nl/episodes/search/" + encodeURIComponent(query) + ".json",
        callback, errorCallback
      )
    },
  },

  Series: {
    find: function(id, callback, errorCallback){
      UitzendingGemist.get(
        "http://apps-api.uitzendinggemist.nl/series/" + id + ".json",
        callback, errorCallback
      )
    }
  },

  get: function(url, callback, errorCallback){
    request = new XMLHttpRequest()
    request.open("GET", url);
    request.addEventListener("load", function(){
      try {
        callback(JSON.parse(request.responseText))
      } catch(error){
        errorCallback(error)
      }
    });
    request.send()
  },

getJson: function(url, successHandler, errorHandler) {
	var xhr = new XMLHttpRequest();
	xhr.open('get', url, true);
	xhr.onreadystatechange = function() {
	var status;
	var data;
	if (xhr.readyState == 4) { // `DONE`
			status = xhr.status;
			if (status == 200) {
				data = JSON.parse(xhr.responseText);
				successHandler && successHandler(data);
			} else {
				errorHandler && errorHandler(status);
			}
		}
	};
	xhr.send();
}

}

