if (window.location.protocol != "https:")
  window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);

function Base () {
  var me = this;

  this.instances = {};
  this.updateInstances = null;
  this.managesCookies = null;

  this.redirect = function (url) {
    if (!url) {
      window.location.href = me.generateURL();
    } else {
      window.location.href = url;
    }
  };

  this.makeRequest = function (url, method, data, callback, unencoded) {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (callback) {
          callback(this.responseText);
        }
      }
    };

    if (data) {
      var object_string = "";
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          if (unencoded) {
            object_string += key.toString() + "=" + data[key] + "&";
          } else {
            object_string += key.toString() + "=" + encodeURI(btoa(data[key].toString())) + "&";
          }
        }
      }

      object_string = object_string.slice(0, -1);

      request.send(object_string);
    } else {
      request.send();
    }
  };

  this.getSnippet = function (name, callback) {
    me.makeRequest("raw/snippets/" + name, "GET", null, callback);
  };

  this.randomID = function () {
    return (Math.random() * (99999999 - 10000000) + 10000000).toString().replace(".", "").slice(0, 8);
  };

  this.reload = function () {
    window.location.href = window.location;
  };

  this.init = function () {
    me.actions.navigation.selectActivePage();
  };
}

var base = new Base();

$(document).ready(function () {
  base.init();
});