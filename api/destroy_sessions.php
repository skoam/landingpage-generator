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

function destroy_sessions () {
  global $data, $sql, $errors;

  $response = $sql->delete_sql_data("sessions");

  if ($response == "1") {
    // send_response("maintenaince", $response);
    send_response("maintenaince", "Cleaned up all existing sessions.");
  } else {
    send_response("error", "Error during session cleaning: ".$errors->get_errors());
  }
}

function init () {
  global $sql;

  if (!isset($sql)) {
    send_response("error", "Not authorized to access database.");
    exit(0);
  }

  if ($sql->connected) {
    destroy_sessions();
  }
}

init();