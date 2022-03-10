<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $userID = str_replace($notAllowed, "", $_GET['userID']);
    $userAuth = str_replace($notAllowed, "", $_GET['userAuth']);

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
        $sqlCheckUser = "SELECT * FROM Votings WHERE UserID = '$userID'";
        $res = $conn->query($sqlCheckUser);
        $arrayFinal = array();
        foreach ($res as $voting){
          array_push($arrayFinal, ["VotingID"=>$voting["ID"], "Header"=>$voting['Header'], "Description"=>$voting['Description'], "UserID"=>$voting['UserID'], "Color"=>$voting['Color'], "Date"=>$voting['Date'], "CodesAtAll"=>$voting['CodesAll'], "CodesUsed"=>$voting['CodesUsed']]);
        }
        echo json_encode($arrayFinal);
    } else {
        echo json_encode(["Status"=>"400", "Message"=>"User not found"]);
    }

    $conn->close();
?>