// wrapping everything in jquery to load when all else is ready
$(function () {
    // jquery DOM variables
    var searchBtn = $("#searchBtn");
    var inputSearch = $("#inputSearch");
    var historyList = $("#historyList");
    var clearBtn = $("#clearBtn");
    var cityName = $("#cityName");
    var todayIcon = $(".todayIcon");
    var todayTemp = $("#todayTemp");
    var todayWind = $("#todayWind");
    var todayHumidity = $("#todayHumidity");
    var fiveDayChildren = $("#fiveDay").children("div");
    // dayjs variables
    var today = dayjs().format('DD');
    var todaysDate = " (" + dayjs().format("M/D/YYYY") + ")"
    // other global variables
    var cityText = ""
    var apiKey = "2df2f52cc55e3cc6610e9af8185701f0"

    // load local storage into history list
    for (var i = 0; i < localStorage.length; i++) {
        var name = Object.keys(localStorage)[i];
        var list = $("<li></li>").text(name);
        list.addClass("mb-3 rounded p-2 history")
        historyList.append(list);
    }

    // on click events
    historyList.on("click", loadCity);
    searchBtn.on("click", findCity);
    clearBtn.on("click", clearHistory);

    // load weather from history
    function loadCity(event) {
        var city = $(event.target).text();
        var locationUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;
        $.ajax({
            url: locationUrl,
            method: 'GET',
        }).then(function (response) {
            cityText = response.name + todaysDate;
            var lat = response.coord.lat;
            var lon = response.coord.lon;
            var icon = response.weather[0].icon;
            todayIcon.attr("src", "https://openweathermap.org/img/wn/" + icon + ".png");
            var children = cityName.children();
            cityName.text(cityText);
            cityName.append(children);
            todayTemp.text("Temp: " + response.main.temp + " °F");
            todayWind.text("Wind: " + response.wind.speed + " MPH");
            todayHumidity.text("Humidity: " + response.main.humidity + " %");
            findWeather(lat, lon, response)
        }).catch(function (error) {
            cityName.text("Could not find city");
            console.log(error);
        });
    }

    // find latitude and longitude for city
    function findCity(event) {
        event.preventDefault();
        var city = inputSearch.val();
        var locationUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;
        $.ajax({
            url: locationUrl,
            method: 'GET',
        }).then(function (response) {
            cityText = response.name + todaysDate;
            var name = response.name;
            var lat = response.coord.lat;
            var lon = response.coord.lon;
            var icon = response.weather[0].icon;
            todayIcon.attr("src", "http://openweathermap.org/img/wn/" + icon + ".png");
            var children = cityName.children();
            cityName.text(cityText);
            cityName.append(children);
            todayTemp.text("Temp: " + response.main.temp + " °F");
            todayWind.text("Wind: " + response.wind.speed + " MPH");
            todayHumidity.text("Humidity: " + response.main.humidity + " %");
            localStorage.setItem(name, name);
            list = $("<li></li>").text(name);
            list.addClass("mb-3 rounded p-2 history");
            historyList.append(list);
            findWeather(lat, lon, response)
        }).catch(function (error) {
            cityName.text("Could not find city");
            console.log(error);
        });
    }

    // get weather with latitude and longitude
    function findWeather(lat, lon) {
        var fiveDayUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;
        $.ajax({
            url: fiveDayUrl,
            method: 'GET',
        }).then(function (response) {
            var list = response.list;
            sortWeather(list, response);
        });
    }

    // sort weather API results into an array of objects
    function sortWeather(list) {
        var todayArr = [];
        var fiveDayArr = [];
        for (var i = 0; i < list.length; i++) {
            var date = list[i].dt_txt.split(" ");
            var fullDate = dayjs(date[0]).format("M/D/YYYY");
            var hour = date[1];
            var day = date[0].split("-")[2]
            // five day
            if (day > today) {
                if (hour === "12:00:00") {
                    var fiveDayObj = {
                        date: fullDate,
                        temp: list[i].main.temp,
                        humidity: list[i].main.humidity,
                        wind: list[i].wind.speed,
                        icon: list[i].weather[0].icon
                    }
                    fiveDayArr.push(fiveDayObj);
                }
            }
        }
        displayWeather(fiveDayArr);
    }

    // display weather objects in readable format
    function displayWeather(fiveDayArr) {
        // display 5day weather
        for (var i = 0; i < fiveDayChildren.length; i++) {
            var cards = $(fiveDayChildren[i]);
            cards.children(".fiveDate").text(fiveDayArr[i].date);
            cards.children(".fiveIcon").attr("src", "https://openweathermap.org/img/wn/" + fiveDayArr[i].icon + ".png")
            cards.children(".fiveTemp").text("Temp: " + fiveDayArr[i].temp + " °F");
            cards.children(".fiveWind").text("Wind: " + fiveDayArr[i].wind + " MPH");
            cards.children(".fiveHumidity").text("Humidity: " + fiveDayArr[i].humidity + " %");
        }
    }      

    function clearHistory() {
        localStorage.clear();
        for (var i = 0; i < historyList.children().length; i++) {
            var historyArr = historyList.children();
            if ($(historyArr[i]).hasClass("history")) {
                $(historyArr[i]).remove();
            } else {
                console.log("no history");
            }
        }
    }
});