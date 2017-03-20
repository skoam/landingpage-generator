<?php

if (!isset($_GET["key"])) {
  exit(0);
}

$location = "https://localhost/loc/key-account-management";

function post($url = null, $data = null, $returnHeaders = false) {
  $header = array();

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

  if ($returnHeaders) {
    curl_setopt($ch, CURLOPT_HEADER, true);
  }

  $result = curl_exec($ch);

  curl_close($ch);
  return $result;
}

function create_session () {
  global $location;

  $session = post($location . "/api/get_session.php", array(
    "key" => urlencode(base64_encode($_GET["key"]))
  ), false);

  return json_decode($session)->text;
}

$session = create_session();

$response = json_decode(post($location . "/api/destroy_sessions.php", array(
  "session" => $session
), false));

echo $response->text;
