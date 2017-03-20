<?php

# ini_set('display_errors',1);
# error_reporting(E_ALL);

class Errors {
  public $errors = array();
  public $good_errors = array();
  public $log_entries = array();
  public $log = true;

  function get_errors () {
    $output = "";
    for ($i = 0; $i < sizeOf($this->errors); $i++) {
      $output .= "<div class='log-entry'>".$this->errors[$i]."</div>";
    }
    return $output;
  }

  function print_errors () {
    for ($i = 0; $i < sizeOf($this->errors); $i++) {
      echo $this->errors[$i];
    }
  }

  function log_errors () {
    for ($i = 0; $i < sizeOf($this->errors); $i++) {
      error_log($this->errors[$i]);
    }
  }

  function add_error ($error) {
    array_push($this->errors, timestamp()." ".$error);
  }

  function add_good_error ($good_error) {
    array_push($this->good_errors, timestamp()." ".$good_error);
  }

  function get_good_errors () {
    $output = "";
    for ($i = 0; $i < sizeOf($this->good_errors); $i++) {
      $output .= "<div class='log-entry'>".$this->good_errors[$i]."</div>";
    }

    return $output;
  }

  function log_good_errors () {
    error_log($this->get_good_errors());
  }

  function print_good_errors () {
    for ($i = 0; $i < sizeOf($this->good_errors); $i++) {
      echo $this->good_errors[$i];
    }
  }

  function add_log_entry ($entry) {
    array_push($this->log_entries, timestamp()." ".$entry);
  }

  function get_log_entries () {
    $output = "";
    for ($i = 0; $i < sizeOf($this->log_entries); $i++) {
      $output .= "<div class='log-entry'>".$this->log_entries[$i]."</div>";
    }
    return $output;
  }

  function log_log_entries () {
    error_log($this->get_log_entries());
  }

  function print_log_entries () {
    for ($i = 0; $i < sizeOf($this->log_entries); $i++) {
      echo $this->log_entries[$i];
    }
  }

  function get_all () {
    $output = "";
    $output .= $this->get_log_entries();
    $output .= $this->get_good_errors();
    $output .= $this->get_errors();
    return $output;
  }

  function print_all () {
    $this->print_log_entries();
    $this->print_good_errors();
    $this->print_errors();
  }

  function log_all () {
    $this->log_log_entries();
    $this->log_good_errors();
    $this->log_errors();
  }
}

$errors = new Errors();
