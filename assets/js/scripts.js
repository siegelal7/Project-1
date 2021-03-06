$(document).ready(function () {
  /**
   * GLOBAL VARIABLES
   **/

  var npsAPIkey = "PtYiGrnXjG4FL7v9tOprJACeJgJV4KxlTarrmWXF";
  var npsURL = `https://developer.nps.gov/api/v1/parks/?api_key=${npsAPIkey}&stateCode=`;
  var specificParkUrl = `https://developer.nps.gov/api/v1/parks/?api_key=${npsAPIkey}&parkCode=`;
  var allParksInState = {};
  var listOfParksArray = [];
  var mapQuestAPIkey = "UKFuk0Xe7EAKnJmVEVb3gfUAKRVOlAzR";
  var mapsUrl = `https://www.mapquestapi.com/directions/v2/route?key=${mapQuestAPIkey}&`;
  var userAddress;
  var userAdventure = "";
  var adventureArray = [];
  var question;
  var favoriteParks = [];

  /**
   * DOM ELEMENTS
   **/
  var topicsBtn = $("#topicsBtn");
  var activityBtn = $("#activityBtn");
  var adventureDiv = $("#adventureDiv");
  var adventureDivWrapper = $("#adventureDivWrapper");
  var distanceDiv = $("#distanceDiv");
  var parkListDiv = $("#parkListDiv");
  var originalPage = $("#originalPage");
  var addressSubmit = $("#addressSubmit");
  var inputAddress = $("#inputAddress");
  var inputCity = $("#inputCity");
  var inputState = $("#inputState");
  var inputZip = $("#inputZip");
  var parkDetails = $("#park-details");
  var parkDirectionsList = $("#directions-list");
  var parkDetailInfo = $("#park-detail-info");
  var parkName = $("#park-name");
  var parkCode = $("#park-code");
  var favoriteParksListEL = $("#FavoriteParksList");
  var navMenu = $("#navbarSupportedContent");
  var navMainPageOption = $("#nav-mainPage");
  var navSearchPageOption = $("#nav-search");
  var validationAlert = $("#validationAlert");
  var searchBtn = $("#searchBtn");
  /**
   * FUNCTION DEFINITIONS
   */

  // Function to display navbar home link only
  function displayNavBarHomeLink() {
    navMenu.attr("style", "display:block");
    navSearchPageOption.attr("style", "display:none");
  }

  //Function to  to hide park search
  function hideParkSearch() {
    $("#search-park-by-name").attr("style", "display:none");
  }

  //Function to display park search
  function showParkSearch() {
    $("#search-park-by-name").attr("style", "display:block");
  }

  // Function to display navbar home link only
  function hideNavBarHomeAndTopicActivityLink() {
    navMenu.attr("style", "display:none");
  }

  //Function to add go back button
  function addGobackBtn(divName, currentPage) {
    var newRow = $("<row>");
    newRow.addClass("goBackBtnRow");
    var newDiv = $("<div>");
    newDiv.addClass("col text-center");

    var goBackBtn = $("<button>");
    goBackBtn.append(
      "<svg width='2em' height='2em' viewBox='0 0 16 16' class='bi bi-arrow-left' fill='white' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z'/></svg>"
    );
    goBackBtn.addClass("btn-primary selection-btn goBack");

    goBackBtn.attr("data-value", currentPage);
    newDiv.append(goBackBtn);
    newRow.append(newDiv);

    if (currentPage === "parkList") {
      adventureDivWrapper.children(".goBackBtnRow").remove();
      adventureDivWrapper.prepend(newRow);
    } else if (
      currentPage === "parkDetails" ||
      currentPage === "parkDetailsMainMenu"
    ) {
      divName.prepend(newRow);
    } else {
      divName.append(newRow);
    }
  }

  // Function - Clears the Current Screen
  function clearScreen() {
    originalPage.attr("style", "display:none");
    distanceDiv.attr("style", "display:none");
    parkListDiv.attr("style", "display:none");
    parkDetails.attr("style", "display:none");
    adventureDiv.empty();
  }

  // Function - sets the array to local storage value or leaves it blank if none; then populates list with faves
  function getFavoriteList() {
    favoriteParksListEL.empty();
    var faves = JSON.parse(localStorage.getItem("parks"));
    if (faves !== null) {
      favoriteParks = faves;
    }
    var header = $("<h3>");
    header.attr("id", "headerFaveList");
    header.attr(
      "style",
      "color:#f2be79; text-decoration:underline;margin-bottom:15px"
    );
    header.text("Favorite Parks");

    $("#faveList").prepend(header);
    for (i = 0; i < favoriteParks.length; i++) {
      var listItem = $("<li>");
      listItem.text(favoriteParks[i].park);
      listItem.attr("parkCode", favoriteParks[i].parkCode);
      listItem.attr("class", "favorite-list-item");

      // click event listener for the list items
      listItem.on("click", function () {
        $.ajax({
          url: specificParkUrl + $(this).attr("parkCode"),
          method: "GET",
        }).then(function (response) {
          //ClearScreen() didn't have below functionality
          distanceDiv.attr("style", "display:none");
          $("#directionsDiv").attr("style", "display:none");
          hideParkSearch();

          var data = response.data[0];
          var address = data.addresses[0];
          parkDetailsFunction(
            data.fullName,
            data.parkCode,
            data.operatingHours[0].description,
            JSON.stringify(data.operatingHours[0].standardHours),
            JSON.stringify(data.images),
            `${address.line1},  ${address.city}, ${address.stateCode} ${address.postalCode}`
          );
        });
      });
      favoriteParksListEL.append(listItem);
    }
  }

  // Function - AJAX Call using the State Code
  function ajaxCallNPSbyState(state) {
    var stateParksURL = npsURL + state;
    $.ajax({
      url: stateParksURL,
      method: "GET",
    }).then(function (response) {
      allParksInState = response;
    });
  }

  // Function - Creates a new page with buttons
  function createButtons(question, div, array) {
    clearScreen();

    var questionHeader = $("<h1>");
    questionHeader.text(question);
    questionHeader.attr({
      id: "questionHeader",
      class: "mb-4",
    });
    div.append(questionHeader);
    div.attr("class", ".display");

    addGobackBtn(div, "adventuresList");

    for (i = 0; i < array.length; i++) {
      var option = $("<button>");
      option.attr({
        type: "button",
        class: "btn btn-primary selection-btn",
        "data-value": "" + array[i],
      });
      option.text(array[i]);
      div.append(option);
    }
    navMenu.attr("style", "display:block");
    navSearchPageOption.removeClass("disabled");
    div.attr("style", "display:");
  }

  // Function - Creates a List of Parks
  function createListOfParks(userChoice) {
    var parks;
    listOfParksArray = [];

    for (var i = 0; i < allParksInState.data.length; i++) {
      if (userAdventure === "Activity") {
        parks = allParksInState.data[i].activities;
      } else if (userAdventure === "Topics") {
        parks = allParksInState.data[i].topics;
      }

      for (var j = 0; j < parks.length; j++) {
        if (parks[j].name === userChoice) {
          listOfParksArray.push(allParksInState.data[i]);
        }
      }
    }

    noResultListOfParks();
  }

  // Function - Checks the List of Parks
  function noResultListOfParks() {
    if (listOfParksArray.length === 0) {
      $("#modal-body").text(
        "There are no national parks in your state that include your selection."
      );
      $("#noParksModalCenter").modal("show");
    } else {
      createParksPage();
    }
  }

  // Function - Creates the Parks Page
  function createParksPage() {
    clearScreen();

    addGobackBtn(adventureDiv, "parkList");

    for (i = 0; i < listOfParksArray.length; i++) {
      // Adds Class Card-Deck to Activity Div
      adventureDiv.attr("class", "card-deck row row-cols-3 mb-5");
      var colDiv = $("<div class='col mb-4'></div>");
      var cardDiv = $("<div class='card'></div>");

      var img = $(
        "<img class='card-img-top park-image' alt='park-image' style='height: 210px'/>"
      );

      if (listOfParksArray[i].images[0] != undefined) {
        img.attr("src", listOfParksArray[i].images[0].url);
      } else {
        img.attr(
          "src",
          "https://files.tripstodiscover.com/files/2018/08/32533575_1785635178193287_5065019941074239488_o.jpg"
        );
      }
      cardDiv.attr(
        "data-value",
        `${listOfParksArray[i].addresses[0].line1},  ${listOfParksArray[i].addresses[0].city}, ${listOfParksArray[i].addresses[0].stateCode} ${listOfParksArray[i].addresses[0].postalCode}`
      );
      // Adding these attributes so that we can we can populate the final results page with the info
      cardDiv.attr({
        name: listOfParksArray[i].fullName,
        operatingHours: listOfParksArray[i].operatingHours[0].description,
        standardHours: JSON.stringify(
          listOfParksArray[i].operatingHours[0].standardHours
        ),
        parkCode: listOfParksArray[i].parkCode,
        entranceFees: listOfParksArray[i].entranceFees[0].cost,
        images: JSON.stringify(listOfParksArray[i].images),
        id: "optionCard",
      });

      // Creates Card-Body Div
      var cardBodyDiv = $("<div class='card-body'></div>");
      // Creates Card Header
      var h5 = $("<h5 class='card-title'></h5>");
      h5.text(listOfParksArray[i].fullName);
      // Creates Card Paragraph
      var p = $("<p class='card-text'></p>");
      p.text(
        `${listOfParksArray[i].addresses[0].city}, ${listOfParksArray[i].addresses[0].stateCode}`
      );

      cardBodyDiv.append(h5, p);
      cardDiv.append(img, cardBodyDiv);
      colDiv.append(cardDiv);
      adventureDiv.append(colDiv);
    }
  }

  // Function - Parse Parks' Standard Hours
  function parseStandardHours(hoursString) {
    var standardHrs = JSON.parse(hoursString);

    var list = $("<ul class='hours'>");
    var listEl = $("<li>");
    listEl.text("Monday: " + standardHrs.Monday);
    list.append(listEl);

    listEl = $("<li>");
    listEl.text("Tuesday: " + standardHrs.Tuesday);
    list.append(listEl);

    listEl = $("<li>");
    listEl.text("Wednesday: " + standardHrs.Wednesday);
    list.append(listEl);

    listEl = $("<li>");
    listEl.text("Thursday: " + standardHrs.Thursday);
    list.append(listEl);
    parkDetailInfo.append(list);

    listEl = $("<li>");
    listEl.text("Friday: " + standardHrs.Friday);
    list.append(listEl);
    listEl = $("<li>");
    listEl.text("Saturday: " + standardHrs.Saturday);
    list.append(listEl);
    listEl = $("<li>");
    listEl.text("Sunday: " + standardHrs.Sunday);
    list.append(listEl);
  }

  //Function - Parse Park Images
  function parseParkImage(imagesObject) {
    var imagesArray = JSON.parse(imagesObject);

    if (imagesArray.length > 1) {
      var carouselDiv = $(
        "<div id='carouselExampleControls' class='carousel slide' data-ride='carousel'></div>"
      );
      var carouselInnerDiv = $("<div class='carousel-inner'></div>");
      var carouselItemDiv = $("<div class='carousel-item active'></div>");
      var imageEl = $("<img>");
      imageEl.attr({
        src: imagesArray[0].url,
        alt: imagesArray[0].altText,
        id: "park-detail-img" + i,
        class: "d-block w-100 h-100",
      });
      carouselItemDiv.append(imageEl);
      carouselInnerDiv.append(carouselItemDiv);

      for (var i = 1; i < imagesArray.length; i++) {
        var carouselItemDiv2 = $("<div class='carousel-item'></div>");
        var imageEl2 = $("<img>");
        imageEl2.attr({
          src: imagesArray[i].url,
          alt: imagesArray[i].altText,
          id: "park-detail-img" + i,
          class: "d-block w-100 h-100",
        });
        carouselItemDiv2.append(imageEl2);
        carouselInnerDiv.append(carouselItemDiv2);
      }

      var carouselCtrlPrev = $(
        "<a class='carousel-control-prev' href='#carouselExampleControls' role='button' data-slide='prev'>"
      );
      var prevSpan = $(
        "<span class='carousel-control-prev-icon' aria-hidden='true'></span>"
      );
      var prevSpan2 = $("<span class='sr-only'>Previous</span>");
      carouselCtrlPrev.append(prevSpan, prevSpan2);
      var carouselCtrlNext = $(
        "<a class='carousel-control-next' href='#carouselExampleControls' role='button' data-slide='next'>"
      );
      var nextSpan = $(
        "<span class='carousel-control-next-icon' aria-hidden='true'></span>"
      );
      var nextSpan2 = $("<span class='sr-only'>Next</span>");
      carouselCtrlNext.append(nextSpan, nextSpan2);

      carouselDiv.append(carouselInnerDiv, carouselCtrlPrev, carouselCtrlNext);
      parkDetailInfo.append(carouselDiv);
    }
  }

  /**
   * FUNCTION CALLS
   */
  getFavoriteList();

  /**
   * EVENT HANDLERS
   */

  // Event Listener - User clicks Address Submit, Address is stored, Call AJAX
  addressSubmit.on("click", function (event) {
    event.preventDefault();

    // Form validation in case the user doesn't enter a state on form
    if (inputState.val() == "none") {
      validationAlert.attr("style", "display:block");
    } else {
      validationAlert.attr("style", "display:none");
      distanceDiv.attr("style", "display:none");
      originalPage.attr("class", "display");
      originalPage.attr("style", "display:Block");
      navMenu.attr("style", "display:block");
      $("#search-park-by-name").attr("style", "display:none");
      userAddress = `${inputAddress.val()}, ${inputCity.val()}, ${inputState.val()} ${inputZip.val()}`;

      ajaxCallNPSbyState(inputState.val());
    }
  });

  // Event Listener for the search form on the navbar
  searchBtn.on("click", function (event) {
    event.preventDefault();

    var term = $(this).siblings().val();
    var searchURL = `https://developer.nps.gov/api/v1/parks/?api_key=PtYiGrnXjG4FL7v9tOprJACeJgJV4KxlTarrmWXF&q=${term}`;

    $.ajax({
      url: searchURL,
      method: "GET",
    }).then(function (response) {
      if (response.data.length > 0) {
        clearScreen();

        // Display nav bar home link only
        displayNavBarHomeLink();

        for (i = 0; i < response.data.length; i++) {
          // Adds Class Card-Deck to Activity Div
          var results = response.data[i];
          adventureDiv.attr("class", "card-deck row row-cols-3 mt-5");
          var colDiv = $("<div class='col mb-4'></div>");
          var cardDiv = $("<div class='card'></div>");

          var img = $(
            "<img class='card-img-top park-image' alt='park-image' style='height: 210px'/>"
          );
          if (results.images[0] != undefined) {
            img.attr("src", results.images[0].url);
          } else {
            img.attr(
              "src",
              "https://files.tripstodiscover.com/files/2018/08/32533575_1785635178193287_5065019941074239488_o.jpg"
            );
          }
          cardDiv.attr(
            "data-value",
            `${results.addresses[0].line1},  ${results.addresses[0].city}, ${results.addresses[0].stateCode} ${results.addresses[0].postalCode}`
          );

          cardDiv.attr({
            name: results.fullName,
            operatingHours: results.operatingHours[0].description,
            standardHours: JSON.stringify(
              results.operatingHours[0].standardHours
            ),
            parkCode: results.parkCode,
            entranceFees: results.entranceFees[0].cost,
            images: JSON.stringify(results.images),
            id: "optionCard",
          });

          // Creates Card-Body Div
          var cardBodyDiv = $("<div class='card-body'></div>");
          // Creates Card Header
          var h5 = $("<h5 class='card-title'></h5>");
          h5.text(results.fullName);
          // Creates Card Paragraph
          var p = $("<p class='card-text'></p>");
          p.text(
            `${results.addresses[0].city}, ${results.addresses[0].stateCode}`
          );

          cardBodyDiv.append(h5, p);
          cardDiv.append(img, cardBodyDiv);
          colDiv.append(cardDiv);
          adventureDiv.append(colDiv);
          $("#directionsDiv").attr("style", "display:none");
        }
      } else {
        $("#noParksModalCenter").modal("show");
      }
    });
  });

  // Event Listener - User clicks Activity Button, Populate the Screen with Activities
  activityBtn.on("click", function () {
    userAdventure = $(this).attr("data-value");
    adventureArray = [
      "Astronomy",
      "Biking",
      "Boating",
      "Camping",
      "Fishing",
      "Food",
      "Guided Tours",
      "Hiking",
      "Junior Ranger Program",
      "Living History",
      "Playground",
      "Skiing",
      "Swimming",
      "Shopping",
      "Wildlife Watching",
    ];

    question = "Which of the following activities most interests you?";
    createButtons(question, adventureDiv, adventureArray);
  });

  // Event Listener - User clicks Topics Button, Populate the Screen with Topics
  topicsBtn.on("click", function () {
    userAdventure = $(this).attr("data-value");
    adventureArray = [
      "African American Heritage",
      "American Revolution",
      "Asian American Heritage",
      "Colonization and Settlement",
      "Great Depression",
      "Hispanic American Heritage",
      "Latino American Heritage",
      "LGBTQ American Heritage",
      "Military",
      "Monuments and Memorials",
      "Native American Heritage",
      "Pacific Islander Heritage",
      "Presidents",
      "Women's History",
    ];

    question = "Which topic would you like to explore?";
    createButtons(question, adventureDiv, adventureArray);
  });

  // Event Listener - User clicks Activity or Topic, Create list of Parks
  adventureDiv.on("click", ".btn", function () {
    var userChoice = $(this).text();
    createListOfParks(userChoice);
  });

  // Created the function inside of the click event so that it had access to local variables
  function parkDetailsFunction(
    name,
    parkCode,
    operatingHours,
    standardHours,
    images,
    to
  ) {
    clearScreen();

    navMenu.attr("style", "display:block");
    navSearchPageOption.addClass("disabled");

    var parkNameText = name;
    //Had to add park code so that local storage could search by code it's hidden on page though
    var parkCodeText = parkCode;
    var parkOperatingHours = operatingHours;
    parkName.text(parkNameText);
    var newParaEl = $("<p>");
    newParaEl.text("Current Operating Details");
    newParaEl.attr("id", "opDetails");
    newParaEl.attr("class", "bold");
    parkDetailInfo.append(newParaEl, parkOperatingHours);
    newParaEl = $("<p class='operating-hours'>")
      .attr("class", "bold")
      .attr("id", "opHours")
      .text("Standard Operating Hours");
    parkDetailInfo.append(newParaEl);
    parseStandardHours(standardHours);
    parseParkImage(images);

    // Favorite button
    var favoriteBtn = $("<button>");
    favoriteBtn.append(
      "<svg width='1.6em' height='1.6em' viewBox='0 0 16 16' class='bi bi-star' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.523-3.356c.329-.314.158-.888-.283-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767l-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288l1.847-3.658 1.846 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.564.564 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z'/></svg>"
    );
    favoriteBtn.attr("id", "favoriteBtn");
    favoriteBtn.attr("class", "btn btn-primary btn-sm mr-3");
    parkName.prepend(favoriteBtn);
    //Go back button
    addGobackBtn(parkDetails, "parkDetailsMainMenu");

    mapsUrl += `from=${userAddress}&to=${to}`;
    $.ajax({
      url: mapsUrl,
      method: "GET",
    }).then(function (response) {
      parkDetails.attr({
        style: "display:block",
        class: "mb-5",
      });
      var orderedDirectionsList = $("<ol>");
      parkDirectionsList.append(orderedDirectionsList);

      for (var i = 0; i < response.route.legs[0].maneuvers.length; i++) {
        var newParaEl = $("<li>");
        newParaEl.text(response.route.legs[0].maneuvers[i].narrative);

        orderedDirectionsList.append(newParaEl);
      }
      var totalDistance = $("<p>").text(
        `Total Distance: ${response.route.distance} miles`
      );
      var travelTime = $("<p>").text(
        `Total time: ${response.route.formattedTime}`
      );
      parkDirectionsList.prepend(totalDistance, travelTime);
    });
  }

  // Event Listener - User clicks one Park, Display Park Details
  adventureDiv.on("click", ".card", function () {
    //clearScreen();
    adventureDiv.attr("style", "display:none");
    adventureDivWrapper.children(".goBackBtnRow").attr("style", "display:none");

    // Fill in the selected park detail
    var parkNameText = $(this).attr("name");
    //Had to add park code so that local storage could search by code
    var parkCodeText = $(this).attr("parkCode");
    var parkOperatingHours = $(this).attr("operatingHours");

    parkName.text(parkNameText);
    parkCode.text(parkCodeText);
    var cost = parseFloat($(this).attr("entranceFees"));
    var newParaEl = $("<p>")
      .attr("class", "bold")
      .text("Current Operating Details");
    var costParaEl = $("<p>")
      .attr("class", "bold mt-4")
      .text("Entrance Fee: $" + cost);
    costParaEl.attr("style", "text-align: left");
    parkDetailInfo.append(newParaEl, parkOperatingHours, costParaEl);
    newParaEl = $("<p class='operating-hours'>")
      .attr("class", "bold")
      .attr("id", "opHours")
      .text("Standard Operating Hours");
    parkDetailInfo.append(newParaEl);
    parseStandardHours($(this).attr("standardHours"));
    parseParkImage($(this).attr("images"));

    var address = $("<p>")
      .attr("class", "bold")
      .text("Address: " + $(this).attr("data-value"));

    var mapsQueryUrl = "";
    mapsQueryUrl =
      mapsUrl + `from=${userAddress}&to=${$(this).attr("data-value")}`;

    // Here's the favorite button for now
    var favoriteBtn = $("<button>");
    favoriteBtn.append(
      "<svg width='1.6em' height='1.6em' viewBox='0 0 16 16' class='bi bi-star' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.523-3.356c.329-.314.158-.888-.283-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767l-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288l1.847-3.658 1.846 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.564.564 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z'/></svg>"
    );
    favoriteBtn.attr("id", "favoriteBtn");
    favoriteBtn.attr("class", "btn btn-primary btn-sm mr-3");
    parkName.prepend(favoriteBtn);
    addGobackBtn(parkDetails, "parkDetails");
    
    //MAPQUEST API call
    $.ajax({
      url: mapsQueryUrl,
      method: "GET",
    }).then(function (response) {
      parkDetails.attr({
        style: "display:block",
        class: "mb-5",
      });
      var orderedDirectionsList = $("<ol>");
      parkDirectionsList.append(orderedDirectionsList);

      for (var i = 0; i < response.route.legs[0].maneuvers.length; i++) {
        var newParaEl = $("<li>");
        newParaEl.text(response.route.legs[0].maneuvers[i].narrative);

        orderedDirectionsList.append(newParaEl);
      }
      var totalDistance = $("<p>").text(
        `Total Distance: ${response.route.distance.toFixed(1)} miles`
      );
      var travelTime = $("<p>").text(
        `Total Time: ${response.route.formattedTime}`
      );
      parkDirectionsList.prepend(address, totalDistance, travelTime);
    });
  });

  //Event listener for add to favorites button
  $(this).on("click", "#favoriteBtn", function () {
    var nameOfPark = parkName.text();
    var code = parkCode.text();
    var faveObject = {
      park: nameOfPark,
      parkCode: code,
    };
    // Found this function here (answer #3): https://stackoverflow.com/questions/22844560/check-if-object-value-exists-within-a-javascript-array-of-objects-and-if-not-add
    const checkArrayForObj = (obj) => obj.park === faveObject.park;
    if (favoriteParks.some(checkArrayForObj) == false) {
      favoriteParks.push(faveObject);
    }
    localStorage.setItem("parks", JSON.stringify(favoriteParks));
    getFavoriteList();
  });

  //Event handler on  the back arrow - to navigate across  the page
  $(document).on("click", ".goBack", function (event) {
    event.preventDefault();
    if ($(this).attr("data-value") === "parkDetails") {
      adventureDiv.attr("style", "display:");
      adventureDivWrapper
        .children(".goBackBtnRow")
        .attr("style", "display:block");
      parkDetails.attr("style", "display:None");
      parkDetailInfo.empty();
      parkDirectionsList.empty();
      parkDetails.children(".goBackBtnRow").remove();
    } else if ($(this).attr("data-value") === "parkDetailsMainMenu") {
      distanceDiv.attr("style", "display:");
      parkDetails.attr("style", "display:none");
      parkDetailInfo.empty();
      parkDirectionsList.empty();
      parkDetails.children(".goBackBtnRow").remove();

      // Hide home/topic-activities
      hideNavBarHomeAndTopicActivityLink();
      // Show park  search
      showParkSearch();
    } else {
      adventureDiv.attr("style", "display:none");

      originalPage.attr("style", "display:block");
      adventureDivWrapper.children(".goBackBtnRow").remove();
      adventureDiv.empty();
    }
  });

  //Nav bar options event handler - home page
  navMainPageOption.on("click", function (event) {
    event.preventDefault();
    window.location.href = "./index.html";
  });

  //Nav bar options event handler - topic and Activities page
  navSearchPageOption.on("click", function (event) {
    event.preventDefault();

    distanceDiv.attr("style", "display:none");

    adventureDiv.attr("style", "display:none");
    adventureDivWrapper.children(".goBackBtnRow").remove();
    adventureDiv.empty();

    originalPage.attr("style", "display:block");

    parkDetails.attr("style", "display:none");
    parkDetailInfo.empty();
    parkDirectionsList.empty();
    parkDetails.children(".goBackBtnRow").remove();
  });

  // Event handler to clear the alert (which is display when no state is selected)
  $("#inputState").on("change", function () {
    if (inputState.val() !== "none") {
      validationAlert.attr("style", "display:none");
    }
  });
});
