base.updateInstances = function () {
  base.instances = {
    $projects : {
      $latestMessagesSelector : document.getElementById("instance-number-of-latest-messages")
    },
    $login : {
      $pwd : document.getElementById("instance-password"),
      $btn : document.getElementById("instance-btn-login")
    },
    $addKeyAccount : {
      $btn : document.getElementById("instance-btn-add-account"),
      $name : document.getElementById("instance-add-account-name"),
      $description : document.getElementById("instance-add-account-description")
    },
    $navigation : {
      $title : document.getElementById("instance-navigation-title"),
      $container : document.getElementById("instance-navigation-container"),
      $list : document.getElementById("instance-navigation-list"),
      $viewName : document.getElementById("instance-view-name")
    },
    $detail : {
      $delete_account : document.getElementById("instance-btn-delete-account"),
      $delete_account_hint : document.getElementById("instance-delete-account-hint"),
      $cancel_delete_account : document.getElementById("instance-btn-cancel-delete-account"),
      $save_changes_hint : document.getElementById("instance-save-changes-hint"),
      $save_modules : document.getElementById("instance-btn-save-modules"),
      $changeProfileImage : document.getElementById("instance-btn-change-profile-img"),
      $accountImage : document.getElementById("instance-account-image"),
      $changeDescriptionText : document.getElementById("instance-textarea-change-description"),
      $changeDescriptionBtn : document.getElementById("instance-button-change-description"),
      $changeDescriptionLabel : document.getElementById("instance-label-change-description"),
      $generate_landingpage : document.getElementById("instance-btn-generate-lp"),
      $generate_landingpage_label : document.getElementById("instance-label-generate-lp"),
      $campaign_reminder_dialogue : document.getElementById("instance-campaign-reminder"),
      $comments : {
        $addCommentBtn : document.getElementById("instance-comments-add-comment"),
        $header : document.getElementById("instance-comments-input-header"),
        $body : document.getElementById("instance-comments-input-body"),
        $raw : document.getElementById("instance-comments-raw"),
        $list : document.getElementById("instance-comments-list"),
        $username : document.getElementById("instance-comments-input-username")
      },
      $modules : {
        $container : document.getElementById("instance-modules-container"),
        $add_module : document.getElementById("instance-btn-add-module"),
        $add_module_dialogue : document.getElementById("instance-dialogue-add-module"),
        select_module_id : "instance-select-module",
        $dialogue_module_name : document.getElementById("instance-dialogue-module-name"),
        $dialogue_module_description : document.getElementById("instance-dialogue-module-description"),
        $dialogue_module_preview : document.getElementById("instance-dialogue-module-preview"),
        $add : document.getElementById("instance-btn-confirm-module"),
        $dialogue_preview_wrapper : document.getElementById("instance-dialogue-preview-wrapper")
      },
      $module_settings : {
        $container : document.getElementById("instance-module-settings"),
        $content : document.getElementById("instance-module-settings-content"),
        $data : document.getElementById("instance-module-settings-data"),
        $name : document.getElementById("instance-module-settings-module-name"),
        $store : document.getElementById("instance-module-settings-store"),
        $deleteModule : document.getElementById("instance-module-delete-module")
      }
    },
    $various : {
      $projectName : document.getElementById("instance-hidden-project-name")
    }
  };
};

base.updateInstances();
