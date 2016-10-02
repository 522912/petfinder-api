;(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node, CommonJS-like
		module.exports = factory(require('jquery'));
	} else {
		// Browser globals (root is window)
		root.petAPI = factory(root, root.jQuery, root.md5);
	}
}(this, function (root, $, md5) {
	'use strict';

	var options = {},
		key = '1f0c7f48315c13e63b7b7923cacc7959',
		secret = '065ca35176912ff71ae2836d2f01a172';


	var petAPI = {
			_type: '',
			_animal: '',
			_breed: '',
			_location: '',
			_petId: '',
			_requestURL: '',
			_isModal: '',

		/**
		 * Create Petfinder API request URL
		 * @private
		 * @return {string}          The API request URL
		 */
		createRequestURL: function () {

			var url = 'http://api.petfinder.com/' + this.getType() + '?';
			url += 'key=' + key + '&format=json&output=full&callback=?';

			if (!(typeof this.getAnimal() == 'undefined')) {
				url += '&animal=' + this.getAnimal();
			}

			if (!(typeof this.getBreed() == 'undefined')) {
				url += '&breed=' + this.getBreed();
			}

			if (!(typeof this.getLocation() == 'undefined')) {
				url += '&location=' + this.getLocation();
			}

			if (!(typeof this.getPetId() == 'undefined')) {
				url += '&id=' + this.getPetId();
			}

			this.setRequestURL(url);
		},


		/**
		/**
		 * Get JSONP data for cross-domain AJAX requests
		 * @private
		 * @param  {string}
		 */
		getJSONP: function () {

			var url = this.getRequestURL(),
				that = this;

			$.getJSON(url)
				.done(function(petApiData) {
					if(!that.getIsModal()) {
						if(petApiData.petfinder.breeds) {
							that.displayBreeds(petApiData.petfinder.breeds.breed);
						}

						if(petApiData.petfinder.pets) {
							$('#results-container .result').remove();
							that.displayPets(petApiData.petfinder.pets.pet);
						}

						if(petApiData.petfinder.pet) {
							$('#results-container .result').remove();
							that.buildResult(petApiData.petfinder.pet);
						}
					}

					if(that.getIsModal() && petApiData.petfinder.pet) {
						that.buildModal(petApiData.petfinder.pet);
					}

				})
				.error(function(err) {
					alert('Error retrieving data!');
				});
		},

		/**
		 * basic request for api
		 * @public
		 * @return undefined
		 */
		requestAPI: function () {
			this.createRequestURL();
			this.getJSONP();
		},

		/**
		 * display results of pets
		 * @private
		 * @param data object
		 * @return undefined
		 */
		displayPets: function(data) {
			for (var key in data) {
				this.buildResult(data[key]);
			}
		},

		/**
		 * build display and append results for modal
		 * @public
		 * @param data object
		 * @return undefined
		 */
		buildModal: function (data) {
			$('#myModal .modal-title').html(
				data.name.$t + ' - ' + data.contact.city.$t +', ' + data.contact.state.$t
			);
			var result = '<div class="result row" ></div>',
				petAge = '<div class="pet-age"><span class="b">Age:</span> '+ data.age.$t + '</div>',
				petSex = '<div class="pet-sex"><span class="b">Sex:</span> '+ data.sex.$t + '</div>',
				petSize = '<div class="pet-size"><span class="b">Size:</span> '+ data.size.$t + '</div>',
				petBreed,
				petDescription,
				petType,
				petImage;

			if (!$.isEmptyObject(data.media.photos)) {
				petImage = '<div class="pet-image col-xs-12 col-sm-6"><img src="'+ data.media.photos.photo[2].$t +'"></div>';
			}

			if (!$.isEmptyObject(data.type)) {
				petType = '<div class="pet-type"><span class="b">Animal:</span> '+ data.type.$t + '</div>';
			}

			if (!$.isEmptyObject(data.breeds.breed)) {
				petBreed = '<div class="pet-breed"><span class="b">Breed:</span> ' + data.breeds.breed.$t + '</div>';
			}

			if (!$.isEmptyObject(data.description)) {
				petDescription = '<div class="pet-desc"><span class="b">Description:</span> ' + data.description.$t + '</div>';
			}

			$('#myModal .modal-body .result').remove();
			$('#myModal .modal-body').append(
				$(result)
					.append(petImage)
					.append(
						$('<div class="pet-info col-xs-12 col-sm-6"></div>')
							.append(petType)
							.append(petAge)
							.append(petBreed)
							.append(petDescription)
							.append(petSex)
							.append(petSize)
					)
			);
		},

		/**
		 * build display and append results for random pet
		 * @public
		 * @param data object
		 * @return undefined
		 */
		buildResult: function (data) {
			var result = '<div class="result col-xs-12 col-sm-4 text-center"></div>',
				petName = '<div class="pet-name truncate">'+ data.name.$t + ' - ' + data.contact.city.$t +', ' + data.contact.state.$t +'</div>',
				petSelect = '<button type="button" data-id="'+ data.id.$t +'"class="select-pet btn btn-primary btn-lg btn-block">SELECT</button>',
				petImage;

			if (!$.isEmptyObject(data.media.photos)) {
				petImage = '<div class="pet-image"><img src="'+ data.media.photos.photo[1].$t +'"></div>';
			}

			$('#results-container').append(
				$(result)
					.append(
						$('<div class="panel panel-default r-pod"></div>')
							.append(
								$('<div class="panel-heading"></div>')
									.append(petName)
							)
							.append(
								$('<div class="panel-body"></div>')
									.append(
										petImage
									)
									.append(
										petSelect
									)
					)
				)
			);
		},

		/**
		 * build display and append results for breeds
		 * @public
		 * @param data object
		 * @return undefined
		 */
		displayBreeds: function (data) {
			var containerHtml = '<div class="col-xs-12 col-sm-6 breed-select"></div>',
				selectHtml = '<select id="s-breed" class="form-control"></select>',
				that = this;
			$('#search-tools .breed-select').remove();
			$('#search-tools .tools-animal').after(
				$(containerHtml)
					.append(
						$(selectHtml).append(
							that.breedsSelect(data)
						)
					)

			);

		},

		/**
		 * loop through breeds
		 * @public
		 * @param data object
		 * @return undefined
		 */
		breedsSelect: function (data) {
			var select;
			for (var key in data) {
				select += '<option>'+ data[key].$t +'</option>';
			}

			return select;
		},

		/**
		 * set search type
		 * @public
		 * @param type
		 * @return undefined
		 */
		setType: function(type) {
			this._type = type;
		},

		/**
		 * get search type
		 * @public
		 * @return string
		 */
		getType: function () {
			return this._type;
		},

		/**
		 * set animal
		 * @public
		 * @param animalValue
		 * @return undefined
		 */
		setAnimal: function(animalValue) {
			this._animal = animalValue;
		},

		/**
		 * set breed
		 * @public
		 * @param breedValue
		 * @return undefined
		 */
		setBreed: function(breedValue) {
			this._breed = breedValue;
		},

		/**
		 * set location
		 * @public
		 * @param locationValue
		 * @return undefined
		 */
		setLocation: function(locationValue) {
			this._location = locationValue;
		},

		/**
		 * set pet id
		 * @public
		 * @param petId
		 * @return undefined
		 */
		setPetId: function(petId) {
			this._petId = petId;
		},

		/**
		 * get animal
		 * @public
		 * @return string
		 */
		getAnimal: function() {
			return this._animal;
		},

		/**
		 * get breed
		 * @public
		 * @return string
		 */
		getBreed: function() {
			return this._breed;
		},

		/**
		 * get location
		 * @public
		 * @return string
		 */
		getLocation: function() {
			return this._location;
		},

		/**
		 * get pet id
		 * @public
		 * @return string
		 */
		getPetId: function() {
			return this._petId;
		},

		/**
		 * set request url
		 * @public
		 * @param url
		 * @return undefined
		 */
		setRequestURL: function(url) {
			this._requestURL = url;
		},

		/**
		 * get request url
		 * @public
		 * @return string
		 */
		getRequestURL: function () {
			return this._requestURL;
		},

		/**
		 * set is modal check
		 * @public
		 * @param isModal
		 * @return undefined
		 */
		setIsModal: function (isModal) {
			this._isModal = isModal;
		},

		/**
		 * get is modal check
		 * @public
		 * @return bool
		 */
		getIsModal: function () {
			return this._isModal;
		}

	};


	return petAPI;
}));