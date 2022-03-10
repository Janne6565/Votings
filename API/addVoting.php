<?php
    $notAllowed = array('"', '<', '>', "'", '\\');
    $userID = str_replace($notAllowed, "", $_POST['userID']);
    $userAuth = str_replace($notAllowed, "", $_POST['userAuth']);
    $votingHeader = str_replace($notAllowed, "", $_POST['votingName']);
    $votingDes = str_replace($notAllowed, "", $_POST['votingDes']);
    $votingColor = str_replace($notAllowed, "", $_POST['votingColor']);
    $codeCount = str_replace($notAllowed, "", $_POST['codeCount']);

    $date = mktime();

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
        $sqlCheckUser = "INSERT INTO `Votings` (`Header`, `Description`, `UserID`, `Color`, `Date`, `CodesAll`) VALUES ('$votingHeader', '$votingDes', '$userID', '$votingColor', '$date', '$codeCount');";
        $conn->query($sqlCheckUser);
        $votingId = $conn->insert_id;
        for ($i = 0; $i < $codeCount; $i ++){
          $num = rand(1000000, 9999999);
          $sqlCheckCode = "SELECT * FROM Codes WHERE Code = '$num' AND VotingID = '$votingId'";
          $resCheck = $conn->query($sqlCheckCode);
          if (mysqli_fetch_lengths($resCheck) == 0){
            $sqlCreateCode = "INSERT INTO Codes (Used, Code, VotingID) VALUES ('0', '$num', '$votingId')";
            $conn->query($sqlCreateCode);
          } else {
            $i -= 1;
          }
        }
        echo json_encode(["Status"=>"200", "Message"=>"Successfully added", "ID"=>$votingId]);
    } else {
        echo json_encode(["Status"=>"400", "Message"=>"User not found"]);
    }

    $conn->close();
?>