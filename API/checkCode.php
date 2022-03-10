<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $votingId = str_replace($notAllowed, '', $_GET['votingID']);
    $code = str_replace($notAllowed, '', $_GET['code']);

    $db_benutzer = '';
    $db_passwort = '';
    $db_name = '';
    $db_server = '';

    $conn = new mysqli($db_server, $db_benutzer, $db_passwort, $db_name);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    $sqlCheckCode = "SELECT * FROM Codes WHERE VotingID = '$votingId' AND Code = '$code' AND Used = 0";
    $resCheck = $conn->query($sqlCheckCode);
    $worked = -1;
    foreach ($resCheck as $code){
        $worked = 1;
    }
    if ($worked == 1){
        echo json_encode(["Status"=>"200", "Message"=>"Code Worked"]);
    } else {
        echo json_encode(["Status"=>"400", "Message"=>"Code didnt work"]);
    }
    $conn->close();
?>