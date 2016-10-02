;(function(wind, doc){
	$(function() {

		$('body').on('input', '#s-animal', function() {
			buildBreeds();
		}.bind(this))
		.on('click', '#search-pets', function() {
			searchRequest();
		}.bind(this))
		.on('click', '#random-pets', function() {
			randomRequest();
		}.bind(this));

		$('#results-container').on('click', '.result .select-pet', function(e) {
			selectPet(e);
			$('#myModal').modal('show');
		}.bind(this));
	});

	function selectPet(e) {

		petAPI.setIsModal(true);
		petAPI.setPetId($(e.currentTarget).data('id'))
		petAPI.setType('pet.get');
		petAPI.requestAPI();
	}

	function randomRequest() {
		petAPI.setIsModal(false);
		petAPI.setType('pet.getRandom');
		petAPI.requestAPI();
	}

	function searchRequest() {
		var animalValue = $('#s-animal').val(),
			breedValue = $('#s-breed').val(),
			cityState = $('#s-city-state').val(),
			zipCode = $('#s-zip').val(),
			locationValue;

		if(validate(animalValue)) {
			petAPI.setAnimal(animalValue);
		}

		if(validate(breedValue)) {
			petAPI.setBreed(breedValue);
		}

		if(validate(cityState)) {
			locationValue = cityState;
		}

		if(validate(zipCode)) {
			locationValue = zipCode;
		}

		if(validate(locationValue)) {
			petAPI.setIsModal(false);
			petAPI.setType('pet.find');
			petAPI.setLocation(locationValue);
			petAPI.requestAPI();
		} else{
			alert('You need to set a location');
		}
	}

	function buildBreeds() {
		var animalValue = $('#s-animal').val();

		if(validate(animalValue)) {
			petAPI.setType('breed.list');
			petAPI.setAnimal(animalValue);
			petAPI.requestAPI();
		}
	}

	function validate(value) {
		//check zip
		if (value && (value.length == 5) && (parseFloat(value) == parseInt(value)) && !isNaN(value)) {
			return true;
		} else if (value && (value.length >= 3) && (typeof value == 'string')) {
			return true;
		}
		return false;
	};

})(window, document);
