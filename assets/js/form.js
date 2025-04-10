document.addEventListener('DOMContentLoaded', function () {
	// Function to open an accordion item and hide others
	function openAccordionItem(item) {
		var nextContent = item.querySelector('.accordion-content');

		// Hide all other accordion contents
		var allContents = document.querySelectorAll('.accordion-item .accordion-content');
		for (var i = 0; i < allContents.length; i++) {
			if (allContents[i] !== nextContent) {
				allContents[i].style.display = 'none';
			}
		}

		// Remove 'active' class from all items
		var allItems = document.querySelectorAll('.accordion-item');
		for (var i = 0; i < allItems.length; i++) {
			allItems[i].classList.remove('active');
		}

		// Add 'active' class to the selected item
		item.classList.add('active');

		// Scroll to the item and fade in its content
		scrollToAccordion(item, function () {
			fadeIn(nextContent, 500);
		});
	}

	// Function to scroll to the accordion item with animation
	function scrollToAccordion(item, callback) {
		var offset = item.getBoundingClientRect().top + window.pageYOffset - 120;
		window.scrollTo({ top: offset, behavior: 'smooth' });
		if (typeof callback === 'function') {
			setTimeout(callback, 500);
		}
	}

	// Simple fadeIn effect using opacity transition
	function fadeIn(element, duration) {
		element.style.opacity = 0;
		element.style.display = 'block';
		var opacity = 0;
		var step = 50 / duration;

		var fade = setInterval(function () {
			opacity += step;
			if (opacity >= 1) {
				opacity = 1;
				clearInterval(fade);
			}
			element.style.opacity = opacity;
		}, 50);
	}

	// "Next" button click handler
	var nextButtons = document.querySelectorAll('.next-btn');
	for (var i = 0; i < nextButtons.length; i++) {
		nextButtons[i].addEventListener('click', function (e) {
			e.preventDefault();
			var currentItem = this.closest('.accordion-item');
			if (currentItem) {
				var nextItem = currentItem.nextElementSibling;
				if (nextItem && nextItem.classList.contains('accordion-item')) {
					openAccordionItem(nextItem);
				}
			}
		});
	}

	// Accordion header click handler
	var headers = document.querySelectorAll('.accordion-header');
	for (var i = 0; i < headers.length; i++) {
		headers[i].addEventListener('click', function () {
			var item = this.closest('.accordion-item');
			if (item && !item.classList.contains('active')) {
				openAccordionItem(item);
			}
		});
	}

	// Initialize accordion: hide all contents except those in active items
	var allContents = document.querySelectorAll('.accordion-item .accordion-content');
	for (var i = 0; i < allContents.length; i++) {
		allContents[i].style.display = 'none';
	}
	var activeContents = document.querySelectorAll('.accordion-item.active .accordion-content');
	for (var i = 0; i < activeContents.length; i++) {
		activeContents[i].style.display = 'block';
	}

	// Form submission with AJAX
	var forms = document.querySelectorAll('form');
	for (var i = 0; i < forms.length; i++) {
		forms[i].addEventListener('submit', function (e) {
			e.preventDefault();
			console.log('Form submit triggered');

			// Create a FormData object from the form
			var originalFormData = new FormData(this);
			// Convert FormData to a query string
			var params = new URLSearchParams();
			originalFormData.forEach(function(value, key) {
				params.append(key, value);
			});
			var formSerialized = params.toString();

			console.log('Serialized FormData:', formSerialized);

			// Create a new FormData object for AJAX request
			var sendData = new FormData();
			sendData.append('action', 'submit_multi_step_form');
			sendData.append('data', formSerialized);

			console.log('Sending AJAX request with data:');
			for (var pair of sendData.entries()) {
				console.log(pair[0] + ': ' + pair[1]);
			}

			var xhr = new XMLHttpRequest();
			xhr.open('POST', '/wp-admin/admin-ajax.php', true);

			xhr.onload = function () {
				console.log('XHR response status:', xhr.status);
				console.log('XHR response text:', xhr.responseText);
				if (xhr.status === 200) {
					var accordion = document.querySelector('.accordion');
					if (accordion) {
						accordion.style.display = 'none';
					}
					window.scrollTo({ top: 0, behavior: 'smooth' });

					var successMessage = document.querySelector('.form-success-message');
					if (successMessage) {
						successMessage.style.display = 'block';
						successMessage.style.opacity = 0;
						fadeIn(successMessage, 300);
					}
				} else {
					alert('AJAX error occurred (non-200)');
					console.error(xhr.responseText);
				}
			};

			xhr.onerror = function () {
				console.error('XHR error triggered');
				console.error(xhr.responseText);
			};

			console.log('Sending AJAX request...');
			xhr.send(sendData);
		});
	}

	// Close success message on click
	var closeButtons = document.querySelectorAll('.form-success-message .close');
	for (var i = 0; i < closeButtons.length; i++) {
		closeButtons[i].addEventListener('click', function () {
			var message = this.closest('.form-success-message');
			if (message) {
				message.style.display = 'none';
			}
		});
	}

	// Input field label animation for step 6
	var step6Inputs = document.querySelectorAll('.accordion-item.step-6 .form-items input');
	for (var i = 0; i < step6Inputs.length; i++) {
		var input = step6Inputs[i];
		// Initial check
		if (input.value.trim() !== '') {
			input.classList.add('has-text');
		}
		// Check on input change
		input.addEventListener('input', function () {
			if (this.value.trim() !== '') {
				this.classList.add('has-text');
			} else {
				this.classList.remove('has-text');
			}
		});
	}
});