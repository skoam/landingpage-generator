function DetailView () {
  this.name = "detail_view";
  var me = this;

  this.activateDeleteButton = function () {
    base.instances.$detail.$delete_account.onclick = function () {
      var cancel = base.instances.$detail.$cancel_delete_account;
      cancel.className = cancel.className.replace("hidden", "");
      var hint = base.instances.$detail.$delete_account_hint;
      hint.className = hint.className.replace("hidden", "");
      var button = base.instances.$detail.$delete_account;
      button.className = button.className.replace("btn-warning", "btn-danger");
      base.actions.effects.highlightById(button.id, "coral", 600);

      button.onclick = function () {
        button.innerHTML = "Confirm Delete";
        button.className = button.className.replace("btn-danger", "btn-success");
        base.actions.effects.highlightById(button.id, "limegreen", 600);
        button.onclick = function () {
          // delete Account
          base.makeRequest("../api/delete_account.php", "POST", {
              name : base.instances.$various.$projectName.innerHTML
            }, function (response) {
              response = JSON.parse(response);
              if (response.type == "success") {
                base.redirect("overview.php");
              } else {
                base.actions.title.titleIsError(response.text);
                me.activateCreateButton();
              }
            }
          );
        };
      };
    };
  };

  this.activateChangeProfileImage = function () {
    base.instances.$detail.$accountImage.onclick = function () {
      base.instances.$detail.$changeProfileImage.click();
    };
  };

  this.activateCancelAccountDelete = function () {
    base.instances.$detail.$cancel_delete_account.onclick = function () {
      var cancel = base.instances.$detail.$cancel_delete_account;
      cancel.className = cancel.className + " hidden";
      var hint = base.instances.$detail.$delete_account_hint;
      hint.className = hint.className + " hidden";
      var button = base.instances.$detail.$delete_account;
      button.className = button.className.replace("btn-danger", "btn-warning");
      button.className = button.className.replace("btn-success", "btn-warning");
      button.innerHTML = "Delete Account";
      me.activateDeleteButton();
    };
  };

  this.activateChangeDescription = function () {
    base.instances.$detail.$changeDescriptionBtn.onclick = function () {
      base.makeRequest("../api/change_description.php", "POST", {
        account : view.store.account,
        description : base.instances.$detail.$changeDescriptionText.value
      }, function (response) {
        response = JSON.parse(response);
        base.instances.$detail.$changeDescriptionLabel.innerHTML = response.text;
        if (response.type == "success") {
          base.actions.manipulation.removeClass(base.instances.$detail.$changeDescriptionLabel.id, "error");
          base.actions.manipulation.addClass(base.instances.$detail.$changeDescriptionLabel.id, "success");
          $(base.instances.$detail.$changeDescriptionLabel).effect("shake", {"direction":"up", "distance":2, "times":2}, 400);
        } else if (response.type == "error") {
          base.actions.manipulation.removeClass(base.instances.$detail.$changeDescriptionLabel.id, "success");
          base.actions.manipulation.addClass(base.instances.$detail.$changeDescriptionLabel.id, "error");
          $(base.instances.$detail.$changeDescriptionLabel).effect("shake", {"direction":"up", "distance":2, "times":2}, 400);
        }
      });
    };
  };

  this.store = {
    originalTitle : base.instances.$navigation.$title.innerHTML,
    account : base.instances.$navigation.$viewName ? base.instances.$navigation.$viewName.innerHTML : "",
    modules : {
      selected : {
        name : "",
        description : "",
        originalName : "",
        sortable : "no"
      },
      lastAdded : {
        name : "",
        description : "",
        originalName : ""
      },
      active : {},
      dialogue : "",
      settings : {}
    },
    comments : {}
  };

  this.parseForKeywords = function (html) {
    var keywords = {
      "REPLACE_WITH_ORIGINAL_MODULE_NAME" : me.store.modules.active.originalName,
      "REPLACE_WITH_MODULE_NAME" : me.store.modules.active.name,
      "REPLACE_WITH_MODULE_DESCRIPTION" : me.store.modules.active.description
    };

    for (var keyword in keywords) {
      if (keywords.hasOwnProperty(keyword)) {
        while (html.indexOf(keyword) !== -1) {
          html = html.replace(keyword, keywords[keyword]);
        }
      }
    }

    return html;
  };

  this.init = function () {
    me.activateDeleteButton();
    me.activateCancelAccountDelete();
    me.activateChangeProfileImage();
    me.activateChangeDescription();

    me.commentManagement.init();
    me.moduleManagement.init();
  };
}

var view = new DetailView();

$(document).ready(function () {
  view.init();
});
