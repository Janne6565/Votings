
Vue.component('color-selector', {
    data: function () {
        return {
            optionsColor: ['rgba(255, 0, 0, 0.3)', 'rgba(0, 0, 255, 0.3)', 'rgba(0, 255, 0, 0.3)', 'rgba(255, 255, 0, 0.3)', 'rgba(0, 255, 255, 0.3)', '#9799CA', '#BD93D8', '#B47AEA'],
            color: "",
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
            author: {},
            loggedIn: false,
            userData: {},
            found: false,
            votingData: {
                options: [],
            },
            belongsMe: false,
            votingId: "",
            error: {
                happened: false,
                message: "",
                code: "",
            },
            votesAll: 1,
            code: "",
            selCand: null,
        }
    },
    watch: {

    },
    methods: {
        createChart(chartId, chartData) {
            const ctx = document.getElementById(chartId);
            const myChart = new Chart(ctx, {
                type: chartData.type,
                data: chartData.data,
                options: chartData.options,
            });
        },
        
        vote(){
            const xhr = new XMLHttpRequest()
            xhr.open("POST", "../api/vote.php")
            const form = new FormData()
            form.append("votingID", this.votingId)
            form.append("code", this.code)
            form.append("candidate", this.selCand)
            xhr.send(form)
            xhr.onload = function() {
                console.log(this.response)
            }
        },

        setColor(color) {
            this.color = color  
        },

        checkLogin(){
            var self = this
            let userId = self.getCookie("userIDVotings") 
            let userAuth = self.getCookie("userAuthVotings") 
            if (userId != undefined && userAuth != undefined && userId != "" && userAuth != ""){
                this.checkUser(userId, userAuth)
            } 
        }, 

        loadChart(result) {
            console.log(result)
            var votesAll = 0
            var dataName = []
            var data = []

            result.forEach(i => {
                data.push(i.Votes)
                dataName.push(i.Name)
                votesAll += parseInt(i.Votes)
            })
            this.votesAll = votesAll
            if (votesAll > 0) {
                var bgColors = palette('tol', dataName.length)
                for (var i in bgColors) bgColors[i] = "#" + bgColors[i]
                var borderColors = palette('tol', dataName.length)
                for (var i in borderColors) borderColors[i] = "#" + borderColors[i]

                var chartData = {
                    type: 'pie',
                    data: {
                        labels: dataName,
                        datasets: [{
                            label: '# of Votes',
                            data: data,
                            backgroundColor: bgColors,
                            borderColor: borderColors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                display: false
                            }
                        }
                    }
                }
                this.createChart("resultChart", chartData)
            }
        },

        checkUser(userId, userAuth){
            var self = this
            let xml = new XMLHttpRequest()
            xml.open("GET", "../API/getUserAuth.php?userAuth=" + userAuth + "&userID=" + userId + '&_=' + new Date().getTime())
            xml.send()
            xml.onload = function() {
                console.log(this.response)
                result = JSON.parse(this.response)
                if (result.Status == "200"){
                    self.userData.name = self.firstLetterCap(result.Name)
                    self.userData.auth = result.AuthCode
                    self.userData.id = result.ID
                    self.userData.email = result.EMail
                    self.loggedIn = true
                    console.log(self.userData)
                    self.loadVoting()
                }
            }
        },

        loadListeners() {
            var header = document.getElementById('votingHeader')
            let self = this
            header.addEventListener("input", function(e) {
                self.votingData.Header = header.innerHTML
                self.updateVoting()
            })
        },

        belongsMyself() {
            this.loadListeners()
        },

        loadVoting(){
            var self = this
            if (self.loggedIn){
                let xhrGetVotings = new XMLHttpRequest()
                xhrGetVotings.open("GET", "../API/getVotingAuth.php?userID=" + self.userData.id + "&userAuth=" + self.userData.auth + "&votingId=" + self.votingId + '&_=' + new Date().getTime())
                xhrGetVotings.send()
                xhrGetVotings.onload = function() {
                    let res = JSON.parse(this.response)
                    if (res.Status == "200") {
                        self.found = true
                        self.belongsMe = true
                        self.votingData = res
                        console.log(res)
                        let date = new Date(parseInt(res.Date) * 1000)
                        self.votingData.Date = new Intl.DateTimeFormat('de-DE', { dateStyle: 'full'}).format(date)

                        let xhrOptions = new XMLHttpRequest()
                        xhrOptions.open("GET", "../API/getOptionsAuth.php?votingID=" + self.votingId + "&userId=" + self.userData.id + "&userAuth=" + self.userData.auth + '&_=' + new Date().getTime())
                        xhrOptions.send()
                        xhrOptions.onload = function() {
                            let res = JSON.parse(JSON.parse(this.response)["Results"])
                            if (JSON.parse(this.response)["Status"] == "200") {
                                let arr = []
                                res.forEach(element => {
                                    arr.push(JSON.parse(element))   
                                });
                                self.votingData.options = arr
                                if (self.belongsMe) {
                                    self.loadChart(self.votingData.options)
                                    self.belongsMyself()
                                }
                            }
                        }
                    } else {
                        let xhrGetVotingNotAuth = new XMLHttpRequest()
                        xhrGetVotingNotAuth.open("GET", "../API/getVoting.php?votingId=" + self.votingId + '&_=' + new Date().getTime())
                        xhrGetVotingNotAuth.send()
                        xhrGetVotingNotAuth.onload = function() {
                            let resp = JSON.parse(this.response)
                            console.log(resp)
                            if (resp.status == "200") {
                                self.votingData = resp
                                let date = new Date(parseInt(resp.Date) * 1000)
                                self.votingData.Date = new Intl.DateTimeFormat('de-DE', { dateStyle: 'full'}).format(date)
                                
                                // Candidates: 
                                let xhrGetVotingCands = new XMLHttpRequest()
                                xhrGetVotingCands.open("GET", "../API/getOptions.php?votingID=" + self.votingId + "&_=" + new Date().getTime())
                                xhrGetVotingCands.send()
                                xhrGetVotingCands.onload = function() {
                                    let response = JSON.parse(this.response)
                                    if (response.Status != "400") {
                                        let listCands = JSON.parse(response)
                                        let listCorrected = []
                                        listCands.forEach(function() {
                                            listCorrected.append(JSON.parse(this))
                                        })
                                        self.cands = listCorrected
                                    } else {
                                        console.log("Error " + response.Status + ": " + response.Message)
                                    }
                                }


                            } else {
                                self.error = resp.Status + ": " +  resp.Message
                            }
                        }
                    }
                    
                }
            }
        },

        

        

        updateVoting() {
            let self = this
            
            let data = new FormData()
            data.append("userID", self.userData.id)
            data.append("userAuth", self.userData.auth)
            data.append("votingId", self.votingData.VotingID)
            data.append("header", self.votingData.Header)
            data.append("color", self.votingData.Color)
            data.append("des", self.votingData.Description)

            let xhr = new XMLHttpRequest()
            xhr.open("POST", "../API/editVoting.php")
            xhr.send(data)
            xhr.onload = function() {
                let res = this.response
                console.log(res)
            }
        },

        setColor() {
            
        },


        // Utils
        firstLetterCap(str){
            String.prototype.replaceAt = function(index, replacement) {
                return this.substr(0, index) + replacement + this.substr(index + replacement.length);
            }
            let final = str;
            final = final.replaceAt(0, final.charAt(0).toUpperCase())
            return final;
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
    mounted(){
        const query = window.location.search
        const urlParams = new URLSearchParams(query)
        this.votingId = urlParams.get('id')
        if (this.votingId == null || this.votingId == "") {
            console.log("Error")
            this.error.happened = true
            this.error.message = "No Voting selected"
            this.error.code = "401"
        }
        this.checkLogin()
        
    }
})
