
// A class that holds the information for each marker on the map.
var MapLocation = function(newName, newLat, newLng, newInfo) {

	// Save a reference to this so that we can easily refer back to the class variables.
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

function listViewModel() {

	var self = this;

	self.query = ko.observable('University of Central Florida');
	self.location = ko.observableArray([]);
	self.categories = ko.obervableArray([]);

	self.foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=SQZ03UD0J4VY5JX4OQDTOAHKJS5L3B4IF2UMOKWCPL0XDYKR&client_secret=L3FVORF4LAN2PJOAYLKDMWOEFEXTRU3L52DYA4PCFOIWOORZ&v=20130815&near=Orlando,FL';
	
	self.$list = $('#locations');

	self.toggleMenu = function() {

		$('body').toggleClass('list-hidden');

		return false;

	};

	self.filterList = function() {
		self.removeMarkers();
		self.$list.empty();

		self.foursquareURL = self.foursquareURL + '&query=' + self.query();

		var results;

		var foursquareRequestTimeout = setTimeout(function() {
			self.$list.append('<li>Could not load locations</li>')
		}, 8000);

		$.ajax(self.foursquareURL, function(data) {
			dataType: 'json'
		}).done(function(data) {

			var venues = data.response.venues;
			var venueInfo;

			console.log(venues);

			for (var i = 0; i < venues.length; i++) {

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

				self.location.push(new MapLocation(venues[i].name, venues[i].location.lat, venues[i].location.lng, venueInfo));
			}

			self.autoCenter();

			clearTimeout(foursquareRequestTimeout);
		});

		self.foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=SQZ03UD0J4VY5JX4OQDTOAHKJS5L3B4IF2UMOKWCPL0XDYKR&client_secret=L3FVORF4LAN2PJOAYLKDMWOEFEXTRU3L52DYA4PCFOIWOORZ&v=20130815&near=Orlando,FL';

		return false;

	};

	self.autoCenter = function() {
	    var limits = new google.maps.LatLngBounds();
	    
	    for (var i = 0; i < self.location().length; i++) {
			limits.extend(self.location()[i].getMarker().getPosition());
		}

	    map.fitBounds(limits);

	    return false;
	};

	self.removeMarkers = function() {

		for (var i = 0; i < self.location().length; i++) {
			self.location()[i].getMarker().setMap(null);
		}

		self.location([]);

		return false;

	};

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

var viewModel = new listViewModel();

ko.applyBindings(viewModel);

viewModel.filterList();