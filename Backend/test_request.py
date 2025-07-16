import requests
import json

URL = "http://127.0.0.1:5000/weather"
DATA = {
    "location": "delhi",
    "date": "2025-07-08"
}

print("📤 Sending request to Flask server...")

try:
    res = requests.post(URL, json=DATA, timeout=120)

    print("\n📦 Raw Response Text:")
    print(res.text)  # Full raw response for debugging

    result = res.json()

    if result["status"] == "success":
        data = result["data"]

        print("\n📡 RAINFALL REPORT:")
        print(json.dumps(data.get("rainfall_report", {}), indent=2))

        print("\n🛰️ SATELLITE IMAGE:")
        print(json.dumps(data.get("satellite_image", {}), indent=2))

        print("\n🌱 SOIL CONDITION:")
        print(json.dumps(data.get("soil_condition", {}), indent=2))

        print("\n🌤️ WEATHER DETAILS:")
        print(json.dumps(data.get("weather_details", {}), indent=2))

        print("\n📊 WEEKLY TEMPERATURE SUMMARY:")
        print(json.dumps(data.get("weekly_summary", {}), indent=2))

    else:
        print("❌ Error:", result.get("message"))

except requests.exceptions.Timeout:
    print("❌ Request timed out.")
except Exception as e:
    print("❌ Exception occurred:", str(e))
