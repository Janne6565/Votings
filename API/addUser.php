<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $userName = str_replace($notAllowed, '', $_POST['userName']);
    $userPassword = password_hash(str_replace($notAllowed, '', $_POST['userPassword']), PASSWORD_DEFAULT);
    $userEmail = str_replace($notAllowed, '', $_POST['userEmail']);

    $db_benutzer = '';
    $db_passwort = '';
    $db_name = '';
    $db_server = '';

    $conn = new mysqli($db_server, $db_benutzer, $db_passwort, $db_name);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    $sqlCheckUserExists = "SELECT * FROM User WHERE EMail = '$userEmail'";
    $exists = -1;
    $resCheck = $conn -> query($sqlCheckUserExists);
    foreach ($resCheck as $check){
        $exists = 1;
    }
    if ($exists == -1){
        $verify = rand(100000000, 999999999);
        $sqlCheckUser = "INSERT INTO `User` (`Name`, `Password`, `EMail`, `VerifyCode`) VALUES ('$userName', '$userPassword', '$userEmail', '$verify');";
        $conn->query($sqlCheckUser);
        $sqlGetId = "SELECT * FROM User WHERE VerifyCode = '$verify' AND Password = '$userPassword' AND EMail = '$userEmail'";
        $res = $conn->query($sqlGetId);
        $id = -1;
        foreach ($res as $user){
            $id = $user['ID'];
        }
        if ($id == -1){
            echo json_encode(["Status"=>"500", "Message"=>"Internal Error, please contact a Moderator"]);
        } else{
            echo json_encode(["Status"=>"200", "Message"=>"User added", "Auth"=>$verify, "ID"=>$id]);
        }
    } else {
        echo json_encode(["Status"=>"400", "Message"=>"Email allready in use"]);
    }
    $conn->close();
?>