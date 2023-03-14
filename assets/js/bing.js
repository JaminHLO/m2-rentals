var bingFurnObj; //an object to hold the fetch list of furniture stores
var bingAPIKey = 'AiG4EPc6Fx1YkYlJcKu0BI-b5jWafgdxk4pQkefyU5iNYFa2wn0x24qyz8v4BY1d';

var bingZipLat;
var bingZipLong;

//get map and furniture data from bing
function fetchBingData (inputZip) {
    var bingState = ""; //&adminDistrict=
    var bingCity = ""; //&locality=
    var bingZip = ("&postalCode="+(inputZip.split("=")[1])); //30009
    console.log("bingZip is:", bingZip);
    var bingAddress = "" //&addressLine=

    var bingCoordsObj; // an array to hold the coordinates for the searched zipcode

    // extra options: &userLocation={userLocation}&userIp={userIp}&usermapView={usermapView}&includeNeighborhood={includeNeighborhood}&maxResults={maxResults}
    
    //get point location coordinates based on zip code
    fetch(`https://dev.virtualearth.net/REST/v1/Locations?countryRegion=US${bingState}${bingCity}${bingZip}${bingAddress}&key=${bingAPIKey}`)
        .then(function (response) {
            if (!response.ok) {
                console.log("error");
                throw response.json();
            }
            var  respBingObj = response.json();
            console.log(respBingObj);
            return respBingObj;
        })
        .then (function(data) {
            bingCoordsObj = data;
            console.log(bingCoordsObj);
            console.log("lat is:", bingCoordsObj.resourceSets[0].resources[0].point.coordinates[0]);
            console.log("long is:", bingCoordsObj.resourceSets[0].resources[0].point.coordinates[1]);
            bingZipLat = bingCoordsObj.resourceSets[0].resources[0].point.coordinates[0];
            bingZipLong = bingCoordsObj.resourceSets[0].resources[0].point.coordinates[1];

            //create variables for furniture data fetch
            var bingQuery = ("?query=" + "furniture");
            var bingTypeSearch = "" //("&type="+"furniture");
            var bingPoint = ("&userLocation="+bingZipLat+","+bingZipLong);
            //fetch furniture data from bing API
            fetch (`https://dev.virtualearth.net/REST/v1/LocalSearch/${bingQuery}${bingTypeSearch}${bingPoint}&key=${bingAPIKey}`)
                .then (function(response) {
                    if (!response.ok) {
                        console.log("error");
                        throw response.json();
                    }
                    var respBingObj = response.json();
                    console.log(respBingObj);
                    return respBingObj;
                })
                .then (function(data) {
                    bingFurnObj = data;
                    console.log(data);
                    console.log("bing API loaded into global bingFurnObj");

                    //saveBingData()
                    displayBingFurnCards(bingFurnObj);
                    displayBingData();
                    console.log(bingFurnObj);
                })
                .catch(err => console.error(err));
    
        })
        .catch(err => console.error(err));


}

//display bing furn data in Cards
function displayBingFurnCards (bingFurnObj) {
    var bingFurnitureElem = document.querySelector('.furniture');
    bingFurnitureElem.textContent = "";
    
    var bingFurnArray = bingFurnObj.resourceSets[0].resources;
        for (var i=0;i<bingFurnArray.length;i++){
      //create card
      var cardDiv = document.createElement("div");
      cardDiv.setAttribute("class", "card is-family-code is-flex-direction-column m-3 has-background-info-light is-size-7");
      
      //create card-section
      var cardSection = document.createElement("div");
      cardSection.setAttribute("class", "card-section has-text-weight-semibold  has-text-link-dark is-size-7");
      cardSection.setAttribute("id", `addressF${i}`);

      var f = bingFurnArray[i].Address; //
      var n = bingFurnArray[i].name;
      var curAddress = `${n}<br>${f.addressLine}<br>${f.locality}, ${f.adminDistrict} ${f.postalCode}`;
      // console.log("current address is:", curAddress);
      cardSection.innerHTML = curAddress;

      //create card-stats
      var cardStats = document.createElement("div");
      cardStats.setAttribute("class", "card-stats");

      //create card-img
      var cardImg = document.createElement("img");
      cardImg.setAttribute("class", "card-img");
  
      //get the streetview image if available
      var getStreetViewInput = `${f.addressLine} ${f.locality}, ${f.adminDistrict}`;
      var streetViewURL = getStreetView(getStreetViewInput);
        // console.log(streetViewURL);
        cardImg.setAttribute("src", streetViewURL);
        cardImg.setAttribute("onerror", "javascript:this.src='./assets/icons/new-store.png'");
  
      cardImg.setAttribute("alt", "furniture store");
      //create card-info
      var cardInfo = document.createElement("div");
      cardInfo.setAttribute("class", "card-info");

      //add card-img and card-ingo to card-stats
      cardStats.appendChild(cardImg);
      cardStats.appendChild(cardInfo);
      //add card-stats to card-section
      cardSection.appendChild(cardStats);
      //add card-section to card
      cardDiv.appendChild(cardSection);
      //add card to houses class
      bingFurnitureElem.appendChild(cardDiv);

      cardDiv.addEventListener('click', function (event) {
        // console.log("clicked a card");
        var clickedElem = event.target;
        while (!(clickedElem.id)) {
          // console.log("no id");
          // console.log(clickedElem.parentNode);
          clickedElem = clickedElem.parentNode;
        //   if (clickedElem.id) {
        //     if ((clickedElem.id)[0] !== "a") {
        //       clickedElem = clickedElem.parentNode;
        //     }
        //   }
        }
        console.log("clickedElem.id is", clickedElem.id);
  
      });
    }


}

//display bing data in Map area
function displayBingData () {
    var bingFurnArray = bingFurnObj.resourceSets[0].resources;
    var bingMapString = "https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/";
    
    //add center of map
    bingMapString = bingMapString.concat(bingZipLat, "%2C", bingZipLong);
    //add map size
    bingMapString = bingMapString.concat("/12?mapSize=900%2C600&format=png");

    console.log("bingfurnarray is:", bingFurnArray);

    var pushPin = "&pushpin=";

    //add blue pins for furniture stores
    for (var i=0; i<bingFurnArray.length; i++){
        var coords = bingFurnArray[i].point.coordinates;
        // console.log(coords);
        var stringToAdd = `${pushPin}${coords[0]}%2C${coords[1]};1;${i+1}`;
        // console.log(`${pushPin}${coords[0]},${coords[1]};1;${i+1}`);
        bingMapString = bingMapString.concat(stringToAdd);
        // console.log("furn string", bingMapString);
    }  

    //add red pins for rental properties
    for (var j=0; j<rentalArray.length; j++){
        var coords = rentalArray[j];
        // console.log(coords);
        var stringToAdd = `${pushPin}${coords.latitude}%2C${coords.longitude};7;${j+1}`;
        bingMapString = bingMapString.concat(stringToAdd);
        // console.log("rental string", bingMapString);
    }

    //removed string &mapLayer={mapLayer}&format={format}&mapMetadata={mapMetadata}
    bingMapString = bingMapString.concat(`&key=${bingAPIKey}`);
    console.log("display bing:", `${bingMapString}`);
    var bingMapElem = document.getElementById("map");
    bingMapElem.textContent = "";
    var newMap = document.createElement("img");
    newMap.setAttribute("src", bingMapString);
    newMap.setAttribute("style", "width=100%");
    bingMapElem.appendChild(newMap);

}

// load bing map from localStorage if any saved
function loadBingData (){
    bingFurnObj = localStorage.getItem('bing-array');
    if (bingFurnObj) {
        console.log("loading stored data for bind array");
        bingFurnObj = JSON.parse(bingFurnObj);
        displayBingData();
    }
    else {
        console.log("no data in localStorage for bing-array");
    }
}

// loadBingData();