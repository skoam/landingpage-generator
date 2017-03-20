<?php

define('SNIPPETS_LOCATION', "../views/raw/snippets/");

function get_snippet ($name) {
  $snippet = fopen(SNIPPETS_LOCATION.$name, 'r');
  $output = stream_get_contents($snippet);
  fclose($snippet);

  return $output;
}