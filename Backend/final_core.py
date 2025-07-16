import requests
from datetime import datetime
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from rain_status import get_rainfall_report
from satellite_image import generate_satellite_image
from soil_condition import estimate_soil_condition
from weather_details import get_weather_details
from weekly_temperature import get_weekly_temperature
import os

# 🌍 Convert location name to coordinates using Nominatim
def location_to_coordinates(place_name):
    try:
        geolocator = Nominatim(user_agent="climora_app", timeout=10)
        location = geolocator.geocode(place_name)
        if location:
            lat, lon = location.latitude, location.longitude
            full_place = location.address
            return lat, lon, full_place
        else:
            return None, None, None
    except GeocoderTimedOut:
        print("⚠️ Geocoding request timed out.")
        return None, None, None
    except Exception as e:
        print(f"❌ Error resolving location: {e}")
        return None, None, None

# 📈 Get hourly forecast using Open-Meteo
def get_hourly_forecast(lat, lon, date):
    try:
        formatted_date = date.strftime("%Y-%m-%d")
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&hourly=temperature_2m,weathercode"
            f"&start_date={formatted_date}&end_date={formatted_date}"
            f"&timezone=auto"
        )

        res = requests.get(url, timeout=30)
        res.raise_for_status()
        data = res.json()

        hourly_data = []
        timestamps = data["hourly"]["time"]
        temperatures = data["hourly"]["temperature_2m"]
        weathercodes = data["hourly"]["weathercode"]

        for i in range(len(timestamps)):
            time_str = timestamps[i].split("T")[1][:5]
            hourly_data.append({
                "time": time_str,
                "temperature": round(temperatures[i], 1),
                "icon_code": weathercodes[i]
            })

        return hourly_data

    except Exception as e:
        print(f"❌ Error in get_hourly_forecast: {e}")
        return [{
            "time": "N/A",
            "temperature": None,
            "icon_code": None,
            "error": str(e)
        }]

# 🎯 Master controller to call all modules
def generate_weather_report(location, date):
    try:
        lat, lon, full_place = location_to_coordinates(location)
        if not lat or not lon:
            return {"status": "error", "message": "Invalid location"}

        import time

        print("📱 Calling get_rainfall_report...")
        start = time.time()
        rainfall = get_rainfall_report(lat, lon, full_place, date)
        print("⏱️ Rainfall done in", round(time.time() - start, 2), "s")

        print("🚁 Calling generate_satellite_image...")
        start = time.time()
        satellite = generate_satellite_image(lat, lon, date)
        print("⏱️ Satellite done in", round(time.time() - start, 2), "s")

        # ✅ Ensure satellite image path exists
        image_path = satellite.get("image_path")
        if image_path and os.path.exists(image_path):
            satellite["image_url"] = f"/images/{os.path.basename(image_path)}"
        else:
            print("⚠️ Warning: Satellite image file not found.")
            satellite["image_url"] = None

        print("🌱 Calling estimate_soil_condition...")
        start = time.time()
        soil = estimate_soil_condition(lat, lon, date)
        print("⏱️ Soil condition done in", round(time.time() - start, 2), "s")

        print("🌤️ Calling get_weather_details...")
        start = time.time()
        weather = get_weather_details(lat, lon, full_place, date)
        print("⏱️ Weather details done in", round(time.time() - start, 2), "s")

        print("📊 Calling get_weekly_temperature...")
        start = time.time()
        weekly = get_weekly_temperature(lat, lon, full_place, date)
        print("⏱️ Weekly summary done in", round(time.time() - start, 2), "s")

        print("⏰ Calling get_hourly_forecast...")
        start = time.time()
        hourly = get_hourly_forecast(lat, lon, date)
        print("⏱️ Hourly forecast done in", round(time.time() - start, 2), "s")

        return {
            "status": "success",
            "rainfall_report": rainfall,
            "satellite_image": satellite,
            "soil_condition": soil,
            "weather_details": weather,
            "weekly_summary": weekly,
            "hourly_forecast": hourly
        }

    except Exception as e:
        print(f"❌ Error in generate_weather_report: {e}")
        return {"status": "error", "message": str(e)}
