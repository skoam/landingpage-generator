base.actions = {
  manipulation : {
    removeClass : function (id, className, replacement) {
      if (!replacement) {
        replacement = "";
      }

      element = document.getElementById(id);
      element.className = element.className.replace(className, replacement);
      element.className = element.className.trim();
    },
    addClass : function (id, className) {
      element = document.getElementById(id);
      element.className += " " + className;
    },
    getNumberFromString : function (string) {
      return string.replace(/^\D+/g, '');
    },
    getLastNumberFromString : function (string) {
      var output = string.slice(-1);
      return output.replace(/^\D+/g, '');
    },
    utf8_to_b64 : function (string) {
      return window.btoa(unescape(encodeURIComponent(string)));
    },
    b64_to_utf8 : function (string) {
      return decodeURIComponent(escape(window.atob(string)));
    }
  },
  query : {
    hasClass : function (id, className) {
      return document.getElementById(id).className.indexOf(className) != -1;
    }
  },
  effects : {
    highlightById : function (id, color, length) {
      console.log(id);
      color = color || "white";
      length = length || 1000;
      $("#" + id).effect("highlight", { color : color }, length);
    }
  },
  title : {
    titleIsLoader : function () {
      var cog_spinner = document.createElement("i");
      cog_spinner.className = "fa fa-cog fa-spin";
      base.instances.$navigation.$title.innerHTML = "";
      base.instances.$navigation.$title.appendChild(cog_spinner);
    },
    titleIsOriginal : function () {
      base.instances.$navigation.$title.innerHTML = base.originalTitle;
    },
    titleIsError : function (error) {
      base.instances.$navigation.$title.className = base.instances.$navigation.$title.className + " error";
      base.instances.$navigation.$title.innerHTML = error;
    }
  },
  navigation : {
    selectActivePage : function () {
      if (!base.instances.$navigation.$viewName) {
        console.log("Cannot find name for current view. Please add a <div> with the id instance-view-name and the id of your navigation entry as content to your html file.");
        return;
      }
      var pages = base.instances.$navigation.$list.childNodes;
      for (var i = 0; i < pages.length; i++) {
        if (pages[i].id == base.instances.$navigation.$viewName.textContent) {
          pages[i].className = "active";
        }
      }
    }
  }
};