<?php

include("../lib/handle_time.php");
include("../lib/handle_errors.php");
include("../lib/common.php");
include("../lib/snippets.php");
include("../lib/sql_wrapper.php");
include("../lib/connect_db.php");
include("../lib/simple_html_dom.php");

if (verify_session(get_session())) {
  header("refresh:0;url=./overview.php");
}

function load_html () {
  $html = file_get_html("./raw/login.html");
  $html = str_replace("REPLACE_WITH_HEAD", get_snippet("head.html"), $html);
  echo $html;

  echo '<script src="./js/base.js"></script>';
  echo '<script src="./js/extensions/base/extension.min.js"></script>';
  echo '<script src="./js/login.js"></script>';
}

function init () {
  load_html();
}

init();
