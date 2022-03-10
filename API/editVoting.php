<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $userID = str_replace($notAllowed, "", $_POST['userID']);
    $userAuth = str_replace($notAllowed, "", $_POST['userAuth']);
    $votingId = str_replace($notAllowed, "", $_POST['votingId']);
    $header = str_replace($notAllowed, "", $_POST['header']);
    $des = str_replace($notAllowed, "", $_POST['des']);
    $color = str_replace($notAllowed, "", $_POST['color']);

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
        $sqlCheckUser = "UPDATE Votings SET Header = '$header', Description = '$des', Color = '$color' WHERE ID = $votingId AND UserID = '$userID'";
        $res = $conn->query($sqlCheckUser);
        if ($res === true){
            echo json_encode(["Status"=>"200", "Message"=>"Voting Updated"]);
        }
        else {
            echo json_encode(["Status"=>"401", "Message"=>"Voting not found"]);
        }
    } else {
        echo json_encode(["Status"=>"400", "Message"=>"User not found"]);
    }

    $conn->close();
?>