document.getElementById('search-button').addEventListener('click', fetchWeather);
const apiKey = "124b92a8dd9ec01ffb0dbf64bc44af3c";
const translations = {
    en: {
        temperature: "Temperature",
        condition: "Condition",
        humidity: "Humidity",
        windSpeed: "Wind Speed",
        high: "High",
        low: "Low",
        clear: "Clear",
        cloudy: "Cloudy",
        rainy: "Rainy",
        snowy: "Snowy",
        geolocationNotSupported: "Geolocation is not supported by this browser.",
        permissionDenied: "User denied the request for Geolocation.",
        positionUnavailable: "Location information is unavailable.",
        timeout: "The request to get user location timed out.",
        unknownError: "An unknown error occurred."
    },
    es: {
        temperature: "Temperatura",
        condition: "Condición",
        humidity: "Humedad",
        windSpeed: "Velocidad del Viento",
        high: "Alta",
        low: "Baja",
        clear: "Despejado",
        cloudy: "Nublado",
        rainy: "Lluvioso",
        snowy: "Nevado",
        geolocationNotSupported: "La geolocalización no es compatible con este navegador.",
        permissionDenied: "El usuario negó la solicitud de geolocalización.",
        positionUnavailable: "La información de ubicación no está disponible.",
        timeout: "La solicitud para obtener la ubicación del usuario agotó el tiempo.",
        unknownError: "Ocurrió un error desconocido."
    }
};

let currentLanguage = 'en';

async function fetchWeather() {
    const city = document.getElementById('city-input').value;
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching the weather data:', error);
    }
}

function displayWeather(data) {
    const locationElement = document.getElementById('location');
    const currentWeatherElement = document.getElementById('current-weather');
    const weatherContainer = document.getElementById('weather-container');

    const currentWeather = data.list[0];
    locationElement.textContent = `${data.city.name}, ${data.city.country}`;
    currentWeatherElement.innerHTML = `
        <div id="current-temperature">${translations[currentLanguage].temperature}: ${currentWeather.main.temp}°C</div>
        <div id="weather-condition">${translations[currentLanguage].condition}: ${currentWeather.weather[0].description}</div>
        <div id="humidity">${translations[currentLanguage].humidity}: ${currentWeather.main.humidity}%</div>
        <div id="wind-speed">${translations[currentLanguage].windSpeed}: ${currentWeather.wind.speed} m/s</div>
        <img id="weather-icon" src="http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png" alt="Weather Icon">
    `;

    weatherContainer.innerHTML = '';

    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const dayForecast = document.createElement('div');
        dayForecast.classList.add('day-forecast');
        dayForecast.innerHTML = `
            <h3>${new Date(forecast.dt_txt).toLocaleDateString()}</h3>
            <p>${forecast.weather[0].description}</p>
            <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
            <p>${translations[currentLanguage].high}: ${forecast.main.temp_max}°C</p>
            <p>${translations[currentLanguage].low}: ${forecast.main.temp_min}°C</p>
        `;
        weatherContainer.appendChild(dayForecast);
    }

    changeBackground(currentWeather.weather[0].description.toLowerCase());
}

document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);

    document.getElementById('languages').addEventListener('change', changeLanguage);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('location').innerText = translations[currentLanguage].geolocationNotSupported;
    }
});

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('current-time').innerText = timeString;
}

function changeLanguage() {
    currentLanguage = document.getElementById('languages').value;
    console.log('Language changed to:', currentLanguage);
    fetchWeather(); 
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    document.getElementById('location').innerText = `Latitude: ${lat}, Longitude: ${lon}`;
    fetchWeatherByCoords(lat, lon);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById('location').innerText = translations[currentLanguage].permissionDenied;
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById('location').innerText = translations[currentLanguage].positionUnavailable;
            break;
        case error.TIMEOUT:
            document.getElementById('location').innerText = translations[currentLanguage].timeout;
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById('location').innerText = translations[currentLanguage].unknownError;
            break;
    }
}

function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => console.error('Error fetching weather data:', error));
}

function changeBackground(weatherCondition) {
    const body = document.body;
    switch (weatherCondition) {
        case 'clear sky':
            body.style.backgroundColor = '#ffcc00'; 
            break;
        case 'few clouds':
        case 'scattered clouds':
        case 'broken clouds':
        case 'overcast clouds':
            body.style.backgroundImage = '#d3d3d3'; 
            break;
        case 'shower rain':
        case 'rain':
        case 'thunderstorm':
            body.style.backgroundColor = '#708090'; 
            break;
        case 'snow':
            body.style.backgroundColor = '#ffffff'; 
            break;
        default:
            body.style.backgroundColor = '#f0f0f0'; 
            break;
    }
}

