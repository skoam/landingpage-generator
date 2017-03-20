<?php

include("../lib/common.php");
include("../lib/handle_time.php");
include("../lib/handle_errors.php");
include("../lib/sql_wrapper.php");
include("../lib/connect_db.php");

accept_session_parameter();

if (!verify_session(get_session())) {
  send_response("error", "Could not determine a valid session.");
  exit(0);
}

$account = isset($_POST["account"]) ? $_POST["account"] : null;

if (!isset($account)) {
  send_response("error", "No account name specified. (string)");
  exit(0);
}

if (isset($_POST["unencoded"]) && $_POST["unencoded"]) {
  $account = $account;
} else {
  $account = base64_decode(urldecode($account));
}

function insert_data () {
  global $data, $sql, $account, $paths, $images;

  $landingpages_location = "//localhost/loc/lp/";
  $tool_root = "//localhost/loc/key-account-management/";
  $account_settings_sql = $sql->get_sql_data("account_settings", "WHERE name='".$account."';");

  if (sizeOf($account_settings_sql) > 0) {
    $account_settings = $account_settings_sql[0];

    $modules = json_decode(base64_decode(urldecode($account_settings->modules)));
    $module_settings = json_decode(base64_decode(urldecode($account_settings->module_settings)));

    $account_name_sanitized = str_replace(" ", "-", strtolower($account));
    $account_landingpage_cache = $paths->dir_cache_landingpages . $account_name_sanitized . "/";
    if (!is_dir($account_landingpage_cache)) {
      mkdir($account_landingpage_cache, 0777, true);
    }

    $landingpage_base = file_get_contents($paths->dir_resource_landingpages . "index.html");
    $landingpage = "";
    $css = file_get_contents($paths->dir_resource_landingpages . "style.css");
    
    $head_html = "";

    function parse_value ($value) {
      $value = nl2br(base64_decode($value));
      return $value;
    }

    function insert_value ($html, $value, $index) {
      return str_replace("REPLACE_WITH_VALUE_" . $index, parse_value($value), $html);
    }

    function insert_css_value ($css, $value, $index) {
      return str_replace("REPLACE_WITH_CSS_VALUE_" . $index, parse_value($value), $css);
    }

    function replace_relative_paths ($html, $location) {
      $html = str_replace("../cache", $location . "cache", $html);
      $html = str_replace("../resource", $location . "resource", $html);
      $html = str_replace("../img", $location . "img", $html);
      return $html;
    }

    for ($i = 0; $i < $modules->count; $i++) {
      $settings = $module_settings->{$modules->moduleOrder[$i]};
      $module_original_name = base64_decode($settings->originalName);
      $module_name = $modules->moduleOrder[$i];
      $module_location = $paths->dir_resource_modules . $module_original_name . "/";
      $module_location = str_replace(" ", "\x20", $module_location);

      $module_html = file_get_contents($module_location . "module.html");
      
      $module_head_html = "";
      if (file_exists($module_location . "head.html")) {
        $module_head_html = file_get_contents($module_location . "head.html");
      }
      
      // INSERT HTML VALUES
      for ($k = 15; $k > 0; $k--) {        
        $index = $k;
        if (base64_decode($settings->sortable) == "yes") {
          $sortableOrder = base64_decode($settings->sortableOrder);
          $sortableOrder = explode(',', $sortableOrder);
          if (sizeOf($sortableOrder) >= $k) {
            $index = intval($sortableOrder[$k - 1]);
          }
        }
        if (property_exists($settings, "value_" . $index)) {
          $module_html = insert_value($module_html, $settings->{"value_" . $index}, $k);
          $module_head_html = insert_value($module_head_html, $settings->{"value_" . $index}, $k);
        }
      }
      
      $module_css = file_get_contents($module_location . "style.css");
      // INSERT CSS VALUES
      for ($k = 1; $k < 11; $k++) {
        $index = $k;
        if (property_exists($settings, "css_value_" . $index)) {
          $module_css = insert_css_value($module_css, $settings->{"css_value_" . $index}, $k);
        }
      }

      $module_html = str_replace("REPLACE_WITH_MODULE_NAME", $module_name, $module_html);
      $landingpage .= $module_html;
      $css .= "\n" . $module_css;
      $head_html .= $module_head_html;
    }
    
    $landingpage_base = str_replace("REPLACE_WITH_HEAD", $head_html, $landingpage_base);
    $landingpage_base = str_replace("REPLACE_WITH_NAME", $account, $landingpage_base);
    $landingpage_base = str_replace("REPLACE_WITH_CONTENT", $landingpage, $landingpage_base);

    $landingpage_base = replace_relative_paths($landingpage_base, $tool_root);
    $css = replace_relative_paths($css, $tool_root);

    file_put_contents($account_landingpage_cache . "index.html", $landingpage_base);
    file_put_contents($account_landingpage_cache . "style.css", $css);

    $landingpage_status = "<a href='" . $landingpages_location . $account_name_sanitized . "' target='_blank'>landingpage</a> generated on " . date("l jS \of F Y h:i:s A");

    $sql->update_sql_data("account_settings", "name", $account, array(
      "landingpage_status" => $landingpage_status
    ));

    send_response("success", "$landingpage_status");
  } else {
    send_response("error", "No entry for " . $account);
    return;
  }
}

function init () {
  global $sql;

  if (!isset($sql)) {
    send_response("error", "Not authorized to access database.");
    exit(0);
  }

  if ($sql->connected) {
    insert_data();
  }
}

init();
