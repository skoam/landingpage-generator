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
$comments = isset($_POST["comments"]) ? $_POST["comments"] : null;

if (!isset($account)) {
  send_response("error", "No account name specified. (string)");
  exit(0);
}

if (!isset($comments)) {
  send_response("error", "No comments specified. (string)");
  exit(0);
}

if (isset($_POST["unencoded"]) && $_POST["unencoded"]) {
  $account = $account;
  $comments = $comments;
} else {
  $account = base64_decode(urldecode($account));
  $comments = base64_decode(urldecode($comments));
}

function insert_data () {
  global $data, $sql, $account, $paths, $comments;
  
  $existing_account = $sql->get_sql_data("account_settings", "WHERE name='".$account."';");

  if (sizeOf($existing_account) > 0) {
    $sql->update_sql_data("account_settings", "name", $account, array(
      "comments" => $comments
    ));
    send_response("success", "Updated comments for " . $account);
  } else {
    send_response("error", "No entry for account " . $account);
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
