<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $userPassword = str_replace($notAllowed, '', $_GET['userPassword']);
    $userEmail = str_replace($notAllowed, '', $_GET['userEmail']);

    $db_benutzer = '';
    $db_passwort = '';
    $db_name = '';
    $db_server = '';

    $conn = new mysqli($db_server, $db_benutzer, $db_passwort, $db_name);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    $sql = "SELECT * FROM User WHERE EMail = '$userEmail'";
    $res = $conn -> query($sql);
    $found = -1;
    foreach ($res as $result) {
        if (password_verify($userPassword, $result['Password'])){ 
            echo json_encode(["Status"=>"200", "Message"=>"User found", "ID"=>$result['ID'], "Email"=>$result['EMail'], "Auth"=>$result["VerifyCode"], "Name"=>$result['Name']]);
            $found = 1;
        } else {
        }
    }
    if ($found == -1) {
        echo json_encode(["Status"=>"400", "Message"=>"User not found"]);
    }
    $conn->close();
?>