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

$key_accounts = null;

function load_html () {
  global $key_accounts, $paths;

  $html = file_get_html("./raw/overview.html");

  function create_thumbnail ($name, $description) {
    global $paths;

    $output = get_snippet("thumbnail.html");

    $account_img_jpg = $paths->dir_cache_account_images . $name . "/account.jpg";
    $account_img_png = $paths->dir_cache_account_images . $name . "/account.png";
    if (file_exists($account_img_jpg) &&
        file_exists($account_img_png)) {
      $png_time = date(filemtime($account_img_png));
      $jpg_time = date(filemtime($account_img_jpg));
      if ($jpg_time > $png_time) {
        $output = str_replace("REPLACE_WITH_ACCOUNT_IMAGE", $account_img_jpg, $output);
      } else {
        $output = str_replace("REPLACE_WITH_ACCOUNT_IMAGE", $account_img_png, $output);
      }
    } else if (file_exists($account_img_png)) {
      $output = str_replace("REPLACE_WITH_ACCOUNT_IMAGE", $account_img_png, $output);
    } else if (file_exists($account_img_jpg)) {
      $output = str_replace("REPLACE_WITH_ACCOUNT_IMAGE", $account_img_jpg, $output);
    }


    $output = str_replace("REPLACE_WITH_NAME", $name, $output);
    $output = str_replace("REPLACE_WITH_DESCRIPTION", $description, $output);

    return $output;
  }

  $container = $html->find('div[id=keyaccount-list]', 0);
  if (isset($container)) {
    $container->innertext = "";
    for ($i = 0; $i < sizeOf($key_accounts); $i++) {
      $container->innertext .= create_thumbnail($key_accounts[$i]->name, $key_accounts[$i]->description);
    }
  }

  $html = str_replace("REPLACE_WITH_HEAD", get_snippet("head.html"), $html);
  $html = str_replace("REPLACE_WITH_NAVIGATION", get_snippet("navigation.html"), $html);
  $accounts = "";
  for ($i = 0; $i < sizeOf($key_accounts); $i++) {
    $account_name = $key_accounts[$i]->name;
    $accounts .= "<li id='".$account_name."'><a href='detail.php?name=".$account_name."'>".$account_name."</a></li>";
  }
  $html = str_replace("REPLACE_WITH_ACCOUNTS", $accounts, $html);
  echo $html;

  echo '<script src="./js/base.js"></script>';
  echo '<script src="./js/extensions/base/extension.min.js"></script>';
}

function get_data () {
  global $key_accounts, $messages, $sql;

  $key_accounts = $sql->get_sql_data("accounts");
}

function init () {
  global $sql;

  if ($sql->connected) {
    get_data();
    load_html();
  }
}

init();
