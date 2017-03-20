<?php

if (isset($_SESSION["auth"])) {
  header("refresh:0;url=./views/overview.php");
} else {
  header("refresh:0;url=./views/login.php");
}
