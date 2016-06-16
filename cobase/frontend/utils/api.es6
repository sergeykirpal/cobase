import {queryString, makeQueryString} from 'utils/url.es6'
import {getCookie} from 'utils/cookie.es6'

export function DELETERequest(url, onSuccess=null, onError=null){
    url += '?jssid=1234'

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-type': `application/x-www-form-urlencoded; charset=UTF-8;`,
            'Accept': 'application/json, text/plain, */*',
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include'
    }).then(function(){
        if(typeof onSuccess == 'function'){
            onSuccess()
        }
    }).catch(function(error){
        if(typeof onError == 'function'){
            onError(error)
        }
        console.log(error)
    })
}

export function PUTRequest(url, params=null, onSuccess=null, onError=null){
    if(typeof params != 'string'){
        params = makeQueryString(params)
    }

    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-type': `application/x-www-form-urlencoded; charset=UTF-8;`,
            'Accept': 'application/json, text/plain, */*',
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
        body: params
    }).then(function(response){
        var json = response.json()
        if(!response.ok){
            return json.then(err => {throw err;});
        }else{
           return json
        }
    }).then(function(response){
        if(typeof onSuccess == 'function'){
            onSuccess(response)
        }
    }).catch(function(error){
        if(typeof onError == 'function'){
            onError(error)
        }
        console.log(error)
    })
}

export function POSTRequest(url, params=null, onSuccess=null, onError=null){
    if(typeof params != 'string'){
        params = makeQueryString(params)
    }
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': `application/x-www-form-urlencoded; charset=UTF-8;`,
            'Accept': 'application/json, text/plain, */*',
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
        body: params
    }).then(function(response){
        var json = response.json()
        if(!response.ok){
            return json.then(err => {throw err;});
        }else{
           return json
        }
    }).then(function(response){
        if(typeof onSuccess == 'function'){
            onSuccess(response)
        }
    }).catch(function(error){
        if(typeof onError == 'function'){
            onError(error)
        }
        console.log(error)
    })
}

export function GETRequest(url, params=null, onSuccess=null, onError=null) {
    if(params){
        url += queryString(params)
    }
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-type': `application/json`,
            'Accept': 'application/json, text/plain, */*'
        },
        credentials: 'include'
    }).then(function (response) {
        var json = response.json()

        if (!response.ok) {
            return json.then(err => {
                throw err;
            });
        } else {
            return json
        }
    }).then(function (response) {
        if(typeof onSuccess == 'function'){
            onSuccess(response)
        }
    }).catch(function (error) {
        if(typeof onError == 'function'){
            onError(error)
        }
        console.log(error)
    })
}