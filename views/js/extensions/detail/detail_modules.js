/*
  MAKE SURE TO RUN bin/build.sh AFTER MAKING CHANGES TO EXTENSION SCRIPTS OR MINIFY
  THE CONTENTS OF ALL EXTENSIONS FOR THIS VIEW MANUALLY INTO extension.min.js

  THIS SCRIPT CONTAINS ALL THE LOGIC NEEDED IN THE MODULE MANAGEMENT. 
  WORKFLOW OF THE FUNCTIONS SHOULD BE SOMEWHAT AS FOLLOWS:

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  * init (called from detail.js)
    * INITIALIZES THE LEFT PANEL. IT CALCULATES ITS SIZE, LOADS MODULE SETTINGS FROM THE DATABASE 
      AND ACTIVATES "add new module" AND "generate landingpage" BUTTONS.

      Note that the list of modules in the left container (active modules for the page) are already
      loaded by detail.php and inserted into the module container.

      activateAddModuleButton() makes a call to activateModuleBoxes()

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  * activateModuleBoxes
    * MAKES MODULE DESCRIPTIONS CLICKABLE, CALLING showModuleSettings() ON CLICK
    
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  * showModuleSettings
    * LOADS THE settings.html FOR A MODULE FROM resource/modules/$MODULENAME/ and caches it until the site is reloaded.
      IT USES view.store.modules.settings[$MODULENAME] TO INSERT VALUES INTO THE CORRESPONDING FIELDS.

      It makes a call to onSettingsShown() on finish. This will activate additional functionality,
      like date pickers, sortable module settings (for images) and more.

      It also sets a trigger that is looking for changes, settings hasChangedSettings to true and
      calling showSaveChangesButton()

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  * saveAllModules
    * THIS ENCODES ALL MODULE SETTINGS FROM view.store.modules.settings TO A SINGLE ENCODED BLOB THAT
      CAN BE STORED IN THE DATABASE. IT ALSO SENDS ACCOUNT NAME AND ACTIVE MODULES TO /api/update_modules.php

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  * activateGenerateLandingPage
    * CALLS /api/generate_landingpage.php WITH THE CORRECT ACCOUNT NAME.
    
*/
view.moduleManagement = {
  init : function () {
    view.moduleManagement.calculateModulesContainerSize();
    view.moduleManagement.makeModulesSortable();
    view.moduleManagement.getModuleDataFromStore();
    view.moduleManagement.activateAddModuleButton();
    view.moduleManagement.activateGenerateLandingPage();
  },
  hasChangedSettings : false,
  campaignReminder : false,
  maxNumberOfModuleValues : 15,
  maxNumberOfCSSValues : 10,
  activateGenerateLandingPage : function () {
    $generate_landingpage = $(base.instances.$detail.$generate_landingpage);
    $generate_landingpage.unbind("click");
    $generate_landingpage.click(function () {
      base.instances.$detail.$generate_landingpage_label.innerHTML = "<i class='fa fa-cog fa-spin'></i>";
      base.makeRequest("../api/generate_landingpage.php", "POST", {
        account : view.store.account
      }, function (data) {
        data = JSON.parse(data);
        if (data.type == "success") {
          base.instances.$detail.$generate_landingpage_label.innerHTML = data.text;
          base.actions.manipulation.removeClass(base.instances.$detail.$generate_landingpage_label.id, "error");
          base.actions.manipulation.addClass(base.instances.$detail.$generate_landingpage_label.id, "success");
          $(base.instances.$detail.$generate_landingpage_label).effect("shake", {"direction":"up", "distance":2, "times":2}, 400);
        } else {
          base.instances.$detail.$generate_landingpage_label.innerHTML = data.text;
          base.actions.manipulation.addClass(base.instances.$detail.$generate_landingpage_label.id, "error");
          base.actions.manipulation.removeClass(base.instances.$detail.$generate_landingpage_label.id, "success");
        }
      });
    });
  },
  activateAddModuleButton : function () {
    var $modules = base.instances.$detail.$modules;
    view.store.modules.dialogue = $modules.$add_module_dialogue.innerHTML;
    $modules.$add_module_dialogue.remove();

    function activatePopover () {
      base.updateInstances();
      var $modules = base.instances.$detail.$modules;
      var $add_module = $("#" + $modules.$add_module.id);

      $add_module.popover({
        container : 'body',
        title : "Select a module",
        content : view.store.modules.dialogue,
        placement : "bottom",
        html : true
      });
    }

    function initializePopupWindow () {
      base.updateInstances();
      var $modules = base.instances.$detail.$modules;
      var $add_module = $("#" + $modules.$add_module.id);

      var $modulesSelectBox = $("[id^=" + $modules.select_module_id + "]");
      $modulesSelectBox.unbind('change');

      $modulesSelectBox.click(function () {
        var temporaryValue = $(this).val();
        $modulesSelectBox.val("none");
        $(this).val(temporaryValue);
      });

      $modulesSelectBox.change(function () {
        var moduleName = this.selectedOptions[0].innerHTML;

        // - None - means no module is selected, removing name/description and 'add' button
        if (moduleName == "- None -") {
          base.actions.manipulation.addClass($modules.$add.id, "hidden");
          $modules.$dialogue_module_name.innerHTML = "";
          $modules.$dialogue_module_description.innerHTML = "";
          return;
        }
        // Update name and description inside the popup box
        var moduleDescription = document.getElementById(moduleName + "-description").innerHTML;
        $modules.$dialogue_module_name.innerHTML = moduleName;
        $modules.$dialogue_module_description.innerHTML = moduleDescription;
        $modules.$dialogue_module_preview.src = "../resource/modules/" + moduleName + "/preview.png";

        $($modules.$dialogue_preview_wrapper).insertAfter($(this));

        // Store name and description in container
        view.store.modules.lastAdded.name = moduleName;
        view.store.modules.lastAdded.description = moduleDescription;

        // Show 'Add' Button when something was selected
        base.actions.manipulation.removeClass($modules.$add.id, "hidden");
      });

      $add = $("#" + $modules.$add.id);
      $add.unbind('click');
      $add.click(function () {
        $add_module.popover("hide");
        $add_module.on('hidden.bs.popover', function () {
          activatePopover();
          var $add_module = $("#" + $modules.$add_module.id);
          $add_module.click(initializePopupWindow);
        });

        // Add module to the list
        base.getSnippet("module.html", function (data) {
          // rename if module already exists (auto increment)
          view.store.modules.lastAdded.originalName = view.store.modules.lastAdded.name;
          var $sameModules = $("[id*='panel-container-" + view.store.modules.lastAdded.originalName + "']");

          var highestIdExisting = 0;
          for (var i = 0; i < $sameModules.length; i++) {
            var moduleId = parseInt($sameModules[i].id.replace(/^\D+/g, ''), 10);
            if (moduleId != "NaN" && moduleId > highestIdExisting) {
              highestIdExisting = moduleId;
            }
          }

          view.store.modules.lastAdded.name = view.store.modules.lastAdded.name + " " + (highestIdExisting + 1);

          // replace keywords in snippet with the module name/description and add it to the HTML
          view.store.modules.active = view.store.modules.lastAdded;
          $modules.$container.innerHTML = $modules.$container.innerHTML + view.parseForKeywords(data);
          $(document.getElementById("panel-container-" + view.store.modules.lastAdded.name)).insertAfter($modules.$container.children[0]);

          view.moduleManagement.hasChangedSettings = true;
          view.moduleManagement.showSaveChangesButton();
          view.moduleManagement.activateModuleBoxes();
          view.moduleManagement.scrollToModule(view.store.modules.lastAdded.name);
        });
      });
    }

    activatePopover();

    // Initialize popup window when the button is hit
    var $add_module = $("#" + $modules.$add_module.id);
    $add_module.click(initializePopupWindow);
  },
  scrollToModule : function (moduleName) {
    $(document.getElementById("panel-description-" + moduleName)).click();
  },
  saveModuleSettings : function () {
    if (!view.store.modules.selected.name) {
      return;
    }

    var $module_settings = base.instances.$detail.$module_settings;
    var numberOfSupportedModules = 2;
    var values = [];

    for (var i = 0; i < view.moduleManagement.maxNumberOfModuleValues; i++) {
      var elementIndex = i + 1;
      values[i] = document.getElementById(view.store.modules.selected.name + "-value" + elementIndex);
      if (values[i] && values[i].type == "file") {
        values[i] = document.getElementById(view.store.modules.selected.name + "-file" + elementIndex).innerHTML;
      } else if (values[i]) {
        values[i] = values[i].value;
      } else {
        values[i] = "";
      }
    }

    var cssValues = [];

    for (i = 0; i < view.moduleManagement.maxNumberOfCSSValues; i++) {
      elementIndex = i + 1;
      cssValues[i] = document.getElementById(view.store.modules.selected.name + "-cssvalue" + elementIndex);
      if (cssValues[i] && cssValues[i].type == "file") {
        cssValues[i] = document.getElementById(view.store.modules.selected.name + "-cssvaluefile" + elementIndex).innerHTML;
      } else if (cssValues[i]) {
        cssValues[i] = cssValues[i].value;
      } else {
        cssValues[i] = "";
      }
    }

    // Save changes done to the last opened module

    var second_value = document.getElementById(view.store.modules.selected.name + "-value2");
    second_value = second_value ? second_value.value : "";

    view.store.modules.selected.sortableOrder = [];
    var isSortable = document.getElementById(view.store.modules.selected.name + "-sortable");
    if (isSortable && isSortable.innerHTML == "true") {
      var $sortableList = $(document.getElementById(view.store.modules.selected.name + "-sortable-list"))[0];
      var $elementsInList = $sortableList.children;
      for (var k = 0; k < $elementsInList.length; k++) {
        view.store.modules.selected.sortableOrder.push(
          $elementsInList[k].id.replace(
            view.store.modules.selected.name + "-sortable", ""));
      }
    } else {
      view.store.modules.selected.sortable = "no";
    }

    view.store.modules.settings[view.store.modules.selected.name] = {
      settings : $module_settings.$data.innerHTML,
      value_1 : values[0],
      value_2 : values[1],
      value_3 : values[2],
      value_4 : values[3],
      value_5 : values[4],
      value_6 : values[5],
      value_7 : values[6],
      value_8 : values[7],
      value_9 : values[8],
      value_10 : values[9],
      value_11 : values[10],
      value_12 : values[11],
      value_13 : values[12],
      value_14 : values[13],
      value_15 : values[14],
      css_value_1 : cssValues[0],
      css_value_2 : cssValues[1],
      css_value_3 : cssValues[2],
      css_value_4 : cssValues[3],
      css_value_5 : cssValues[4],
      css_value_6 : cssValues[5],
      css_value_7 : cssValues[6],
      css_value_8 : cssValues[7],
      css_value_9 : cssValues[8],
      css_value_10 : cssValues[9],
      originalName : view.store.modules.selected.originalName,
      sortable : view.store.modules.selected.sortable,
      sortableOrder : view.store.modules.selected.sortableOrder
    };

    if (view.moduleManagement.hasChangedSettings) {
      view.moduleManagement.showSaveChangesButton();
    }
  },
  loadModuleSettings : function () {
    var $module_settings = base.instances.$detail.$module_settings;

    $module_settings.$data.innerHTML = view.store.modules.settings[view.store.modules.selected.name].settings;

    var settingsStore = view.store.modules.settings[view.store.modules.selected.name];
    var preview = null;
    var container = null;

    for (var i = 0; i < view.moduleManagement.maxNumberOfModuleValues; i++) {
      var elementIndex = i + 1;
      var $elementOfValue = document.getElementById(view.store.modules.selected.name + "-value" + elementIndex);
      if ($elementOfValue && $elementOfValue.type == "file") {
        preview = document.getElementById(view.store.modules.selected.name + "-preview" + elementIndex);
        if (preview && settingsStore["value_" + elementIndex]) {
          preview.src = settingsStore["value_" + elementIndex] + "?" + base.randomID();
          base.actions.manipulation.removeClass(preview.id, "hidden");
        }
        container = document.getElementById(view.store.modules.selected.name + "-file" + elementIndex);
        if (container) {
          container.innerHTML = settingsStore["value_" + elementIndex];
        }
      } else if ($elementOfValue) {
        $elementOfValue.value = settingsStore["value_" + elementIndex];
      }
    }

    for (i = 0; i < view.moduleManagement.maxNumberOfCSSValues; i++) {
      elementIndex = i + 1;
      $elementOfValue = document.getElementById(view.store.modules.selected.name + "-cssvalue" + elementIndex);
      if ($elementOfValue && $elementOfValue.type == "file") {
        preview = document.getElementById(view.store.modules.selected.name + "-csspreview" + elementIndex);
        if (preview) {
          preview.src = settingsStore["css_value_" + elementIndex] + "?" + base.randomID();
        }
        container = document.getElementById(view.store.modules.selected.name + "-cssfile" + elementIndex);
        if (container) {
          container.innerHTML = settingsStore["value_" + elementIndex];
        }
      } else if ($elementOfValue) {
        $elementOfValue.value = settingsStore["css_value_" + elementIndex];
      }
    }

    view.moduleManagement.onSettingsShown();
  },
  showSaveChangesButton : function () {
    base.actions.manipulation.removeClass(base.instances.$detail.$save_changes_hint.id, "hidden");
    var $saveChanges = $("#" + base.instances.$detail.$save_modules.id);
    $saveChanges.unbind("click");
    $saveChanges.click(function () {
      if (!view.moduleManagement.campaignReminder) {
        view.moduleManagement.saveAllModules();
        view.moduleManagement.hideSaveChangesButton();
      } else {
        view.moduleManagement.closeModuleSettings();
        $(base.instances.$detail.$campaign_reminder_dialogue).modal();
        $(base.instances.$detail.$campaign_reminder_dialogue).on("shown.bs.modal", function () {
          var $updateCampaign = $("#update-campaign-and-save");
          if ($updateCampaign) {
            $updateCampaign.click(function () {
              $updateCampaign.attr("disabled", "disabled");
              
              campaignSettings = [];
              
              var currentCampaignIndex = 0;
              var modulesAsString = Object.keys(view.store.modules.settings);
              var campaignModules = [];
              for (var i = 0; i < modulesAsString.length; i++) {
                if (modulesAsString[i].indexOf("Campaign") != -1) {
                  campaignModules.push(modulesAsString[i]);
                }
              }

              var fetchingCampaignSettings = setInterval(function () {
                var campaignModuleName = campaignModules[currentCampaignIndex];
                var campaignObject = {};

                $(document.getElementById("panel-description-" + campaignModules[currentCampaignIndex])).click();
                
                setTimeout(function () {
                  // Multiple Campaign Modules 
                  try {
                    var platformField = document.getElementById(campaignModuleName + "-platform").innerHTML;
                    campaignObject.platform = $(document.getElementById(campaignModuleName + platformField)).val();
                    var shopIdField = document.getElementById(campaignModuleName + "-shopId").innerHTML;
                    campaignObject.shopId = $(document.getElementById(campaignModuleName + shopIdField)).val();
                    var articleField = document.getElementById(campaignModuleName + "-article").innerHTML;
                    campaignObject.article = $(document.getElementById(campaignModuleName + articleField)).val();
                    var startDateField = document.getElementById(campaignModuleName + "-start").innerHTML;
                    campaignObject.start = $(document.getElementById(campaignModuleName + startDateField)).val();
                    var endDateField = document.getElementById(campaignModuleName + "-end").innerHTML;
                    campaignObject.end = $(document.getElementById(campaignModuleName + endDateField)).val();
                    var titleField = document.getElementById(campaignModuleName + "-title").innerHTML;
                    campaignObject.title = base.actions.manipulation.utf8_to_b64($(document.getElementById(campaignModuleName + titleField)).val());
                    var dueField = document.getElementById(campaignModuleName + "-due").innerHTML;
                    campaignObject.due = base.actions.manipulation.utf8_to_b64($(document.getElementById(campaignModuleName + dueField)).val());
                    var endedField = document.getElementById(campaignModuleName + "-ended").innerHTML;
                    campaignObject.ended = base.actions.manipulation.utf8_to_b64($(document.getElementById(campaignModuleName + endedField)).val());
                    var languageField = document.getElementById(campaignModuleName + "-language").innerHTML;
                    campaignObject.language = $(document.getElementById(campaignModuleName + languageField)).val();
                    var hideFullShopLayoutField = document.getElementById(campaignModuleName + "-hideFullShopLayout").innerHTML;
                    campaignObject.hideFullShopLayout = $(document.getElementById(campaignModuleName + hideFullShopLayoutField)).val();

                    campaignSettings.push(campaignObject);
                    $(document.getElementById("panel-description-" + campaignModules[currentCampaignIndex])).click();

                    console.log(campaignModules[currentCampaignIndex]);
                    
                    if (currentCampaignIndex >= campaignModules.length) {
                      clearInterval(fetchingCampaignSettings);
                    } else {
                      currentCampaignIndex++;
                    }
                  } catch (e) {
                    clearInterval(fetchingCampaignSettings);
                  }
                }, 2000);
              }, 3000);

              var waitingForCampaigns = setInterval(function () {
                if (currentCampaignIndex >= campaignModules.length) {
                  base.makeRequest("../api/update_campaign.php", "POST", {
                    campaigns : JSON.stringify(campaignSettings)
                  }, function (response) { 
                    $updateCampaign.removeAttr("disabled");
                    $(base.instances.$detail.$campaign_reminder_dialogue).modal("toggle");
                    view.moduleManagement.campaignReminder = false;
                    view.moduleManagement.saveAllModules();
                    view.moduleManagement.hideSaveChangesButton();
                  });

                  clearInterval(waitingForCampaigns);
                }
              }, 1000);
            });
          }
        });
      }
    });
  },
  hideSaveChangesButton : function () {
    base.actions.manipulation.addClass(base.instances.$detail.$save_changes_hint.id, "hidden");
    var $saveChanges = $("#" + base.instances.$detail.$save_modules.id);
    $saveChanges.unbind("click");
  },
  saveAllModules : function () {
    view.moduleManagement.saveModuleSettings();
    var settingsStore = $.extend(true, {}, view.store.modules.settings);

    // encodes everything inside view.store.modules.settings[moduleName] in base64
    var moduleNames = Object.keys(settingsStore);
    for (var module = 0; module < Object.keys(settingsStore).length; module++) {
      var settings = Object.keys(settingsStore[moduleNames[module]]);
      for (var setting = 0; setting < Object.keys(settings).length; setting++) {
        if (typeof(settingsStore[moduleNames[module]][settings[setting]]) == "string") {
          settingsStore[moduleNames[module]][settings[setting]] = settingsStore[moduleNames[module]][settings[setting]].replace("-cache", "");
        } else {
          settingsStore[moduleNames[module]][settings[setting]] = settingsStore[moduleNames[module]][settings[setting]];
        }
        settingsStore[moduleNames[module]][settings[setting]] = base.actions.manipulation.utf8_to_b64(settingsStore[moduleNames[module]][settings[setting]]);
      }
    }

    var moduleOrder = [];
    var modules = $("[id^=panel-container-]");
    for (var i = 0; i < modules.length; i++) {
      moduleOrder.push(modules[i].id.replace("panel-container-", ""));
    }

    base.makeRequest("../api/update_modules.php", "POST", {
      account : view.store.account,
      modules : JSON.stringify({
        html : btoa(base.instances.$detail.$modules.$container.innerHTML),
        count : moduleNames.length,
        modules : moduleNames,
        moduleOrder : moduleOrder
      }),
      module_settings : JSON.stringify(settingsStore)
    }, function (data) {
      view.moduleManagement.hasChangedSettings = false;
    });
  },
  showModuleSettings : function (moduleName) {
    var $module_settings = base.instances.$detail.$module_settings;

    if (view.store.modules.selected.name == moduleName) {
      if (!base.actions.query.hasClass($module_settings.$container.id, "hidden")) {
        view.moduleManagement.closeModuleSettings();
        return;
      }
    }

    if (view.store.modules.settings.hasOwnProperty(view.store.modules.selected.name)) {
      view.moduleManagement.saveModuleSettings();
    }

    // Animations and UI changes
    view.store.modules.selected.name = moduleName;
    base.actions.manipulation.removeClass($module_settings.$container.id, "hidden");
    $(".module-highlight").removeClass("module-highlight");
    base.actions.manipulation.addClass("panel-description-" + moduleName, "module-highlight");
    base.actions.effects.highlightById($module_settings.$content.id, "white", 500);

    // get the original module name
    var originalModuleName = document.getElementById("panel-original-" + moduleName).innerHTML;
    view.store.modules.selected.originalName = originalModuleName;

    //  fetch settings for the module, if not already stored in cache
    if (view.store.modules.settings.hasOwnProperty(view.store.modules.selected.name) &&
      view.store.modules.settings[view.store.modules.selected.name]) {
      if (view.store.modules.settings[view.store.modules.selected.name].settings) {
        view.moduleManagement.loadModuleSettings();
      } else {
        view.moduleManagement.getModuleSettings(originalModuleName, function (data) {
          view.store.modules.active = view.store.modules.selected;
          view.store.modules.settings[view.store.modules.selected.name].settings = view.parseForKeywords(data);
          view.moduleManagement.loadModuleSettings();
        });
      }
    } else {
      view.moduleManagement.getModuleSettings(originalModuleName, function (data) {
        view.store.modules.active = view.store.modules.selected;
        $module_settings.$data.innerHTML = view.parseForKeywords(data);
        view.moduleManagement.saveModuleSettings();
        view.moduleManagement.onSettingsShown();
      });
    }
  },
  onSettingsShown : function () {
    var $timepickers = $("[id*=-datetimepicker]");

    var selected = view.store.modules.selected.name;

    if ($timepickers.length > 0) {
      $timepickers.datetimepicker();
    }

    $timepickers.on("dp.change", function () {
      view.moduleManagement.hasChangedSettings = true;
      view.moduleManagement.showSaveChangesButton();
      /* var $updateCampaign = $(document.getElementById(selected + "-update-campaign"));
      if ($updateCampaign) {
        view.moduleManagement.campaignReminder = true;
      }*/
    });

    // activate change trigger for alle value fields
    $("[id*='value']").unbind("change");
    $("[id*='value']").change(function () {
      view.moduleManagement.hasChangedSettings = true;
      view.moduleManagement.showSaveChangesButton();
    });

    // make module settings sortable if necessary
    var isSortable = document.getElementById(selected + "-sortable");
    if (isSortable && isSortable.innerHTML == "true") {
      view.store.modules.selected.sortable = "yes";
      var sortableList = $(document.getElementById(selected + "-sortable-list"));
      sortableList.sortable({
        axis : 'y',
        placeholder: "ui-state-highlight",
        handle: '.panel-heading',
        items : 'li',
        update: function() {
          $('.panel', sortableList).each(function(index, elem) {
             var $listItem = $(elem),
               newIndex = $listItem.index();
          });

          view.moduleManagement.showSaveChangesButton();
        }
      });
    } else {
      view.store.modules.selected.sortable = "no";
    }


    var modules = base.instances.$detail.$modules.$container.children;
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].id == "panel-container-" + selected) {
        base.instances.$detail.$module_settings.$container.style.marginTop = (i - 1) * 60;
      }
    }


    view.moduleManagement.activateDeleteModuleButton();
  },
  closeModuleSettings : function () {
    var $module_settings = base.instances.$detail.$module_settings;

    if (base.actions.query.hasClass($module_settings.$container.id, "hidden")) {
      return;
    }

    if (view.store.modules.settings.hasOwnProperty(view.store.modules.selected.name)) {
      view.moduleManagement.saveModuleSettings();
    }

    if (view.moduleManagement.hasChangedSettings) {
      view.moduleManagement.showSaveChangesButton();
    }

    base.actions.manipulation.addClass($module_settings.$container.id, "hidden");
    $(".module-highlight").removeClass("module-highlight");
  },
  activateModuleBoxes : function () {
    // a click on a module in the list opens the settings panel and shows the unique settings
    $moduleBoxes = $(".module-description");

    if ($moduleBoxes.length === 0) {
      return;
    }

    $moduleBoxes.unbind("click");
    $moduleBoxes.click(function () {
      view.moduleManagement.showModuleSettings(this.id.replace("panel-description-", ""));
    });

    // Add popover help to descriptions
    $moduleBoxes.popover({
      container : 'body',
      title : "Click to edit",
      content : "The settings for this module will appear  on the right.",
      placement : "right",
      trigger: "hover"
    });
  },
  getModuleSettings : function (name, callback) {
    base.makeRequest("../resource/modules/" + name + "/settings.html", "GET", null, callback);
  },
  activateDeleteModuleButton : function () {
    var $deleteButton = $("#" + base.instances.$detail.$module_settings.$deleteModule.id);

    var confirmDeleteId = "instance-confirm-delete-module";
    // Add popover help to descriptions
    $deleteButton.popover({
      container : 'body',
      title : "Deleting cannot be undone",
      content : "<input type='button' id='" + confirmDeleteId + "' class='btn btn-xs btn-danger' value='Confirm Delete'/>",
      placement : "left",
      html : true
    });

    $deleteButton.on("shown.bs.popover", function () {
      var $confirmDeleteModule = $("#" + confirmDeleteId);
      $confirmDeleteModule.unbind("click");
      $confirmDeleteModule.click(function () {
        $deleteButton.click();
        document.getElementById("panel-container-" + view.store.modules.selected.name).remove();
        delete view.store.modules.settings[view.store.modules.selected.name];
        view.store.modules.selected = {
          name : "",
          description : "",
          originalName : ""
        };
        view.moduleManagement.hasChangedSettings = true;
        view.moduleManagement.closeModuleSettings();
        view.moduleManagement.calculateModulesContainerSize();
      });
    });
  },
  getModuleDataFromStore : function () {
    view.moduleManagement.activateModuleBoxes();
    var settingsStoreAsString = base.instances.$detail.$module_settings.$store.innerHTML;
    if (settingsStoreAsString.length === 0) {
      return;
    }

    var settingsStore = JSON.parse(atob(base.instances.$detail.$module_settings.$store.innerHTML));

    // decodes everything inside view.store.modules.settings[moduleName] from base64
    var moduleNames = Object.keys(settingsStore);
    for (var module = 0; module < Object.keys(settingsStore).length; module++) {
      var settings = Object.keys(settingsStore[moduleNames[module]]);
      for (var setting = 0; setting < Object.keys(settings).length; setting++) {
        settingsStore[moduleNames[module]][settings[setting]] = base.actions.manipulation.b64_to_utf8(settingsStore[moduleNames[module]][settings[setting]]);
      }
      settingsStore[moduleNames[module]].settings = null;
    }

    view.store.modules.settings = settingsStore;
  },
  calculateModulesContainerSize : function () {
    var $modules = base.instances.$detail.$modules;
    var modulesContainer = $modules.$container;
    var height = 0;
    var elementsInContainer = modulesContainer.childNodes;
    var numberOfModules = 0;
    for (var i = 0; i < elementsInContainer.length; i++) {
      if (elementsInContainer[i].tagName == "LI") {
        numberOfModules++;
      }
    }
    var heightOfChildNodes = 60;
    modulesContainer.style.height = (heightOfChildNodes * numberOfModules) + "px";
  },
  makeModulesSortable : function () {
    var $modules = base.instances.$detail.$modules;
    var panelList = $("#" + $modules.$container.id);

    panelList.sortable({
      axis : 'y',
      placeholder: "ui-state-highlight",
      handle: '.panel-heading',
      items : 'li',
      update: function() {
        $('.panel', panelList).each(function(index, elem) {
           var $listItem = $(elem),
             newIndex = $listItem.index();
        });

        view.moduleManagement.showSaveChangesButton();
      }
    });
  }
};
