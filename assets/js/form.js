document.addEventListener('DOMContentLoaded', function () {

	// Scroll to a specific element smoothly
	const scrollToElement = (element, callback) => {
		const offset = element.getBoundingClientRect().top + window.pageYOffset - 120;
		window.scrollTo({ top: offset, behavior: 'smooth' });
		if (typeof callback === 'function') {
			setTimeout(callback, 500);
		}
	}

	// Fade in an element with a specific duration
	const fadeInElement = (element, duration = 500) => {
		element.style.opacity = 0;
		element.style.display = 'block';

		let opacity = 0;
		const step = 50 / duration;

		// Interval for gradually increasing opacity to create fade-in effect
		const fade = setInterval(() => {
			opacity += step;
			if (opacity >= 1) {
				opacity = 1;
				clearInterval(fade);
			}
			element.style.opacity = opacity;
		}, 50);
	}

	// Hide all accordion contents except the current one
	const hideAllContentsExcept = (current) => {
		const contents = document.querySelectorAll('.accordion-content');
		contents.forEach(content => {
			if (content !== current) {
				content.style.display = 'none';
			}
		});
	}

	// Deactivate all accordion items
	const deactivateAllItems = () => {
		const items = document.querySelectorAll('.accordion-item');
		items.forEach(item => {
			item.classList.remove('active');
			const selected = item.querySelector('.selected_item');
			if (selected) selected.style.display = 'block';
		});
	}

	// Open a specific accordion item
	const openAccordionItem = (item) => {
		const content = item.querySelector('.accordion-content');
		if (!content) return;

		// Hide all other contents and deactivate all items
		hideAllContentsExcept(content);
		deactivateAllItems();

		// Add active class and hide selected item inside accordion
		item.classList.add('active');
		const selected = item.querySelector('.selected_item');
		if (selected) selected.style.display = 'none';

		// Scroll to the item and then fade in its content
		scrollToElement(item, () => {
			fadeInElement(content, 500);
		});
	}

	// Create an edit button for an accordion item
	const createEditButton = (container, item) => {
		// If an edit button already exists, do not create a new one
		if (container.querySelector('.edit-btn')) return;

		const button = document.createElement('button');
		button.className = 'edit-btn';
		button.textContent = 'Edit';

		// When the edit button is clicked, open the accordion item
		button.addEventListener('click', (e) => {
			e.preventDefault();
			openAccordionItem(item);
		});

		container.appendChild(button);
	}

	// Handle the next button click event
	const handleNextClick = (e) => {
		e.preventDefault();

		const currentItem = e.target.closest('.accordion-item');
		if (!currentItem) return;

		const selected = currentItem.querySelector('.selected_item');
		const checked = currentItem.querySelector('input[type="radio"]:checked');

		// If selected item and checked radio button exist, update selected item and show edit button
		if (selected && checked) {
			selected.textContent = checked.value;
			selected.style.display = 'block';
			createEditButton(selected, currentItem);
		}

		// Open the next item in the accordion if available
		const nextItem = currentItem.nextElementSibling;
		if (nextItem && nextItem.classList.contains('accordion-item')) {
			openAccordionItem(nextItem);
		}
	}

	// Initialize the accordion's state and values
	const initializeAccordion = () => {
		const items = document.querySelectorAll('.accordion-item');
		items.forEach(item => {
			const radios = item.querySelectorAll('input[type="radio"]');
			const selected = item.querySelector('.selected_item');

			radios.forEach(radio => {
				if (radio.checked && selected) {
					if (!item.classList.contains('active')) {
						selected.textContent = radio.value;
						selected.style.display = 'block';
						createEditButton(selected, item);
					} else {
						selected.style.display = 'none';
					}
				}
			});
		});
	}

	// Handle form submission logic
	const initFormSubmission = () => {
		const forms = document.querySelectorAll('form');
		forms.forEach(form => {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();

				const formData = new FormData(form);
				const searchParams = new URLSearchParams(formData).toString();

				const payload = new FormData();
				payload.append('action', 'submit_multi_step_form');
				payload.append('data', searchParams);

				try {
					const response = await fetch('/wp-admin/admin-ajax.php', {
						method: 'POST',
						body: payload,
					});

					const result = await response.text();

					if (response.ok) {
						const accordion = document.querySelector('.accordion');
						if (accordion) accordion.style.display = 'none';

						window.scrollTo({ top: 0, behavior: 'smooth' });

						const success = document.querySelector('.form-success-message');
						if (success) {
							success.style.display = 'block';
							success.style.opacity = 0;
							fadeInElement(success, 300);
						}
					} else {
						alert('AJAX error occurred (non-200)');
					}
				} catch (error) {
					console.error('Fetch error:', error);
				}
			});
		});
	}

	// Initialize radio button highlighting
	const initRadioHighlighting = () => {
		const items = document.querySelectorAll('.accordion-item');
		items.forEach(item => {
			const radios = item.querySelectorAll('input[type="radio"]');
			radios.forEach(radio => {
				radio.addEventListener('change', () => {
					const labels = item.querySelectorAll('label');
					labels.forEach(label => label.classList.remove('active'));

					const label = radio.closest('label');
					if (label) label.classList.add('active');
				});
			});
		});
	}

	// Handle step 6 inputs (if any)
	const initStep6Inputs = () => {
		const inputs = document.querySelectorAll('.accordion-item.step-6 .form-items input');
		inputs.forEach(input => {
			if (input.value.trim() !== '') input.classList.add('has-text');

			input.addEventListener('input', () => {
				if (input.value.trim() !== '') {
					input.classList.add('has-text');
				} else {
					input.classList.remove('has-text');
				}
			});
		});
	}

	// Close success message
	const initCloseButtons = () => {
		const closeButtons = document.querySelectorAll('.form-success-message .close');
		closeButtons.forEach(button => {
			button.addEventListener('click', () => {
				const message = button.closest('.form-success-message');
				if (message) message.style.display = 'none';
			});
		});
	}

	// Initial event bindings
	document.querySelectorAll('.next-btn').forEach(btn => {
		btn.addEventListener('click', handleNextClick);
	});

	document.querySelectorAll('.accordion-header').forEach(header => {
		header.addEventListener('click', () => {
			const item = header.closest('.accordion-item');
			if (item && !item.classList.contains('active')) {
				openAccordionItem(item);
			}
		});
	});

	// Initial state
	document.querySelectorAll('.accordion-content').forEach(content => {
		content.style.display = 'none';
	});

	document.querySelectorAll('.accordion-item.active .accordion-content').forEach(content => {
		content.style.display = 'block';
	});

	// Init all logic
	initializeAccordion();
	initFormSubmission();
	initRadioHighlighting();
	initStep6Inputs();
	initCloseButtons();
});