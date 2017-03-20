view.actions = {
  upload : {
    upload_image : function (source, cacheImage, type) {
      if (!type) {
        type = "module";
      }

      cacheImage = cacheImage ? "" : "-cache";
      var value_field = source;
      var value = value_field.files;

      if (type == "module") {
        name = view.store.modules.selected.name + "-image_" + base.actions.manipulation.getLastNumberFromString(value_field.id) + cacheImage;
      } else if (type == "account") {
        name = "account";
      }

      if (value.length > 0) {
        var file = value[0];
        var fileReader = new FileReader();

        var fileType = file.name.indexOf("jpg") != -1 ? ".jpg" : "";
        fileType = file.name.indexOf("png") != -1 ? ".png" : fileType;
        fileType = file.name.indexOf("jpeg") != -1 ? ".jpeg" : fileType;

        fileReader.onload = function (event) {
          base.makeRequest("../api/upload_image.php", "POST", {
            image : event.target.result,
            account : view.store.account,
            fileName : name + fileType
           }, function (response) {
            response = JSON.parse(response);
            if (type == "module") {
              document.getElementById(source.id.replace("value", "preview")).src = response.text + "?" + base.randomID();
              document.getElementById(source.id.replace("value", "file")).innerHTML = response.text;
              base.actions.manipulation.removeClass(source.id.replace("value", "preview"), "hidden");
            }
            if (type == "account") {
              base.instances.$detail.$accountImage.src = response.text + "?" + base.randomID();
            }
          });
        };

        fileReader.readAsDataURL(file);
      }
    },
    upload_generic_file : function (source, cacheFile) {
      cacheFile = cacheFile ? "" : "-cache";
      var value_field = source;
      var value = value_field.files;
      if (value.length > 0) {
        var file = value[0];
        var fileReader = new FileReader();

        var fileType = file.name.indexOf("css") != -1 ? ".css" : "";

        fileReader.onload = function (event) {
          base.makeRequest("../api/upload_generic_file.php", "POST", {
            file : event.target.result,
            account : view.store.account,
            fileName : view.store.modules.selected.name + "-file_" + base.actions.manipulation.getLastNumberFromString(value_field.id) + cacheFile + fileType
           }, function (response) {
            response = JSON.parse(response);
            document.getElementById(source.id.replace("value", "file")).innerHTML = response.text;
          });
        };

        fileReader.readAsDataURL(file);
      }
    }
  }
};