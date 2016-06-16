import SockJS from 'sockjs-client';

export class WebSocketsManager{
    constructor(options){
        this.socketInterval =null;
        this.connection =null;
        this.eventSuscribers = {}
    }

    addEventSuscriber(key, obj){
        return this.eventSuscribers[key] = obj
    }

    removeEventSuscriber(key){
        delete this.eventSuscribers[key]
    }

    createConnection(url){
        var self = this;
        var sockjs = new SockJS(url, {jsessionid:true});
        sockjs.onopen = function () {
            clearInterval(self.socketInterval);
            console.log('SockJS opened connection');
        };
        sockjs.onclose = function () {
            self.socketInterval = setTimeout(function(){
                self.createConnection(url, onmessage)
            }, 5000);
            console.log('SockJS closed connection');
        };
        sockjs.onerror = function(ev) {
            console.log('SockJS error' + ev.data);
        };
        sockjs.onmessage = function(ev) {
            var needLog = typeof ev.data.log == 'undefined' || ev.data.log
            if(needLog){
                console.log('SockJS new event: ' + ev.data.type);
                console.log(ev);
            }

            for(let key of Object.keys(self.eventSuscribers)){
                var suscriber = self.eventSuscribers[key]
                if(typeof suscriber !== 'undefined'){
                    if(typeof suscriber == 'function'){
                        suscriber(ev.data.type, ev.data, ev.timeStamp)
                    }else{
                        suscriber.event(ev.data.type, ev.data, ev.timeStamp)
                    }
                }
            }
        };
        this.connection = sockjs;
        return this.connection
    }

    getConnection(){
        return this.connection
    }
}
