import requests
import datetime

API_KEY = "YOUR API KEY"  # Visual Crossing API key

def get_coordinates(place_name):
    try:
        url = f"https://nominatim.openstreetmap.org/search?format=json&q={place_name}"
        res = requests.get(url, headers={"User-Agent": "weather-app"}).json()
        if res:
            return float(res[0]["lat"]), float(res[0]["lon"]), res[0]["display_name"]
        else:
            return None, None, None
    except:
        return None, None, None

def get_ip_location():
    try:
        data = requests.get("https://ipinfo.io/json").json()
        lat, lon = map(float, data["loc"].split(","))
        return lat, lon, data.get("city", "Live Location")
    except:
        return None, None, None

def get_rainfall_report(lat, lon, place_name, base_date):
    report = {
        "location": place_name,
        "date": str(base_date),
        "past_rainfall": [],
        "today_rainfall": None
    }

    for i in range(3, 0, -1):
        day = base_date - datetime.timedelta(days=i)
        url = f"YOUR API"
        try:
            res = requests.get(url).json()
            rain = res["days"][0].get("precip", None)
            if rain is not None:
                rain = round(rain, 1)
                status = "it rained" if rain > 0 else "no rain"
                report["past_rainfall"].append({
                    "date": str(day),
                    "rainfall_mm": rain,
                    "status": status
                })
            else:
                report["past_rainfall"].append({
                    "date": str(day),
                    "rainfall_mm": None,
                    "status": "no data"
                })
        except:
            report["past_rainfall"].append({
                "date": str(day),
                "rainfall_mm": None,
                "status": "error"
            })

    # Today's rainfall
    url_today = f"YOUR API"
    try:
        res = requests.get(url_today).json()
        rain_today = res["days"][0].get("precip", None)
        if rain_today is not None:
            rain_today = round(rain_today, 1)
            forecast_status = "it rained" if rain_today > 0 else "no rain"
            report["today_rainfall"] = {
                "rainfall_mm": rain_today,
                "status": forecast_status
            }
        else:
            report["today_rainfall"] = {
                "rainfall_mm": None,
                "status": "no data"
            }
    except:
        report["today_rainfall"] = {
            "rainfall_mm": None,
            "status": "error"
        }

    return report
