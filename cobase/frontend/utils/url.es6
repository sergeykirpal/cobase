//export function makeQueryString(object) {
//    var ret = [];
//    for (var d in object) {
//        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(object[d]))
//    }
//    return ret.join("&")
//}

export function queryString(params) {
    return `?${makeQueryString(params)}`
}

export function makeQueryString(params){
    var parts = []
    for(let paramName of Object.keys(params)){
        let param = params[paramName]
        if(Array.isArray(param)){
            if(param.length){
                for(let subparam of param){
                    if(typeof subparam == 'object'){
                        subparam = JSON.stringify(subparam)
                    }
                    parts.push(`${encodeURIComponent(paramName)}=${encodeURIComponent(subparam)}`)
                }
            }
        }else{
            parts.push(`${encodeURIComponent(paramName)}=${encodeURIComponent(param)}`)
        }
    }

    return parts.join("&")
}

export function pathMatch(path, pattern) {
    return path.indexOf(pattern) != -1 || path.indexOf((pattern+'/')) != -1
}

export function activeClass(path, pattern, className='active'){
    return pathMatch(path, pattern) ? className : ''
}

export function setHashParam(name, value){
    var hash = getUrlHash()
    var params = $.deparam(hash)
    params[name] = value
    window.location.hash = $.param(params)
}

export function removeHashParam(name){
    var hash = getUrlHash()
    var params = $.deparam(hash)
    if(typeof params[name] != 'undefined'){
        delete params[name]
    }
    window.location.hash = $.param(params)
}

export function getHashParam(name, defaultValue=null){
    var hash = getUrlHash()
    var params = $.deparam(hash)
    var value = params[name]
    if(typeof value == 'undefined'){
        return defaultValue
    }
    return value
}

export function getUrlHash() {
    return window.location.hash.substr(1);
}