import {isMobile} from 'utils/environment.es6'

export function guid(){
    return 'xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    })
}

export function truncate(str, mobileMaxLen=12, desctopMaxLen=20){
    if(!str){
        return ''
    }
    var strLen = str.length
    if (str != '') {
        if (isMobile('any')) {
            if (strLen > mobileMaxLen){
                str = str.substring(0,mobileMaxLen)+'...'
            }
        }else {
            if (strLen > desctopMaxLen){
                str = str.substring(0,desctopMaxLen)+'...'
            }
        }
    }
    return str
}

export function extractEmail(string){
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    var result = re.exec(string)
    return result ? result[0] : null
}

export function firstSymbolToUpperCase(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

export function uuid(){
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}
export function integerGuid(min=1000000000000,max=100000000000000000){
    return min + Math.floor(Math.random() * (max - min + 1))
}