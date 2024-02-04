const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const nextDayTag = document.querySelector("[temprature-toggle]");

const dataCelcius = document.querySelector("[data-celcius]");
const dataFaheranite = document.querySelector("[data-faheranite]")
const toggleTempratureUnits = document.querySelector("[temprature-toggle]")
const fiveDayForecast = document.querySelector("[five-day-forecast]");
//initially vairables need????

let oldTab = userTab;
let oldTempUnit = dataCelcius;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
oldTempUnit.classList.add("current-tab");
fiveDayForecast.classList.remove("active");
getfromSessionStorage();



const apiErrorMsg = document.querySelector(".api-error-container");
apiErrorMsg.classList.remove("active");


function switchTempratureUnits(newTempUnit){
    if(newTempUnit != oldTempUnit){
        oldTempUnit.classList.remove("current-tab");
        newTempUnit.classList.add("current-tab");
        oldTempUnit = newTempUnit;   
        changeTheTemprature(newTempUnit);
    }
}

const celsiusToFahrenheit = celsius => celsius * 9/5 + 32;

const fahrenheitToCelsius = fahrenheit => (fahrenheit - 32) * 5/9;

function changeTheTemprature(newTempUnit){
    const temp = document.querySelector("[data-temp]");
    const avgTemp = document.querySelectorAll(".next-day-avgTemp");
    const minimumTemprature = document.querySelector("[min-temprature]");
    const maximumTemprature = document.querySelector("[max-temprature]")


    if(newTempUnit === dataCelcius){
        //Converting  faherantite to celcius:
        const tempValue = temp.innerHTML.split(" ")[0];
        let minimumTempratureValue = minimumTemprature.innerHTML.split(" ")[0];
        let maximumTempratureValue = maximumTemprature.innerHTML.split(" ")[0];

        minimumTemprature.innerHTML = `${fahrenheitToCelsius(minimumTempratureValue).toFixed(2)} °C`
        maximumTemprature.innerHTML = `${fahrenheitToCelsius(maximumTempratureValue).toFixed(2)} °C`
        temp.innerHTML = `${fahrenheitToCelsius(tempValue).toFixed(2)} °C`;

        //iterating over teh avgTemp Values
        for(let i = 0; i<avgTemp.length; i++){
            const avgTempValue= avgTemp[i].innerHTML.split(" ")[0];
            avgTemp[i].innerHTML = `${fahrenheitToCelsius(avgTempValue).toFixed(2)} °C`;
        }

    }else{
        //converting celcius to faheranite:
        const tempValue = temp.innerHTML.split(" ")[0];
        temp.innerHTML = `${celsiusToFahrenheit(tempValue).toFixed(2)} °F`;
        let minimumTempratureValue = minimumTemprature.innerHTML.split(" ")[0];
        let maximumTempratureValue = maximumTemprature.innerHTML.split(" ")[0];

        minimumTemprature.innerHTML = `${celsiusToFahrenheit(minimumTempratureValue).toFixed(2)} °F`
        maximumTemprature.innerHTML = `${celsiusToFahrenheit(maximumTempratureValue).toFixed(2)} °F`

        //iterating over teh avgTemp Values
        for(let i = 0; i<5; i++){
            const avgTempValue= avgTemp[i].innerHTML.split(" ")[0];
            avgTemp[i].innerHTML = `${celsiusToFahrenheit(avgTempValue).toFixed(2)} °F`;
        }

    }
}

function switchTab(newTab) {
    if(newTab != oldTab) {
        fiveDayForecast.classList.remove("active");
        switchTempratureUnits(dataCelcius);
        toggleTempratureUnits.classList.remove("active");
        nextDayTag.classList.remove("active");
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            //If search form  container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //Changing between the search tab and weather tab 
            searchForm.classList.remove("active");
            apiErrorMsg.classList.remove("active")
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

dataCelcius.addEventListener("click", ()=>{
    //When Celcius is slected:
    switchTempratureUnits(dataCelcius);
})

dataFaheranite.addEventListener("click", ()=>{
    //When Celcius is slected:
    switchTempratureUnits(dataFaheranite);
})

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          
        const  data = await response.json();

         //Calling the data for the days:
         const responseOfDays = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        )

        const dataOfDays = await responseOfDays.json();

        if(data?.cod >= 400 && dataOfDays ?.cod >= 400){
            dataNotFound(data?.cod);
            return;
        }


        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        displayDaysData(dataOfDays)
        
    }
    catch(err) {
        console.log(err)
        loadingScreen.classList.remove("active");

    }

}

function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fethc the elements 

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    const minimumTemprature = document.querySelector("[min-temprature]");
    const maximumTemprature = document.querySelector("[max-temprature]")

    //For Finding the wind direction:
    let compassSector = ["North", "NNE", "North East", "ENE", "East", "ESE", "South East", "SSE", "South", "SSW", "South West", "WSW", "West", "WNW", "Norht West", "NNW", "North"];

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    minimumTemprature.innerText = `${weatherInfo?.main?.temp_min.toFixed(2)} °C`
    maximumTemprature.innerText = `${weatherInfo?.main?.temp_max.toFixed(2)} °C`
    //Wind direction -> compassSector[(weatherInfo?.wind?.deg / 22.5).toFixed(0)];
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s ${compassSector[(weatherInfo?.wind?.deg / 22.5).toFixed(0)]}`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;


}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else {
        alert("No Geolocation Available")
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}


function displayDaysData(data){
    const dayDate = document.querySelectorAll(".next-day-date");

    const avgTemp = document.querySelectorAll(".next-day-avgTemp");
    const descriptionOfWeather = document.querySelectorAll(".next-day-description");
    const imgOfWeather = document.querySelectorAll(".next-days-weather");

    const daysList = data.list;
    let prevDate = daysList[0].dt_txt.split(" ")[0];
    let j = 0;
    for(let days = 0; days<data.cnt-1; days++){
        const nextDate = daysList[days + 1].dt_txt.split(" ");
        if((days == data.cnt-2 || prevDate !== nextDate[0]) && j < 5){
            const avgTemprature  = ((daysList[days].main.temp_min) + (daysList[days].main.temp_max))/2;
            
            avgTemp[j].innerHTML = `${avgTemprature.toFixed(2)} °C`;
            dayDate[j].innerHTML = new Date(prevDate).toDateString().slice(0, 10);
            descriptionOfWeather[j].innerHTML = daysList[days].weather[0].description;
            imgOfWeather[j].src = `http://openweathermap.org/img/w/${daysList[days]?.weather?.[0]?.icon}.png`;
            j++;
            prevDate = nextDate[0];
        }
    }
    
    nextDayTag.classList.add("active");
    fiveDayForecast.classList.add("active");
    toggleTempratureUnits.classList.add("active")
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        
        //Calling the data of current city:
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );

        const data = await response.json();

        //Calling the data for the days:
        const responseOfDays = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        )

        const dataOfDays = await responseOfDays.json();
        
        loadingScreen.classList.remove("active");
        if(data?.cod >= 400 && dataOfDays ?.cod >= 400){
            dataNotFound(data?.cod);
            return;
        }
        apiErrorMsg.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        displayDaysData(dataOfDays)
    }
    catch(err) {
        console.log(err);
    }
}


function dataNotFound(errorCodeNumber) {
    userInfoContainer.classList.remove("active");
    apiErrorMsg.classList.add("active");
    const apiErrorTextDesc = document.querySelector('[data-apiErrorText]')
    if(errorCodeNumber>=400){
        apiErrorTextDesc.innerText = "City Not Found";
    }else{
        apiErrorTextDesc.innerText = "Check Your Internet Connectivity";
    }
}

function showError(error) {
    const x = document.querySelector("[grant-location-msg]");
    switch(error.code) {
      case error.PERMISSION_DENIED:
        x.innerHTML = "User denied the request for Geolocation."
        break;
      case error.POSITION_UNAVAILABLE:
        x.innerHTML = "Location information is unavailable."
        break;
      case error.TIMEOUT:
        x.innerHTML = "The request to get user location timed out."
        break;
      case error.UNKNOWN_ERROR:
        x.innerHTML = "An unknown error occurred."
        break;
    }
  }