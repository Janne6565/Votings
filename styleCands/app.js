new Vue({
    el: "#app", 
    data() {
        return {
            color: "rgba(0,0,0,0)",
            list: [{"Header":"Janne Keipert", "background":color, "id":"0"}, {"Header":"Janne Keipert", "background":color, "id":"1"}, {"Header":"Janne Keipert", "background":color, "id":"2"} ,{"Header":"Janne Keipert", "background":color, "id":"3"}],
            selected: null,
        }
    },
    methods: {
        select(index) {
            
        } 
    }
})