/**
 * Gefið efni fyrir verkefni 9, ekki er krafa að nota nákvæmlega þetta en nota
 * verður gefnar staðsetningar.
 */

import { el } from './lib/elements.js';
import { weatherSearch } from './lib/weather.js';

/**
 * @typedef {Object} SearchLocation
 * @property {string} title
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 * @type Array<SearchLocation>
 */
const locations = [
  {
    title: 'Reykjavík',
    lat: 64.1355,
    lng: -21.8954,
  },
  {
    title: 'Akureyri',
    lat: 65.6835,
    lng: -18.0878,
  },
  {
    title: 'New York',
    lat: 40.7128,
    lng: -74.006,
  },
  {
    title: 'Tokyo',
    lat: 35.6764,
    lng: 139.65,
  },
  {
    title: 'Sydney',
    lat: 33.8688,
    lng: 151.2093,
  },
];

/**
 * Hreinsar fyrri niðurstöður, passar að niðurstöður séu birtar og birtir element.
 * @param {Element} element
 */
function renderIntoResultsContent(element) {
  const resultsContainer = document.querySelector('.results');

  if (resultsContainer){
    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(element);
  }
}

/**
 * Birtir niðurstöður í viðmóti.
 * @param {SearchLocation} location
 * @param {Array<import('./lib/weather.js').Forecast>} results
 */
function renderResults(location, results) {
  // TODO útfæra
  
  const resultsHeading = document.createElement('h2');
  resultsHeading.textContent = 'Niðurstöður';
  resultsHeading.style.marginBottom = '15px';

  const locationHeading = document.createElement('h3');
  locationHeading.textContent = `${location.title}`;
  locationHeading.style.marginBottom = '5px';

  const locationText = document.createElement('p');
  locationText.textContent = `Spá fyrir daginn á breiddargráðu ${location.lat} og lengdargráðu ${location.lng}`;
  locationText.style.marginBottom = '15px';

  const table = document.createElement('table');
  table.classList.add('forecast');

  const tableHeader = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const headers = ['Klukkutími', 'Hiti (°C)', 'Úrkoma (mm)'];
  headers.forEach((headerText) => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  tableHeader.appendChild(headerRow);
  table.appendChild(tableHeader);

  const tableBody = document.createElement('tbody');

  results.forEach((forecast) => {
    const row = document.createElement('tr');

    const timeCell = document.createElement('td');
    timeCell.textContent = forecast.time; 
    row.appendChild(timeCell);

    const temperatureCell = document.createElement('td');
    temperatureCell.textContent = forecast.temperature; 
    row.appendChild(temperatureCell);

    const precipitationCell = document.createElement('td');
    precipitationCell.textContent = forecast.precipitation;
    row.appendChild(precipitationCell);

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);

  const contentWrapper = document.createElement('div');
  contentWrapper.appendChild(resultsHeading);
  contentWrapper.appendChild(locationHeading);
  contentWrapper.appendChild(locationText);
  contentWrapper.appendChild(table);

  renderIntoResultsContent(contentWrapper);
}


/**
 * Birta villu í viðmóti.
 * @param {Error} error
 */
function renderError(error) {
  const resultsContainer = document.querySelector('.results');
  resultsContainer.innerHTML = '';

  const errorMessage = document.createElement('p');
  errorMessage.textContent = `Error: ${error.message}`;
  errorMessage.style.color = 'red';
  errorMessage.style.fontWeight = 'bold';

  resultsContainer.appendChild(errorMessage);
}

/**
 * Birta biðstöðu í viðmóti.
 */
function renderLoading() {
  console.log('render loading');
  const resultsContainer = document.querySelector('.results');

  let resultsHeading = resultsContainer.querySelector('h2');
  if (!resultsHeading) {
    resultsHeading = document.createElement('h2');
    resultsHeading.textContent = 'Niðurstöður';
    resultsHeading.style.marginBottom = '10px';
    resultsContainer.appendChild(resultsHeading);
  }

  resultsContainer.innerHTML = '';
  resultsContainer.appendChild(resultsHeading);

  const loadingMessage = document.createElement('p');
  loadingMessage.textContent = 'Leita...'

  resultsContainer.appendChild(loadingMessage);
}

/**
 * Framkvæmir leit að veðri fyrir gefna staðsetningu.
 * Birtir biðstöðu, villu eða niðurstöður í viðmóti.
 * @param {SearchLocation} location Staðsetning sem á að leita eftir.
 */
async function onSearch(location) {
  console.log('onSearch', location);
  

  // Birta loading state
  renderLoading();

  try{
    const results = await weatherSearch(location.lat, location.lng);
    console.log(results);

    console.log('Results: ', results);

    renderResults(location, results);

  }
  catch (error) {
    renderError(error);
  }
  
}

/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */
async function onSearchMyLocation() {
  if ('geolocation' in navigator){
    renderLoading();

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      const location = {
        title: 'Mín staðsetning',
        lat: latitude,
        lng: longitude,
      };

      try{
        const results = await weatherSearch(latitude, longitude);

        renderResults(location, results);
      }
      catch (error){
        renderError(error);
      }
    }, (error) => {
      renderError(new Error(`Geolocation error: ${error.message}`));
    });
    }
  }
  


/**
 * Býr til takka fyrir staðsetningu.
 * @param {string} locationTitle
 * @param {() => void} onSearch
 * @returns {HTMLElement}
 */
function renderLocationButton(locationTitle, onSearch) {
  // Notum `el` fallið til að búa til element og spara okkur nokkur skref.
  const locationElement = el(
    'li',
    { class: 'locations__location' },
    el(
      'button',
      { class: 'locations__button', click: onSearch },
      locationTitle,
    ),
  );

  /* Til smanburðar við el fallið ef við myndum nota DOM aðgerðir
  const locationElement = document.createElement('li');
  locationElement.classList.add('locations__location');
  const locationButton = document.createElement('button');
  locationButton.appendChild(document.createTextNode(locationTitle));
  locationButton.addEventListener('click', onSearch);
  locationElement.appendChild(locationButton);
  */

  return locationElement;
}

/**
 * Býr til grunnviðmót: haus og lýsingu, lista af staðsetningum og niðurstöður (falið í byrjun).
 * @param {Element} container HTML element sem inniheldur allt.
 * @param {Array<SearchLocation>} locations Staðsetningar sem hægt er að fá veður fyrir.
 * @param {(location: SearchLocation) => void} onSearch
 * @param {() => void} onSearchMyLocation
 */
function render(container, locations, onSearch, onSearchMyLocation) {
  // Búum til <main> og setjum `weather` class
  const parentElement = document.createElement('main');
  parentElement.classList.add('weather');

  // Búum til <header> með beinum DOM aðgerðum
  const headerElement = document.createElement('header');
  const heading = document.createElement('h1');
  heading.appendChild(document.createTextNode('🌤️ Veðrið 🌨️'));
  headerElement.appendChild(heading);
  parentElement.appendChild(headerElement);

  const text = document.createElement('p');
  text.appendChild(document.createTextNode('Veldu stað til að sjá hita- og úrkomuspá'));
  headerElement.appendChild(text);
  text.style.marginTop = '20px';
  parentElement.appendChild(headerElement);

  const subheading = document.createElement('h2');
  subheading.appendChild(document.createTextNode('Staðsetningar'));
  headerElement.appendChild(subheading);
  subheading.style.marginTop = '20px';
  parentElement.appendChild(headerElement);

  // TODO útfæra inngangstexta
  // Búa til <div class="locations">
  const locationsElement = document.createElement('div');
  locationsElement.classList.add('locations');

  // Búa til <ul class="locations__list">
  const locationsListElement = document.createElement('ul');
  locationsListElement.classList.add('locations__list');

  // <div class="loctions"><ul class="locations__list"></ul></div>
  locationsElement.appendChild(locationsListElement);

    const myLocationButtonLi = document.createElement('li');
    myLocationButtonLi.classList.add('locations__location');
    const myLocationButton = document.createElement('button');
    myLocationButton.textContent = 'Mín staðsetning (þarf leyfi)';
    myLocationButton.addEventListener('click', onSearchMyLocation);
    myLocationButtonLi.appendChild(myLocationButton);
    locationsListElement.appendChild(myLocationButtonLi);

  // <div class="loctions"><ul class="locations__list"><li><li><li></ul></div>
  for (const location of locations) {
    const liButtonElement = renderLocationButton(location.title, () => {
      console.log('Halló!!', location);
      onSearch(location);
    });
    locationsListElement.appendChild(liButtonElement);
  }

  locationsElement.appendChild(locationsListElement);
  parentElement.appendChild(locationsElement);

  const resultsContainer = document.createElement('div');
  resultsContainer.classList.add('results');
  parentElement.appendChild(resultsContainer);

  // TODO útfæra niðurstöðu element

  container.appendChild(parentElement);
}

// Þetta fall býr til grunnviðmót og setur það í `document.body`
render(document.body, locations, onSearch, onSearchMyLocation);
