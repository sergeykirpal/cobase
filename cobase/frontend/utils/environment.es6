export function isMobile(key) {

    var data = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        }
    }

    if(key == 'any'){
        return (data['Android']() || data.BlackBerry() || data.iOS() || data.Opera() || data.Windows())
    }

    if(typeof data[key] == 'function'){
        return data[key]()
    }

    return null
}

export function getScrollPos(){
    var ScrollTop = document.body.scrollTop;

    if (ScrollTop == 0)
    {
        if (window.pageYOffset)
            ScrollTop = window.pageYOffset;
        else
            ScrollTop = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
    }

    return ScrollTop
}



