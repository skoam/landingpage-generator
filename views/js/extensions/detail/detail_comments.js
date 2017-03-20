view.commentManagement = {
  init : function () {
    var username = base.managesCookies.addCookie("kamgmt_username", username).read();
    if (username) {
      base.instances.$detail.$comments.$username.value = username;
    }

    view.commentManagement.readCommentsFromStore();
    view.commentManagement.restoreStoredComments();
    view.commentManagement.activateAddComment();
  },
  addNewComment : function (body, header, username) {
    body = body ? body : base.instances.$detail.$comments.$body.value;
    header = header ? header : base.instances.$detail.$comments.$header.value;
    username = username ? username : base.instances.$detail.$comments.$username.value;

    if (!header) {
      header = "Comment";
    }

    if (!username) {
      username = "anonymous user";
    } else {
      base.managesCookies.addCookie("kamgmt_username", username).write();
    }

    var comment = {
      header : header + " (" + username + ")",
      body : body,
      date : new Date().toString(),
      id : "C" + base.randomID()
    };

    base.instances.$detail.$comments.$header.value = "";
    base.instances.$detail.$comments.$body.value = "";

    view.store.comments[comment.id] = comment;
    view.commentManagement.addCommentAsHTML(comment.id);
    view.commentManagement.saveComments();
  },
  removeComment : function (id) {
    var deleteButtonId = "delete-comment-" + id;
    base.actions.manipulation.addClass(deleteButtonId, "btn-danger");
    document.getElementById(deleteButtonId).value = "confirm delete";
    document.getElementById(deleteButtonId).onclick = function () {
      $("#comment-" + id).hide("fade", 200, function () {
        document.getElementById("comment-" + id).remove();
      });
      delete view.store.comments[id];
      view.commentManagement.saveComments();
    };
  },
  saveComments : function () {
    base.makeRequest("../api/save_comments.php", "POST", {
      account : view.store.account,
      comments : base.actions.manipulation.utf8_to_b64(JSON.stringify(view.store.comments))
    }, function (response) {
    });
  },
  activateAddComment : function () {
    base.instances.$detail.$comments.$addCommentBtn.onclick = function () {
      if (!base.instances.$detail.$comments.$body.value) {
        base.actions.effects.highlightById(base.instances.$detail.$comments.$body.id, "lightgrey", 1000);
        return;
      }
      view.commentManagement.addNewComment();
    };
  },
  readCommentsFromStore : function () {
    if (base.instances.$detail.$comments.$raw.innerHTML &&
        base.instances.$detail.$comments.$raw.innerHTML != "REPLACE_WITH_COMMENTS_RAW") {
      view.store.comments = JSON.parse(base.actions.manipulation.b64_to_utf8(base.instances.$detail.$comments.$raw.innerHTML));
    }
  },
  restoreStoredComments : function () {
    base.getSnippet("comment.html", function (response) {
      for (var comment in view.store.comments) {
        if (view.store.comments.hasOwnProperty(comment)) {
          var commentHTML = view.commentManagement.parseCommentHTML(response, view.store.comments[comment].id);
          base.instances.$detail.$comments.$list.innerHTML = commentHTML + base.instances.$detail.$comments.$list.innerHTML;
        }
      }
    });
  },
  parseCommentHTML : function (html, id) {
    html = html.replace(/REPLACE_WITH_COMMENT_ID/g, id);
    html = html.replace("REPLACE_WITH_COMMENT_HEADER", view.store.comments[id].header);
    html = html.replace("REPLACE_WITH_COMMENT_BODY", view.store.comments[id].body);
    html = html.replace("REPLACE_WITH_COMMENT_DATE", view.store.comments[id].date);
    return html;
  },
  addCommentAsHTML : function (id) {
    base.getSnippet("comment.html", function (response) {
      response = view.commentManagement.parseCommentHTML(response, id);
      base.instances.$detail.$comments.$list.innerHTML = response + base.instances.$detail.$comments.$list.innerHTML;
      base.actions.effects.highlightById("comment-" + id, "#428bca", 1000);
    });
  }
};