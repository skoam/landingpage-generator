<?php

class DataTypes {
  public $int = "int";
  public $string = "varchar(255)";
  public $date = "datetime";
  public $bool = "bit";
  public $text = "Text";
}

$datatypes = new DataTypes();

class Sql {
  public $host = 'host';
  public $db_name = 'database name';
  public $username = 'username';
  public $pwd = 'pwd';
  public $port = "";
  public $encoded = false;

  public $connected = false;
  public $db = "this variable will hold the sql db connection (mysqli)";

  function remove_sql_table($table_name) {
    global $errors;

    $statement = "DROP TABLE ".$this->db->real_escape_string($table_name);

    $result = $this->db->query($statement);

    $errors->add_log_entry("Executed SQL: ".$statement);

    if (!$result) {
      $errors->add_error("Cannot remove TABLE ".$table_name.":".$this->db->error);
    } else {
      $errors->add_good_error("Successfully removed table ".$table_name);
    }

    return $result;
  }

  function create_sql_table($table_name, $rows) {
    global $errors;

    $statement = "CREATE TABLE ".$this->db->real_escape_string($table_name)." (";

    for ($i = 0; $i < sizeOf($rows); $i++) {
      if ($i !== sizeOf($rows) - 1) {
        $statement .= $this->db->real_escape_string($rows[$i]).",";
      } else {
        $statement .= $this->db->real_escape_string($rows[$i]);
      }
    }

    $statement .= ")";

    $result = $this->db->query($statement);

    $errors->add_log_entry("Executed SQL: ".$statement);

    if (!$result) {
      $errors->add_error("Cannot create TABLE ".$table_name.":".$this->db->error);
    } else {
      $errors->add_good_error("Successfully created table ".$table_name);
    }

    return $result;
  }

  function update_sql_data($table_name, $field, $value, $updates) {
    global $errors;

    $statement = "UPDATE ".$this->db->real_escape_string($table_name)." SET ";

    foreach ($updates as $key=>$content) {
      $statement .= $this->db->real_escape_string($key)."='".$this->db->real_escape_string($content)."', ";
    }

    $statement = rtrim($statement, ', ');

    $statement .= " WHERE ".$this->db->real_escape_string($field)."='".$this->db->real_escape_string($value)."';";

    $result = $this->db->query($statement);
    $errors->add_log_entry("Executed SQL: ".$statement);

    if (!$result) {
      $errors->add_error("Cannot update data from ".$table_name.":".$this->db->error);
    } else {
      $errors->add_good_error("Successfully updated data on field ".$field." in table ".$table_name);
    }

    return $result;
  }

  function insert_sql_data($table_name, $fields) {
    global $errors;

    $statement = "INSERT INTO ".$this->db->real_escape_string($table_name)." (";

    foreach ($fields as $column=>$value) {
      $statement .= $this->db->real_escape_string($column).",";
    }

    $statement = rtrim($statement, ',');

    $statement .= ") VALUES (";

    foreach ($fields as $column=>$value) {
      $statement .= "'".$this->db->real_escape_string($value)."',";
    }

    $statement = rtrim($statement, ',');

    $statement .= ")";

    $result = $this->db->query($statement);
    $errors->add_log_entry("Executed SQL: ".$statement);

    if (!$result) {
      $errors->add_error("Cannot insert data into ".$table_name.":".$this->db->error);
    } else {
      $errors->add_good_error("Successfully inserted data into table ".$table_name);
    }

    return $result;
  }

  function get_sql_data($table_name, $additions = "") {
    global $errors;

    $statement = "SELECT * FROM ".$this->db->real_escape_string($table_name)." ".$additions;

    $result = $this->db->query($statement);
    $errors->add_log_entry("Executed SQL: ".$statement);

    if (!$result) {
      $errors->add_error("Cannot get data from ".$table_name.":".$this->db->error);
    } else {
      $errors->add_good_error("Successfully queried data from table ".$table_name);
    }

    $all_data = array();

    try {
      if (gettype($result) != "object") {
        throw new Exception ('"Nothing was returned"');
      }

      while ($row = $result->fetch_object()) {
        array_push($all_data, $row);
      }
    } catch (Exception $e) {
      $errors->add_error("Cannot get data from ".$table_name.", got ".$e." instead.");
    }

    return $all_data;
  }

  function delete_sql_data($table_name, $additions = "") {
    global $errors;

    $statement = "DELETE FROM ".$this->db->real_escape_string($table_name)." ".$additions;

    $result = $this->db->query($statement);
    $errors->add_log_entry("Executed SQL: ".$statement);

    if (!$result) {
      $errors->add_error("Cannot delete data from ".$table_name.":".$this->db->error);
    } else {
      $errors->add_good_error("Successfully deleted data from table ".$table_name);
    }

    return $result;
  }
}
