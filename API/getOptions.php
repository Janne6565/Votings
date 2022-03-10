<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $votingId = str_replace($notAllowed, "", $_GET['votingID']);

    $db_benutzer = '';
    $db_passwort = '';
    $db_name = '';
    $db_server = '';

    $conn = new mysqli($db_server, $db_benutzer, $db_passwort, $db_name);

    if ($conn->connect_error) {
      die("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT * FROM WahlKandidaten WHERE VotingID = '$votingId'";
    $result = $conn->query($sql);
    $found = -1;
    $founds = array();
    foreach ($result as $user){
      $found = 1;
      array_push($founds, json_encode(["ID"=>$user["ID"], "Name"=>$user["Name"], "Type"=>$user["Type"]]));
    }
    if ($found == -1){
      echo json_encode(["Status"=>"400", "Message"=>"No Options found"]);
    } else {
      echo json_encode($founds);
    }
    $conn->close();
?>