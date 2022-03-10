<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $code = str_replace($notAllowed, '', $_POST['code']);
    $votingID = str_replace($notAllowed, '', $_POST['votingID']);
    $userAuth = str_replace($notAllowed, '', $_POST['userAuth']);
    $userId = str_replace($notAllowed, '', $_POST['userID']);

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
        $checkVoting = "SELECT * FROM Votings WHERE ID = '$votingID' AND UserID = '$userId'";
        $resVotings = $conn->query($checkVoting);
        $votings = -1;
        foreach ($resVotings as $voting){
            $votings = 1;
        }
        if ($votings == 1){
            $sqlCheckCode = "SELECT * FROM Codes WHERE VotingID = '$votingID' AND Code = '$code'";
            $codesSame = $conn->query($sqlCheckCode);
            if (count($codesSame) < 1){
                $sqlIfWorks = "INSERT INTO `Codes` (`Used`, `Code`, `VotingID`) VALUES ('0', '$code', '$votingID')";
                echo json_encode(["Status"=>"200", "Message"=>"Success"]);
                $conn->query($sqlIfWorks);
            } else {
                echo json_encode(["Status"=>"410", "Message"=>"Code allready set"]);
            }
        } else {
            echo json_encode(["Status"=>"401", "Message"=>"Voting not found"]);
        }
    }
    if ($userFound == -1){
        echo json_encode(["Status"=>"402", "Message"=>"User not found"]);
    }
    $conn->close();
?>