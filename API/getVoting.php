<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $userID = str_replace($notAllowed, "", $_GET['userID']);
    $userAuth = str_replace($notAllowed, "", $_GET['userAuth']);
    $votingId = str_replace($notAllowed, "", $_GET['votingId']);

    $db_benutzer = '';
    $db_passwort = '';
    $db_name = '';
    $db_server = '';

    $conn = new mysqli($db_server, $db_benutzer, $db_passwort, $db_name);

    if ($conn->connect_error) {
      die("Connection failed: " . $conn->connect_error);
    }

    $sqlCheckUser = "SELECT * FROM Votings WHERE ID = $votingId";
    $res = $conn->query($sqlCheckUser);
    $foundVoting = -1;
    foreach ($res as $voting){
        $foundVoting = 1;
        echo json_encode(["Status"=>"200", "Message"=>"Voting Found", "VotingID"=>$voting["ID"], "Header"=>$voting['Header'], "Description"=>$voting['Description'], "UserID"=>$voting['UserID'], "Color"=>$voting['Color'], "Date"=>$voting['Date']]);
    }
    if ($foundVoting === -1){
        echo json_encode(["Status"=>"401", "Message"=>"Voting not found"]);
    }
    
    $conn->close();
?>