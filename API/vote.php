<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $votingId = str_replace($notAllowed, '', $_POST['votingID']);
    $code = str_replace($notAllowed, '', $_POST['code']);
    $candidate = str_replace($notAllowed, '', $_POST['candidate']);

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
        $sqlVote = "UPDATE `WahlKandidaten` SET `Stimmen` = Stimmen + 1 WHERE `ID` = $candidate AND VotingID = '$votingId'";
        $sqlUseCode = "DELETE FROM `Codes` WHERE Code = $code";
        $sqlCodeUsedVoting = "UPDATE Votings SET CodesUsed = CodesUsed + 1 WHERE ID = '$votingId'";
        $conn->query($sqlCodeUsedVoting);
        $conn->query($sqlUseCode);
        $conn->query($sqlVote);
        echo json_encode(["Status"=>"200", "Message"=>"Worked"]);
    } else {
        echo json_encode(["Status"=>"400", "Message"=>"Code didnt work"]);
    }
    $conn->close();
?>