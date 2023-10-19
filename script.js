const form = document.forms["form"] 
form.addEventListener("submit", getWeather)

const weatherContent = document.querySelector("#weatherContent")
const errorDiv = document.querySelector("#errorDiv")
const loadingSpinner = document.querySelector("#loadingSpinner")

const API_KEY = "6baae4058e68a1a5809aaa3da51e9009"

let bar = null

window.onload = function() {
    getUnitsFromLocalStorage()
}

function getWeather(e) {
    e.preventDefault()
    
    errorDiv.innerHTML = ""
    
    const formData = new FormData(form)
    const cidade = formData.get("cidade")
    const units = formData.get("units")

    showSpinner()
    hideWeatherContent()

    saveUnitsToLocalStorage(units)

    getWithJson(cidade, units)
}

function saveUnitsToLocalStorage(units) {
    localStorage.setItem('units', units)
}

function getUnitsFromLocalStorage() {
    const savedUnits = localStorage.getItem('units')
    if (savedUnits) {
        $('#units').val(savedUnits)
    }
}

function showSpinner() {
    loadingSpinner.classList.remove('d-none')
}

function hideSpinner() {
    loadingSpinner.classList.add('d-none')
}

function showWeatherContent() {
    weatherContent.classList.remove('d-none')
}

function hideWeatherContent() {
    weatherContent.classList.add('d-none')
}

function getWithJson(cidade, units) {
    const req = new XMLHttpRequest()
    
    req.onloadend = function(){
        resp = req.responseText

        if(!resp) {
            errorDiv.innerHTML = "Ocorreu um erro!"
            return
        }
        
        respObj = JSON.parse(resp)
        console.log(respObj)
        if(respObj.cod == 200) {
            populateWeatherData(respObj, units)
        } else {
            hideSpinner()
            errorDiv.innerHTML = "Cidade não encontrada!"
            $('body').css('background-color', '#212529')
        }
    }   
    
    req.open("GET", `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=${units}&lang=pt_br`)
    req.send(null)
}

function populateWeatherData(data, units) {
    if(!bar)
        bar = document.getElementById("bar")

    const iconcode = data.weather.at(0).icon
    const iconurl = `http://openweathermap.org/img/wn/${iconcode}@2x.png`
    $('#icon').attr('src', iconurl)

    const tempUnit = (units == 'metric') ? '°C' : (units == 'standard' ? '°K' : '°F')
    const currentTemp = Math.round(data.main.temp)
    const minTemp = Math.round(data.main.temp_min)
    const maxTemp = Math.round(data.main.temp_max)
    $('#temp').text(`${currentTemp}${tempUnit}`)
    $('#temp_min').text(`${minTemp}°`)
    $('#temp_max').text(`${maxTemp}°`)
    changeBackgroundColor(convertToCelsius(currentTemp, units))

    const percentage = (((currentTemp - minTemp) || 1) / ((maxTemp - minTemp) || 1)) * 100
    setProgress(percentage)

    $('#description').text(data.weather.at(0).description)

    $('#city').text(data.name)

    let windSpeed = data.wind.speed
    let windSpeedUnit = "km/h"
  
    if (units == "metric" || units == "standard") {
      windSpeed = (data.wind.speed * 3.6).toFixed(2)
    } else if (units == "imperial") {
      windSpeed = (data.wind.speed).toFixed(2)
      windSpeedUnit = "mph"
    }
    $('#wind').text( `${windSpeed} ${windSpeedUnit}`)

    const sunrise = new Date(data.sys.sunrise * 1000)
    const sunset = new Date(data.sys.sunset * 1000)
    $('#sunrise').text(`${padNumber(sunrise.getHours())}:${padNumber(sunrise.getMinutes())}:${padNumber(sunrise.getSeconds())}`)
    $('#sunset').text(`${padNumber(sunset.getHours())}:${padNumber(sunset.getMinutes())}:${padNumber(sunset.getSeconds())}`)

    hideSpinner()
    showWeatherContent()
}

function convertToCelsius(temp, units) {
    console.log('unit', units)
    if (units == 'standard') {
      return temp - 273.15
    } else if (units === 'imperial') {
      return (temp - 32) * (5/9)
    } else {
      return temp
    }
  }

function setProgress(percent) {
    const p = 180 - (percent / 100) * 180
    bar.style.transform = `rotate(-${p}deg)`
}

function padNumber(number) {
    return number.toString().padStart(2, '0')
}

function changeBackgroundColor(temp) {
    const colors = { // https://materialuicolors.co/
        "-25": "#0D47A1",
        "-10": "#1E88E5",
        0: "#2196F3",
        5: "#42A5F5",
        10: "#64B5F6",
        15: "#90CAF9",
        20: "#CAE6FD", // azul mais claro
        25: "#FFCDD2", // vermelho mais claro
        30: "#EF9A9A",
        35: "#E57373",
        40: "#EF5350",
        45: "#E53935",
        60: "#E53935",
        100: "#B71C1C"
    }
    
    const closestTemp = Object.keys(colors).reduce((a, b) =>
        Math.abs(b - temp) < Math.abs(a - temp) ? b : a
    )

    $('body').css('background-color', colors[closestTemp])
}