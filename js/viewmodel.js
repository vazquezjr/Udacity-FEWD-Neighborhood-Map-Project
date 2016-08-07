
var MapLocations = function(newLat, newLng) {

	lat: newLat;
	lng: newLng;

};

function listViewModel() {

	var self = this;

	self.toggleMenu = function() {

		$('body').toggleClass('list-hidden');

	}

}

ko.applyBindings(new listViewModel());