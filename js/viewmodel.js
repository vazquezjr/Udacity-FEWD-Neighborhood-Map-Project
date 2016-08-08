
var MapLocations = function(newLat, newLng) {

	var lat = newLat;
	var lng = newLng;
	var marker = new google.maps.Marker({

						position: {lat: lat, lng: lng},
						map: map,

					});

};

function listViewModel() {

	var self = this;

	self.query = ko.observable('');
	self.location = ko.observableArray([]);
	self.foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=SQZ03UD0J4VY5JX4OQDTOAHKJS5L3B4IF2UMOKWCPL0XDYKR&client_secret=L3FVORF4LAN2PJOAYLKDMWOEFEXTRU3L52DYA4PCFOIWOORZ&v=20130815&near=Orlando,FL';

	self.toggleMenu = function() {

		$('body').toggleClass('list-hidden');

	};

	self.filterList = function() {
		self.location([]);
		self.foursquareURL = self.foursquareURL + '&query=' + self.query();

		console.log(self.foursquareURL);

		var results;

		$.ajax(self.foursquareURL, function(data) {
			dataType: 'json'
		}).done(function(data) {
			results = data;
		});

		console.log(results);

	};

}

ko.applyBindings(new listViewModel());