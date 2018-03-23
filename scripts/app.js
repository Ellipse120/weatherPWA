(function () {
	'use strict'

	var app = {
		isLoading: true,
		visibleCards: {},
		selectedCities: [],
		spinner: document.querySelector('.loader'),
		cardTemplate: document.querySelector('.cardTemplate'),
		container: document.querySelector('.main'),
		addDialog: document.querySelector('.dialog-container'),
		daysOfWeek: ['Mon', 'Tue', 'Web', 'Thu', 'Fri', 'Sat', 'Sun']
	};

	/***************************************
	 *
	 * Event listeners for UI elements
	 *
	 ****************************************/

	/**
	 * refresh all of the forecasts
	 */
	document.getElementById('butRefresh').addEventListener('click', function () {
		app.updateForecasts();
	})

	/**
	 * open or show the add new city dialog
	 */
	document.getElementById('butAdd').addEventListener('click', function () {
		app.toggleAddDialog(true);
	})

	document.getElementById('butAddCity').addEventListener('click', function () {
		var select = document.getElementById('selectCityToAdd');
		var selected = select.options[select.selectedIndex];
		var key = selected.value;
		var label = selected.textContent;
		// todo init the selectedCities array
		app.getForecast(key, label);
	})


	/***************************************
	 *
	 * Methods to update/refresh for UI elements
	 *
	 ****************************************/

	/**
	 * toggle the visibility of the add new city dialog
	 *
	 * @param visible
	 */
	app.toggleAddDialog = function (visible) {
		if (visible) {
			app.addDialog.classList.add('dialog-container--visible');
		} else {
			app.addDialog.classList.remove('dialog-container--visible');
		}
	}

	app.updateForecasts = function (data) {

	}

	app.saveSelectedCities = function () {

	}

	/***************************************
	 *
	 * Methods for dealing with the model
	 *
	 ***************************************/

	app.getForecast = function (key, label) {
		var statement = 'select * from weather.forecast where woeid=' + key;
		var url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' + statement;
		// TODO  add cache logic here

		// Fetch the latest data
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					var response = JSON.parse(request.response);
					var results = response.query.results;
					results.key = key;
					results.label = label;
					results.created = response.query.created;
					app.updateForecasts(results);
				}
			} else {
				app.updateForecastCard(initialWeatherForecast);
			}
		};
		request.open('GET', url);
		request.send();
	};

	// iterate all of the cards and attempt to get the latest forecast data
	app.updateForecasts = function () {
		var keys = Object.keys(app.visibleCards);
		keys.forEach(function (key) { app.getForecast(key); })
	}

	/**
	 * update a weather card with the latest weather forecast.
	 * If the card doesn't already exist, it's cloned from the template.
	 */
	app.updateForecastCard = function (data) {
		var dataLashUpdated = new Date(data.created);
		var sunrise = data.channel.astronomy.sunrise;
		var sunset = data.channel.astronomy.sunset;
		var current = data.channel.item.condition;
		var humidity = data.channel.atmosphere.humidity;
		var wind = data.channel.wind;

		var card = app.visibleCards[data.key];
		if (!card) {
			card = app.cardTemplate.cloneNode(true);
			card.classList.remove('cardTemplate');
			card.querySelector('.location').textContent = data.label;
			card.removeAttribute('hidden');
			app.container.appendChild(card);
			app.visibleCards[data.key] = card;
		}

		// check the data, verify latest
		var cardLastUpdatedElem = card.querySelector('.card-last-updated');
		var cardLastUpdated = cardLastUpdatedElem.textContent;
		if (cardLastUpdated) {
			cardLastUpdated = new Date(cardLastUpdated);
			if (dataLashUpdated.getTime() < cardLastUpdated.getTime()) {
				return;
			}
		}
		cardLastUpdatedElem.textContent = data.created;

		card.querySelector('.description').textContent = current.text;
		card.querySelector('.date').textContent = current.date;
		card.querySelector('.current .icon').classList.add(app.getIconClass(current.code));
		card.querySelector('.current .temperature .value').textContent = Math.round(current.temp);
		card.querySelector('.current .sunrise').textContent = sunrise;
		card.querySelector('.current .sunset').textContent = sunset;
		card.querySelector('.current .humidity').textContent = Math.round(humidity) + '%';
		card.querySelector('.current .wind .value').textContent = Math.round(wind.speed);
		card.querySelector('.current .wind .direction').textContent = wind.direction;
		var nextDays = card.querySelectorAll('.future .oneday');
		var today = new Date();
		today = today.getDay();
		for (var i = 0; i < 7; i++) {
			var nextDay = nextDays[i];
			var daily = data.channel.item.forecast[i];
			if (daily && nextDay) {
				nextDay.querySelector('.date').textContent = app.daysOfWeek[(i + today) % 7];
				nextDay.querySelector('.icon').classList.add(app.getIconClass(daily.code));
				nextDay.querySelector('.temp-high .value').textContent = Math.round(daily.high);
				nextDay.querySelector('.temp-low .value').textContent = Math.round(daily.low);
			}
		}
		if (app.isLoading) {
			app.spinner.setAttribute('hidden', true);
			app.container.removeAttribute('hidden');
			app.isLoading = false;
		}

	};

	/***************************************
	 *
	 * Fake weather data
	 *
	 ***************************************/
	var initialWeatherForecast = {
		key: '2459115',
		label: 'New York, NY',
		created: '2016-07-22T01:00:00Z',
		channel: {
			astronomy: {
				sunrise: "5:43 am",
				sunset: "8:21 pm"
			},
			item: {
				condition: {
					text: "Windy",
					date: "Thu, 21 Jul 2016 09:00 PM EDT",
					temp: 56,
					code: 24
				},
				forecast: [
					{code: 44, high: 86, low: 70},
					{code: 44, high: 94, low: 73},
					{code: 4, high: 95, low: 78},
					{code: 24, high: 75, low: 89},
					{code: 24, high: 89, low: 77},
					{code: 44, high: 92, low: 79},
					{code: 44, high: 89, low: 77}
				]
			},
			atmosphere: {
				humidity: 56
			},
			wind: {
				speed: 25,
				direction: 195
			}
		}
	};

	app.updateForecastCard(initialWeatherForecast);

})();