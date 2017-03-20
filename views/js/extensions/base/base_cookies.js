// class to read and write a cookie
var Cookie = function cookie (cookieName, value, expirationTime) {
  var me = this;

  this.name = cookieName;
  this.value = value;
  this.expirationTime = expirationTime;
  this.separator = "| |";
  this.equals = ":is:";

  this.write = function write () {
    document.cookie = this.name + "=" + this.value + ';expires='+this.expirationTime+';path=/';
  };

  this.read = function read () {
    if (document.cookie.indexOf(this.name) != -1) {
      var cookie = document.cookie.slice(document.cookie.indexOf(this.name) + this.name.length + 1, document.cookie.length);
      if (cookie === "" || cookie === null) {
        return false;
      } else if (cookie.indexOf(";") == -1) {
        if (cookie === "") {
          return false;
        }
        return cookie;
      } else {
        var slicedCookie = cookie.slice(0, cookie.indexOf(";"));
        if (slicedCookie === "") {
          return false;
        }
        return slicedCookie;
      }
    } else {
      return false;
    }
  };

  this.remove = function remove () {
    document.cookie = this.name + '=;expires=;path=/';
  };
};

// class to organize multiple cookies
var CookieHandler = function CookieHandler () {
  var me = this;
  this.cookies = [];
  this.expirationTime = null;

  this.cookie = function cookie (name) {
    for (var i = 0; i < me.cookies.length; i++) {
      if (me.cookies[i].name == name) {
        return me.cookies[i];
      }
    }

    return false;
  };

  this.addCookie = function addCookie (name, value, expirationTime) {
    if (!expirationTime) {
      expirationTime = me.expirationTime;
    }

    if (!me.cookie(name)) {
      var cookie = new Cookie(name, value, expirationTime);
      me.cookies.push(cookie);
      return cookie;
    } else {
      me.cookie(name).name = name;
      me.cookie(name).value = value;
      me.cookie(name).expirationTime = expirationTime;
      return me.cookie(name);
    }
  };

  this.readMultipleValueCookie = function (cookieName) {
    if (me.cookie(cookieName).read()) {
      var cookie = me.cookie(cookieName);
      var content = cookie.read().split(cookie.separator);
      var output = {};

      for (var i = 0; i < content.length; i++) {
        if (content[i] !== null && content[i] !== "") {
          var pair = content[i].split(cookie.equals);
          output[pair[0]] = pair[1];
        }
      }

      return output;
    }

    return false;
  };

  this.writeMultipleValueCookie = function (cookieName, object) {
    var cookie = me.cookie(cookieName);

    var input = "";
    for (var key in object) {
      if (!object.hasOwnProperty(key)) continue;
      if (object[key] !== null) {
        input += key + cookie.equals + object[key] + cookie.separator;
      }
    }

    cookie.value = input;
    cookie.write();
  };

  this.deleteAllCookies = function () {
    for (var i = 0; i < me.cookies.length; i++) {
      me.cookies[i].remove();
    }
  };
};

base.managesCookies = new CookieHandler();