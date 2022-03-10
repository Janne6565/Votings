<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $userAuth = str_replace($notAllowed, '', $_GET['userAuth']);
    $userId = str_replace($notAllowed, '', $_GET['userID']);

    $db_benutzer = '';
    $db_passwort = '';
    $db_name = '';
    $db_server = '';

    $conn = new mysqli($db_server, $db_benutzer, $db_passwort, $db_name);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    $sqlCheckUser = "SELECT * FROM User WHERE ID = '$userId' AND VerifyCode = '$userAuth'";
    $resCheck = $conn -> query($sqlCheckUser);

    $exists = -1;
    foreach ($resCheck as $check){
        $exists = 1;
        echo json_encode(["Status"=>"200","Message"=>"User found", "ID"=>$check["ID"], "Name"=>$check['Name'], "EMail"=>$check['EMail'], "AuthCode"=>$check['VerifyCode']]);
    }
    if ($exists == -1){
        echo json_encode(["Status"=>"400", "Message"=>"User not found"]);
    }
    $conn->close();
?>