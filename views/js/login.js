function Login () {
  var me = this;

  this.activateLoginButton = function () {
    base.instances.$login.$btn.onclick = function () {
      base.instances.$login.$btn.onclick = null;
      base.actions.title.titleIsLoader();

      base.makeRequest("../api/get_session.php", "POST", {
          key : base.instances.$login.$pwd.value
        }, function (response) {
          response = JSON.parse(response);
          if (response.type == "session") {
            base.redirect("overview.php");
          } else {
            base.actions.title.titleIsError(response.text);
            me.activateLoginButton();
          }
        }
      );
    };

    base.instances.$login.$pwd.onchange = base.instances.$login.$btn.onclick;
  };

  this.init = function () {
    me.activateLoginButton();
  };
}

var view = new Login();

$(document).ready(function () {
  view.init();
});