var SimpleCountdown = function SimpleCountdown (destination, settings) {
  var me = this;
  this.destination = destination;

  this.extend = function(destination, source) {
    for (var property in source) {
      if (source[property] && source[property].constructor && source[property].constructor === Object) {
        destination[property] = destination[property] || {};
        arguments.callee(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
    return destination;
  };

  this.settings = {
    timeLocation : "../resource/api/time.php",
    title : "Time until" + me.destination,
    dueTitle : "Starts " + me.destination,
    endedTitle : "Time is up!",
    defaultParent : document.body,
    parentType : "append",
    showWords : false,
    reloadPageHint : "The campaign has started! Reload the page to get access to this product!",
    language : "english",
    startDate : new Date(),
    current : new Date(),
    countDownID : Math.random().toString().replace(".", "").slice(0, 8)
  };

  this.extend(this.settings, settings);

  this.countdownBegins = this.settings.current > this.settings.startDate;

  this.days = null;
  this.hours = null;
  this.minutes = null;
  this.seconds = null;

  this.domElement = null;
  this.domContainer = null;

  this.returnAsString = function returnAsString(t){
    var cd = 24 * 60 * 60 * 1000,
      ch = 60 * 60 * 1000,
      cm = 60000,
      d = Math.floor(t / cd),
      h = Math.floor( (t - d * cd) / ch),
      m = Math.floor( (t - d * cd - h * ch) / 60000),
      s = Math.floor( (t - d * cd - h * ch - m * cm) / 1000),
      pad = function(n){ return n < 10 ? '0' + n : n; };
    if( m === 60 ){
      h++;
      m = 0;
    }
    if( h === 24 ){
      d++;
      h = 0;
    }
    if (me.settings.showWords) {
      return [d, me.days, pad(h), me.hours, pad(m), me.minutes, pad(s), me.seconds].join(' ');
    } else {
      return [d, pad(h), pad(m), pad(s)].join(' ');
    }
  };
  
  this.createAsDOMElement = function () {
    me.countDownContainer = document.createElement("div");
    me.countdown = document.createElement("div");
    me.title = document.createElement("div");

    me.countDownContainer.id = "bsi-countdown-container-" + me.settings.countDownID;
    me.countdown.id = "bsi-countdown-" + me.settings.countDownID;
    me.title.id = "bsi-countdown-" + me.settings.countDownID + "-title";

    me.countdown.className = "bsi-countdown";

    if (me.countdownBegins) {
      me.countdown.innerHTML = me.returnAsString(me.destination - me.settings.current);
      me.title.className = "bold value bsi-limitation-title bsi-limitation-title-active";
      me.title.innerHTML = me.settings.title;
    } else {
      me.countdown.innerHTML = me.returnAsString(me.settings.startDate - me.settings.current);
      me.title.className = "bold value bsi-limitation-title bsi-limitation-title-inactive";
      me.title.innerHTML = me.settings.dueTitle;
    }

    me.countDownContainer.appendChild(me.title);
    me.countDownContainer.appendChild(me.countdown);

    if (me.countdownBegins) {
      me.countDownContainer.className = "bsi-countdown-container bsi-countdown-active";
    } else {
      me.countDownContainer.className = "bsi-countdown-container bsi-countdown-inactive";
    }

    if (me.settings.showWords) {
      if (me.settings.language == "english") {
        me.days = "<label class='bsi-countdown-label'>day(s)</label>";
        me.hours = "<label class='bsi-countdown-label'>hour(s)</label><br>";
        me.minutes = "<label class='bsi-countdown-label'>minute(s)</label>";
        me.seconds = "<label class='bsi-countdown-label'>second(s)</label>";
      } else if (me.settings.language == "german") {
        me.days = "<label class='bsi-countdown-label'>Tage(n)</label>";
        me.hours = "<label class='bsi-countdown-label'>Stunde(n)</label><br>";
        me.minutes = "<label class='bsi-countdown-label'>Minute(n)</label>";
        me.seconds = "<label class='bsi-countdown-label'>Sekunde(n)</label>";
      } else if (me.settings.language == "french") {
        me.days = "<label class='bsi-countdown-label'>journi&eacute;e(s)</label>";
        me.hours = "<label class='bsi-countdown-label'>heure(s)</label><br>";
        me.minutes = "<label class='bsi-countdown-label'>minute(s)</label>";
        me.seconds = "<label class='bsi-countdown-label'>seconde(s)</label>";
      }
    }

    if (!me.settings.defaultParent || me.settings.defaultParent == document.body) {
      me.settings.defaultParent.insertBefore(me.countDownContainer, document.body.firstChild);
    } else {
      if (me.parentType == "append") {
        me.settings.defaultParent.appendChild(me.countDownContainer);
      } else {
        me.settings.defaultParent.insertBefore(me.countDownContainer, me.settings.defaultParent.firstChild);
      }
    }
    
    me.titleElement = document.getElementById(me.title.id);
    me.domElement = document.getElementById(me.countdown.id);
    me.domContainer = document.getElementById(me.countDownContainer.id);
    
    me.domElement.innerHTML = me.returnAsString(me.destination - me.settings.current);
    
    me.updateTimer();
    me.update = setInterval(me.updateTimer, 1000);
  };

  this.updateTimer = function () {
    try {
      me.settings.current.setSeconds(me.settings.current.getSeconds() + 1);
      me.titleElement = document.getElementById(me.title.id);
      me.domElement = document.getElementById(me.countdown.id);
      me.domContainer = document.getElementById(me.countDownContainer.id);

      if (me.countdownBegins) {
        me.domElement.innerHTML = me.returnAsString(me.destination - me.settings.current);
        if (me.settings.current > me.destination) {
          me.domElement.innerHTML = me.settings.endedTitle;
          me.titleElement.remove();
          clearInterval(me.update);
        }
      } else {
        if (me.settings.current > me.settings.startDate) {
          me.domElement.innerHTML = me.settings.reloadPageHint;
          me.titleElement.remove();
          clearInterval(me.update);
        } else {
          me.domElement.innerHTML = me.returnAsString(me.settings.startDate - me.settings.current);
        }
      }
    } catch (e) {
      clearInterval(me.update);
      console.log(e);
    }
  };

  $.get(me.settings.timeLocation, function (currentTime) {
    me.settings.current = new Date(currentTime);
    me.createAsDOMElement();
  });
};
