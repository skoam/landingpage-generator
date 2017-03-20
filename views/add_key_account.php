<?php

include("../lib/handle_time.php");
include("../lib/handle_errors.php");
include("../lib/common.php");
include("../lib/snippets.php");
include("../lib/simple_html_dom.php");
include("../lib/sql_wrapper.php");
include("../lib/connect_db.php");

$data = null;

function load_html () {
  global $data;

  $html = file_get_html("./raw/add_key_account.html");

  $html = str_replace("REPLACE_WITH_HEAD", get_snippet("head.html"), $html);
  $html = str_replace("REPLACE_WITH_NAVIGATION", get_snippet("navigation.html"), $html);
  $html = str_replace("REPLACE_WITH_ACCOUNTS", "", $html);
  echo $html;

  echo '<script src="./js/base.js"></script>';
  echo '<script src="./js/extensions/base/extension.min.js"></script>';
  echo '<script src="./js/add_key_account.js"></script>';
}


function init () {
  global $sql;

  if ($sql->connected) {
    load_html();
  }
}

init();
