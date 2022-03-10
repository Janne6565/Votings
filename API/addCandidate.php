<?php
    $notAllowed = array('"', '<', '>', "'", '\\', '´');
    $userID = str_replace($notAllowed, "", $_POST['userID']);
    $userAuth = str_replace($notAllowed, "", $_POST['userAuth']);
    $votingID = str_replace($notAllowed, "", $_POST['votingID']);
    $name = str_replace($notAllowed, "", $_POST['name']);
    $type = str_replace($notAllowed, "", $_POST['type']);

    $db_benutzer = '';
    $db_passwort = '';
    $db_name = '';
    $db_server = '';

    $conn = new mysqli($db_server, $db_benutzer, $db_passwort, $db_name);

    if ($conn->connect_error) {
      die("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT * FROM User WHERE ID = '$userID' AND VerifyCode = '$userAuth'";
    $result = $conn->query($sql);
    $found = -1;
    foreach ($result as $user){
      $found = 1;
    }
    
    if ($found == 1){
        $sqlCheckUser = "SELECT * FROM Votings WHERE UserID = '$userID' AND ID = '$votingID'";
        $res = $conn->query($sqlCheckUser);
        $arrayFinal = array();
        foreach ($res as $voting){
            $sqlAddCand = "INSERT INTO WahlKandidaten (`Name`, `Stimmen`, `Type`, `VotingID`) VALUES ('$name', 0, '$type', '$votingID');";
            $conn->query($sqlAddCand);
        }
        echo json_encode(["Status"=>"201", "Message"=>"Successfully added"]);
    } else {
        echo json_encode(["Status"=>"400", "Message"=>"User not found"]);
    }

    $conn->close();
?>