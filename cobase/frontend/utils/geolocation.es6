export class Geolocation {
    static getCurrentCoordinates(callback, onError){
        return Bridge.getCurrentPosition(callback, onError);
    }

    static supportGeolocaton(){
        if (window.iOS && window.iOS.getCurrentPosition) {
            return true;
        }
        return Boolean(navigator.geolocation)
    }
}