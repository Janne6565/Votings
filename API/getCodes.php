<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $votingID = str_replace($notAllowed, '', $_GET['votingID']);
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
    $resUser = $conn->query($sqlCheckUser);
    $userFound = -1;
    foreach ($resUser as $user){
        $userFound = 1;
        $checkVoting = "SELECT * FROM Codes WHERE VotingID = '$votingID'";
        $resVotings = $conn->query($checkVoting);
        $votings = -1;
        $arrayCodes = array();
        foreach ($resVotings as $voting){
            array_push($arrayCodes, ["ID"=>$voting["ID"], "Code"=>$voting["Code"]]);
            $votings = 1;
        }
        if ($votings == 1){
            echo json_encode($arrayCodes);
        } else {
            echo json_encode(["Status"=>"401", "Message"=>"No Codes found"]);
        }
    }
    if ($userFound == -1){
        echo json_encode(["Status"=>"402", "Message"=>"User not found"]);
    }
    $conn->close();
?>