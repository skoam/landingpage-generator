<?php

include("../lib/handle_time.php");
include("../lib/handle_errors.php");
include("../lib/common.php");
include("../lib/snippets.php");
include("../lib/simple_html_dom.php");
include("../lib/sql_wrapper.php");
include("../lib/connect_db.php");

if (!verify_session(get_session())) {
  header("refresh:0;url=./login.php");
  exit(0);
}

$account = null;
$key_accounts = null;
$account_settings = null;
$modules = null;
$name = isset($_GET["name"]) ? $_GET["name"] : "";

function load_html () {
  global $key_accounts, $account, $name, $account_settings, $modules, $paths;

  if (sizeOf($account) == 0) {
    echo "This key account does not exist.";
    return;
  }

  $html = file_get_html("./raw/detail.html");

  if (sizeOf($account_settings) > 0) {
    $module_list = $html->find('ul[id=instance-modules-container]', 0);
    $module_list->innertext = base64_decode(json_decode(base64_decode($account_settings[0]->modules))->html);
    $module_list->innertext = str_replace("module-highlight", "", $module_list->innertext);

    $landingpage_label = $html->find('label[id=instance-label-generate-lp]', 0);
    $landingpage_label->innertext = $account_settings[0]->landingpage_status;

    $module_settings_store = $html->find('div[id=instance-module-settings-store]', 0);
    $module_settings_store->innertext = $account_settings[0]->module_settings;

    $html = str_replace("REPLACE_WITH_COMMENTS_RAW", $account_settings[0]->comments, $html);
  }

  $account_img_jpg = $paths->dir_cache_account_images . $name . "/account.jpg";
  $account_img_png = $paths->dir_cache_account_images . $name . "/account.png";
  if (file_exists($account_img_jpg) &&
      file_exists($account_img_png)) {
    $png_time = date(filemtime($account_img_png));
    $jpg_time = date(filemtime($account_img_jpg));
    if ($jpg_time > $png_time) {
      $html = str_replace("REPLACE_WITH_ACCOUNT_IMAGE", $account_img_jpg, $html);
    } else {
      $html = str_replace("REPLACE_WITH_ACCOUNT_IMAGE", $account_img_png, $html);
    }
  } else if (file_exists($account_img_png)) {
    $html = str_replace("REPLACE_WITH_ACCOUNT_IMAGE", $account_img_png, $html);
  } else if (file_exists($account_img_jpg)) {
    $html = str_replace("REPLACE_WITH_ACCOUNT_IMAGE", $account_img_jpg, $html);
  }

  if (sizeOf($account) > 0) {
    $html = str_replace("REPLACE_WITH_DESCRIPTION", $account[0]->description, $html);
  }

  $html = str_replace("REPLACE_WITH_NAME", $name, $html);
  $html = str_replace("REPLACE_WITH_NAVIGATION", get_snippet("navigation.html"), $html);
  $html = str_replace("REPLACE_WITH_HEAD", get_snippet("head.html"), $html);
  $html = str_replace("REPLACE_WITH_DIALOGUE_ADD_MODULE", get_snippet("add_module_dialogue.html"), $html);

  function add_module_information () {
    global $modules;

    $module_information = "";
    for ($i = 0; $i < sizeOf($modules); $i++) {
      $information_container = get_snippet("module_information.html");
      $information_container = str_replace("REPLACE_WITH_MODULE_NAME", $modules[$i]->name, $information_container);
      $information_container = str_replace("REPLACE_WITH_MODULE_DESCRIPTION", $modules[$i]->description, $information_container);
      $module_information .= $information_container;
    }

    return $module_information;
  }

  function create_module_selection ($category) {
    global $modules;

    $selection = "";
    for ($i = 0; $i < sizeOf($modules); $i++) {
      if (($modules[$i]->category == $category) || ($modules[$i]->category === "" && $category == "uncategorized")) {
        $selection .= "<option>" . $modules[$i]->name . "</option>";
      }
    }

    return $selection;
  }

  $categories = array("uncategorized", "spaces", "images", "social", "tracking");
  for ($i = 0; $i < sizeOf($categories); $i++) {
    $html = str_replace("REPLACE_WITH_MODULE_SELECTION_" . strtoupper($categories[$i]), create_module_selection($categories[$i]), $html);
  }

  $html = str_replace("REPLACE_WITH_MODULE_INFORMATION", add_module_information(), $html);

  $accounts = "";
  for ($i = 0; $i < sizeOf($key_accounts); $i++) {
    $account_name = $key_accounts[$i]->name;
    $accounts .= "<li id='".$account_name."'><a href='detail.php?name=".$account_name."'>".$account_name."</a></li>";
  }
  $html = str_replace("REPLACE_WITH_ACCOUNTS", $accounts, $html);
  echo $html;

  echo '<script src="./js/base.js"></script>';
  echo '<script src="./js/extensions/base/extension.min.js"></script>';
  echo '<script src="./js/detail.js"></script>';
  echo '<script src="./js/extensions/detail/extension.min.js"></script>';
}

function get_data () {
  global $key_accounts, $account, $sql, $name, $account_settings, $modules;

  $account = $sql->get_sql_data("accounts", "WHERE name='".$name."';");
  $account_settings = $sql->get_sql_data("account_settings", "WHERE name='".$name."';");
  $key_accounts = $sql->get_sql_data("accounts");
  $modules = $sql->get_sql_data("modules");
}

function init () {
  global $sql;

  if ($sql->connected) {
    get_data();
    load_html();
  }
}

init();
