
// A class that holds the information for each marker on the map.
var MapLocation = function(newName, newLat, newLng, newInfo) {

	// Save a reference to this.
	var self = this;

	// The name of the location.
	this.name = newName

	// Latitude and Longitude coordinates of the location for the Google Maps API.
	this.lat = newLat;
	this.lng = newLng;

	// A boolean that indicates whether the InfoWindow for this location is visible or not.
	this.isOpen = false;

	// A Marker object that places a marker onto the map.
	this.marker = new google.maps.Marker({

		position: {lat: this.lat, lng: this.lng},
		map: map,

	});

	// Turn off any animation for this marker.
	this.marker.setAnimation(null);

	// An InfoWindow object that stores the information for the location.
	this.infoWindow = new google.maps.InfoWindow({

		content: newInfo

	});

	// Register a click event for the marker that opens the InfoWindow and starts the animation or 
	// 		closes the InfoWindow and stops the animation, depending on the current state.
	this.marker.addListener('click', function() {

		if (self.marker.getAnimation() !== null) {
          self.marker.setAnimation(null);
        } else {
          self.marker.setAnimation(google.maps.Animation.BOUNCE);
        }

		if (self.isOpen === true) {
			self.infoWindow.close();
			self.isOpen = false;
		} else {
			self.infoWindow.open(map, self.marker);
			self.isOpen = true;
		}
	})

};

// A method for the MapLocation class that retrieves the marker for a given MapLocation object.
MapLocation.prototype.getMarker = function() {
	return this.marker;
};

// A view model that will be used to bind the DOM elements in index.html to the data in viewmodel.js.
function listViewModel() {

	// Save a reference to this.
	var self = this;

	// An observable and an observable array to provide a link between the view and the model.
	self.query = ko.observable('University of Central Florida');
	self.location = ko.observableArray([]);

	// A template URL used to create Ajax requests for given search queries.
	self.foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=SQZ03UD0J4VY5JX4OQDTOAHKJS5L3B4IF2UMOKWCPL0XDYKR&client_secret=L3FVORF4LAN2PJOAYLKDMWOEFEXTRU3L52DYA4PCFOIWOORZ&v=20130815&near=Orlando,FL';
	
	// An <ul> element that is only used to display errors to the user.
	self.$list = $('#locations');

	// A function to control the Slide-Menu.
	self.toggleMenu = function() {

		$('body').toggleClass('list-hidden');

		return false;

	};

	// A function to filter the list based on the string from the input box.
	self.filterList = function() {

		// Remove all markers or errors from the map.
		self.removeMarkers();
		self.$list.empty();

		// Construct the url for the ajax request.
		self.foursquareURL = self.foursquareURL + '&query=' + self.query();

		// Set a timeout limit for the request.
		var foursquareRequestTimeout = setTimeout(function() {
			self.$list.append('<li>Could not load locations</li>')
		}, 8000);

		// Make an ajax call to retrieve the JSON object containing a list of locations.
		$.ajax(self.foursquareURL, function(data) {
			dataType: 'json'
		}).done(function(data) {

			// Local variables to use for the data retrieval.
			var venues = data.response.venues;
			var venueInfo;

			// For each location,
			for (var i = 0; i < venues.length; i++) {

				// Obtain all relevent information for the location and store it as HTML code.
				venueInfo =	'<div class="window">' +
								'<h2>' +
									(venues[i].name === undefined ? '' : venues[i].name) +
								'</h2>' +
								'<div class="window-info">' +
									'<p>' +
										(venues[i].location.address === undefined ? '' : (venues[i].location.address + ', ')) + 
										(venues[i].location.city === undefined ? '' : (venues[i].location.city + ', ')) + 
										(venues[i].location.state === undefined ? '' : (venues[i].location.state + ' ')) + 
										(venues[i].location.postalCode === undefined ? '' : venues[i].location.postalCode) +
									'<p>' +
									'<p>' +
										(venues[i].contact === undefined ? '' : (venues[i].contact.formattedPhone === undefined ? '' : venues[i].contact.formattedPhone)) +
									'<p>' +
									'<p>' +
										(venues[i].url === undefined ? '' : venues[i].url) +
									'<p>' +
								'</div>' +
							'</div>';

				// Push a new MapLocation object into the observable array with the necessary information to create a Marker and InfoWindow for the location.
				self.location.push(new MapLocation(venues[i].name, venues[i].location.lat, venues[i].location.lng, venueInfo));
			}

			// Center the map around the markers.
			self.autoCenter();

			// Clear the timeout for the request.
			clearTimeout(foursquareRequestTimeout);
		});

		// Prepare the url string for the next function call.
		self.foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=SQZ03UD0J4VY5JX4OQDTOAHKJS5L3B4IF2UMOKWCPL0XDYKR&client_secret=L3FVORF4LAN2PJOAYLKDMWOEFEXTRU3L52DYA4PCFOIWOORZ&v=20130815&near=Orlando,FL';

		return false;

	};

	// A function to center the map around a given set of markers.
	self.autoCenter = function() {
	    var limits = new google.maps.LatLngBounds();
	    
	    for (var i = 0; i < self.location().length; i++) {
			limits.extend(self.location()[i].getMarker().getPosition());
		}

	    map.fitBounds(limits);

	    return false;
	};

	// A function that removes all markers from the map.
	self.removeMarkers = function() {

		for (var i = 0; i < self.location().length; i++) {
			self.location()[i].getMarker().setMap(null);
		}

		self.location([]);

		return false;

	};

	// A function to open or close an InfoWindow for a location whenever a name is clicked from the list.
	self.openInfoWindow = function(location) {

		if (location.marker.getAnimation() !== null) {
          location.marker.setAnimation(null);
        } else {
          location.marker.setAnimation(google.maps.Animation.BOUNCE);
        }

		if (location.isOpen === true) {
			location.infoWindow.close();
			location.isOpen = false;
			return false;
		} else {
			location.infoWindow.open(map, location.marker);
			location.isOpen = true;
			return false;
		}

	};

}

// Create the view model for the application and apply the bindings.
var viewModel = new listViewModel();
ko.applyBindings(viewModel);

// Load the default locations for the application.
viewModel.filterList();