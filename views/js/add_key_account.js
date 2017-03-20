function AddProject () {
  var me = this;

  this.activateCreateButton = function () {
    base.instances.$addKeyAccount.$btn.onclick = function () {
      base.instances.$addKeyAccount.$btn.onclick = null;
      base.actions.title.titleIsLoader();

      base.makeRequest("../api/add_key_account.php", "POST", {
          name : base.instances.$addKeyAccount.$name.value,
          description : base.instances.$addKeyAccount.$description.value
        }, function (response) {
          response = JSON.parse(response);
          if (response.type == "path") {
            base.redirect("detail.php?name=" + response.text);
          } else {
            base.actions.title.titleIsError(response.text);
            me.activateCreateButton();
          }
        }
      );
    };
  };

  this.init = function () {
    me.activateCreateButton();
  };
}

var view = new AddProject();

$(document).ready(function () {
  view.init();
});