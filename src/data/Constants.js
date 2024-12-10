let BACKEND_URL = "http://127.0.0.1:8000/"
let STRAVA_URL = "https://www.strava.com/oauth/authorize?client_id=142165&response_type=code&redirect_uri=http://localhost:3000/myTrainings/"
let STRAVA_URL_2 = "&scope=read,activity:read"

export function getUrl() {
    return BACKEND_URL;
}

export function getStravaUrl() {
    return STRAVA_URL;
}

export function getStravaUrl2() {
    return STRAVA_URL_2;
}