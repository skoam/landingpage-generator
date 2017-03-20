<?php

if (!session_id()) {
  session_start();
}

include("../lib/handle_time.php");
include("../lib/handle_errors.php");
include("../lib/common.php");
include("../lib/sql_wrapper.php");
include("../lib/connect_db.php");

if (get_lock()) {
  send_response("error", "Tried to login too many times. Locked you out, please contact sylf@spreadshirt.net");
  exit(0);
}

if (get_session() && verify_session(get_session())) {
  send_response("session", get_session());
  exit(0);
} else {
  $key = isset($_POST["key"]) ? $_POST["key"] : (isset($_GET["key"]) ? $_GET["key"] : null);

  if (!isset($key)) {
    send_response("error", "You cannot create a new session without providing a valid key.");
    exit(0);
  }

  $key = base64_decode(urldecode($key));

  if (check_key($key)) {
    send_response("session", create_session());
  } else {
    if (!lock_on_abuse()) {
      send_response("error", "This key is not valid.");
    }
  }
}
