Vue.component('color-selector', {
    data: function () {
        return {
            optionsColor: ['rgba(255, 0, 0, 0.3)', 'rgba(0, 0, 255, 0.3)', 'rgba(0, 255, 0, 0.3)', 'rgba(255, 255, 0, 0.3)', 'rgba(0, 255, 255, 0.3)', '#9799CA', '#BD93D8', '#B47AEA'],
        }
    },
    template: `
      <div class="colorSel" v-bind:style="'background-color:' + color + ';'">
        <div v-for="option in optionsColor" @click='color = option' class="colorOne" v-bind:style="'background-color: ' + option + ';'" v-bind:class="{'active' : color == option}"></div>
      </div>
    `,
    watch: {
        color: function() {
            this.$emit('change', this.color)
        }
    },
    methods: {
    },
    created() {
        let rand = Math.round(Math.random() * this.optionsColor.length)
        console.log(rand)
        this.color = this.optionsColor[rand]
    }
    
})

new Vue({
    el: '#app',
    data() {
        return {
            loggedIn: false,
            userData: {
                name: "",
                auth: "",
                id: "",
                email: "",
            },
            messageVoting: "",
            votings: {
                active: [],
                unactive: [],
            },
            createVotingData: {
                name: "",
                color: "red",
                description: "",
                count: "",
                waiting: false,
                options: [
                    {name: "Option 1", image: false, id: 0},
                    {name: "Option 2", image: false, id: 1},
                ],
            }, 
            site: 0,
            color: "",
            indexRn: 2,
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
            if (userId != undefined && userAuth != undefined && userId != "" && userAuth != ""){
                this.checkUser(userId, userAuth)
            } else {
                console.log("not found")
            }
        }, 
        setColor(color) {
            this.color = color
        },
        checkUser(userId, userAuth){
            var self = this
            let xml = new XMLHttpRequest()
            xml.open("GET", "../API/getUserAuth.php?userAuth=" + userAuth + "&userID=" + userId + '&_=' + new Date().getTime())
            xml.send()
            xml.onload = function() {
                console.log(this.response)
                result = JSON.parse(this.response)
                if (result.Status != "400"){
                    self.userData.name = self.firstLetterCap(result.Name)
                    self.userData.auth = result.AuthCode
                    self.userData.id = result.ID
                    self.userData.email = result.EMail
                    self.loggedIn = true
                    console.log(self.userData)
                    self.loadVotings()
                } else {
                    console.log("Not login")
                }
            }
        },
        firstLetterCap(str){
            String.prototype.replaceAt = function(index, replacement) {
                return this.substr(0, index) + replacement + this.substr(index + replacement.length);
            }
            let final = str;
            final = final.replaceAt(0, final.charAt(0).toUpperCase())
            return final;
        },
        loadVotings(){
            let self = this
            self.votings.active = []
            self.votings.unactive = []
            let xhr = new XMLHttpRequest()
            xhr.open("GET", "../API/getVotings.php?userID=" + this.userData.id + "&userAuth=" + this.userData.auth + '&_=' + new Date().getTime())
            xhr.send()
            xhr.onload = function() {
                let res = JSON.parse(this.response)
                for (let elem in res){
                    let element = res[elem]
                    let finalProd = {votingId: element["VotingID"], header: element["Header"], description: element["Description"], color: element["Color"], countCodes: element["CodesAtAll"], voted: element["CodesUsed"], date: element["Date"], votingId: element["VotingID"], results: []}
                    let xhrGetOptions = new XMLHttpRequest()
                    xhrGetOptions.open("GET", "../API/getOptions.php?votingID=" + element.VotingID + '&_=' + new Date().getTime())
                    xhrGetOptions.send()
                    xhrGetOptions.onload = function() {
                        let response = JSON.parse(this.response)
                        if (response.Status != "400"){
                            let results = []
                            for (let i in response) {
                                console.log(i)
                                let res = JSON.parse(response[i])
                                console.log(res)
                                let json = {id:i}
                                if (parseInt(res["Votes"]) != 0){
                                    json["perc"] = parseInt(element["CodesUsed"])/parseInt(res["Votes"]) + "%"
                                } else {
                                    json["perc"] = "0%"
                                }
                                if (res["Type"] == "true") {
                                    json["title"] = "Image " + (parseInt(i) + 1) 
                                } else {
                                    json["title"] = res["Name"]
                                }
                                results.push(json)
                            }
                            finalProd["results"] = results 
                            if (element["CodesAtAll"] > element["CodesUsed"]){
                                self.votings.active.push(finalProd)
                            } else {
                                self.votings.unactive.push(finalProd)
                            }
                        }
                    }
                }
            }
        },
        openVoting(id){
            window.location = "https://projektejwkk.de/votings/voting?id=" + id
        }, 
        sortRes(sort){
            return sort.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))
        },
        checkLink(link) {
            var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i') // fragment locator
            return pattern.test(link)
        },
        createVoting(){
            var self = this
            let userId = self.getCookie("userIDVotings") 
            let userAuth = self.getCookie("userAuthVotings") 
            this.checkUser(userId, userAuth)
            let dodge = false
            let message = ""
            let des = true

            if (this.createVotingData.name.length < 2){
                message = "The name of the Voting has to be atleast 3 characters long"
                dodge = true
            }
            
            if (this.createVotingData.description == ""){
                des = false
            }
            
            if (this.createVotingData.count < 0){
                dodge = true
                message = "The amount of codes cant be negative"
            }

            if (this.createVotingData.options.length < 0){
                dodge = true
                message = "Please enter at least one Option"
            }
            if (dodge) {
                this.messageVoting = message
            } else {
                let xhr = new XMLHttpRequest()
                xhr.open("POST", "../API/addVoting.php" + '?_=' + new Date().getTime())
                let data = new FormData()
                console.log(this.userData)
                data.append("userID", this.userData.id)
                data.append("userAuth", this.userData.auth)
                data.append("votingName", this.createVotingData.name)
                data.append("votingDes", this.createVotingData.description)
                data.append("votingColor", this.color)
                data.append("codeCount", this.createVotingData.count)
                this.createVotingData.count = ""
                this.color = ""
                this.createVotingData.description = ""
                this.createVotingData.name = ""
                this.userData.auth = ""
                this.userData.id = ""
                let broken = false

                for (let obj in self.createVotingData.options){
                    if (self.createVotingData.options[obj].image){
                        if (!self.checkLink(self.createVotingData.options[obj].name)){
                            broken = true
                            self.messageVoting = "Please enter a Valid Link"
                        }
                    }
                }
                if (!broken) {
                    xhr.send(data)
                    self.createVotingData.waiting = true
                    xhr.onload = function() {
                        let response = JSON.parse(this.response)
                        self.createVotingData.waiting = false
                        
                        for (let obj in self.createVotingData.options){
                            let xhr = new XMLHttpRequest()
                            console.log(self.createVotingData.options[obj])
                            xhr.open("POST", "../API/addCandidate.php")
                            let data = new FormData()
                            data.append("userID", self.userData.id)
                            data.append("userAuth", self.userData.auth)
                            data.append("votingID", response['ID'])
                            data.append("name", self.createVotingData.options[obj].name)
                            data.append("type", self.createVotingData.options[obj].image)
                            console.log(self.userData.id)
                            xhr.send(data)
                        }
                    }
                    this.site = 0
                }
            }
            self.loadVotings()
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
