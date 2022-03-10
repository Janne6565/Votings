new Vue({
    el: '#app',
    data() {
        return {
            loggedIn: false,
            registerData: {
                name: "",
                password: "",
                email: "", 
            },
            loginData: {
                email: "",
                password: "",
            },
            warningLog: "",
            warningReg: "",
        }
    },
    watch: {
        loggedIn: function() {
            if (loggedIn){
                this.loggedIn();
            }
        },
    },
    methods: {
        checkLogin(){
            var self = this
            let userId = self.getCookie("userIDVotings") 
            let userAuth = self.getCookie("userAuthVotings") 
            if (userId != undefined && userAuth != undefined){
                this.checkUser(userId, userAuth)
            }
        },
        navigateLogged() {
            window.location += "account"
        },
        checkUser(userId, userAuth){
            var self = this
            let xml = new XMLHttpRequest()
            xml.open("GET", "./API/getUserAuth.php?userAuth=" + userAuth + "&userID=" + userId + '&_=' + new Date().getTime())
            xml.send()
            xml.onload = function() {
                result = JSON.parse(this.response)
                console.log(result)
                if (result.Status != "400"){
                    self.loggedIn = true
                    self.navigateLogged()
                } else {
                    console.log("Not login")
                }
            }
        },
        isEmail(email) {
            return /^(([^<>()[\]\\.,:\s@\"]+(\.[^<>()[\]\\.,:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
        },
        register(){
            var self = this
            var data = this.registerData
            let valid = true
            self.warningReg = ""
            if (data.password.length < 6){
                self.warningReg = "Password has to be at least 6 characters long"
                valid = false
            } 
            if (self.isEmail(data.email) == false){
                self.warningReg = "Please enter a valid Email"
                valid = false
            }
            if (data.name.length < 5){
                self.warningReg = "Your name has to be at least 5 characters long"
            }
            if (valid){
                self.warningReg = ""
                let xhr = new XMLHttpRequest()
                let dataReg = new FormData()
                dataReg.append("userEmail", self.registerData.email)
                dataReg.append("userName", self.registerData.name)
                dataReg.append("userPassword", self.registerData.password)
                xhr.open("POST", "./API/addUser.php" + '?_=' + new Date().getTime())
                xhr.send(dataReg)
                xhr.onload = function() {
                    let res = JSON.parse(this.response)
                    console.log(res)
                    if (res.Status == "400"){
                        self.warningReg = res.Message
                    } else {
                        console.log(res)
                        self.setCookie("userIDVotings", res.ID, 90)
                        self.setCookie("userAuthVotings", res.Auth, 90)
                        self.loggedIn = true
                        self.navigateLogged()
                    }
                }
            }
        },
        login(){
            var self = this 
            let xhr = new XMLHttpRequest()
            let data = new FormData()
            xhr.open("GET", "./API/getUser.php?userEmail=" + this.loginData.email + "&userPassword=" + this.loginData.password + '&_=' + new Date().getTime())
            xhr.send(data)
            xhr.onload = function() {
                let res = JSON.parse(this.response)
                if (res.Status == 200) {
                    self.setCookie("userIDVotings", res.ID, 90)
                    self.setCookie("userAuthVotings", res.Auth, 90)
                    console.log("🎉 Logged In")
                    self.navigateLogged()
                } else {
                    self.warningLog = "User not found"
                }
            }
        },
        setCookie(cname, cvalue, exdays) {
            const d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            let expires = "expires="+ d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;samesite=strict";
        },
        getCookie(cname) {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for(let i = 0; i <ca.length; i++) {
              let c = ca[i];
              while (c.charAt(0) == ' ') {
                c = c.substring(1);
              }
              if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
              }
            }
            return "";
          },
    },
    watch: {
       
    },
    created(){
        this.checkLogin()
    }
})