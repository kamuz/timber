document.addEventListener('DOMContentLoaded', function () {
	const ACCORDION_OFFSET = 120;

	function scrollToElement(element, callback) {
		const offset = element.getBoundingClientRect().top + window.pageYOffset - ACCORDION_OFFSET;
		window.scrollTo({ top: offset, behavior: 'smooth' });
		if (typeof callback === 'function') {
			setTimeout(callback, 500);
		}
	}

	function fadeInElement(element, duration = 500) {
		element.style.opacity = 0;
		element.style.display = 'block';

		let opacity = 0;
		const step = 50 / duration;

		const fade = setInterval(() => {
			opacity += step;
			if (opacity >= 1) {
				opacity = 1;
				clearInterval(fade);
			}
			element.style.opacity = opacity;
		}, 50);
	}

	function hideAllContentsExcept(current) {
		const contents = document.querySelectorAll('.accordion-content');
		contents.forEach(content => {
			if (content !== current) {
				content.style.display = 'none';
			}
		});
	}

	function deactivateAllItems() {
		const items = document.querySelectorAll('.accordion-item');
		items.forEach(item => {
			item.classList.remove('active');
			const selected = item.querySelector('.selected_item');
			if (selected) selected.style.display = 'block';
		});
	}

	function openAccordionItem(item) {
		const content = item.querySelector('.accordion-content');
		if (!content) return;

		hideAllContentsExcept(content);
		deactivateAllItems();

		item.classList.add('active');

		const selected = item.querySelector('.selected_item');
		if (selected) selected.style.display = 'none';

		scrollToElement(item, function () {
			fadeInElement(content, 500);
		});
	}

	function createEditButton(container, item) {
		if (container.querySelector('.edit-btn')) return;

		const button = document.createElement('button');
		button.className = 'edit-btn';
		button.textContent = 'Edit';

		button.addEventListener('click', function (e) {
			e.preventDefault();
			openAccordionItem(item);
		});

		container.appendChild(button);
	}

	function handleNextClick(e) {
		e.preventDefault();

		const currentItem = e.target.closest('.accordion-item');
		if (!currentItem) return;

		const selected = currentItem.querySelector('.selected_item');
		const checked = currentItem.querySelector('input[type="radio"]:checked');

		if (selected && checked) {
			selected.textContent = checked.value;
			selected.style.display = 'block';
			createEditButton(selected, currentItem);
		}

		const nextItem = currentItem.nextElementSibling;
		if (nextItem && nextItem.classList.contains('accordion-item')) {
			openAccordionItem(nextItem);
		}
	}

	function initializeAccordion() {
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

	function initFormSubmission() {
		const forms = document.querySelectorAll('form');
		forms.forEach(form => {
			form.addEventListener('submit', async function (e) {
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

	function initRadioHighlighting() {
		const items = document.querySelectorAll('.accordion-item');
		items.forEach(item => {
			const radios = item.querySelectorAll('input[type="radio"]');
			radios.forEach(radio => {
				radio.addEventListener('change', function () {
					const labels = item.querySelectorAll('label');
					labels.forEach(label => label.classList.remove('active'));

					const label = radio.closest('label');
					if (label) label.classList.add('active');
				});
			});
		});
	}

	function initStep6Inputs() {
		const inputs = document.querySelectorAll('.accordion-item.step-6 .form-items input');
		inputs.forEach(input => {
			if (input.value.trim() !== '') input.classList.add('has-text');

			input.addEventListener('input', function () {
				if (input.value.trim() !== '') {
					input.classList.add('has-text');
				} else {
					input.classList.remove('has-text');
				}
			});
		});
	}

	function initCloseButtons() {
		const closeButtons = document.querySelectorAll('.form-success-message .close');
		closeButtons.forEach(button => {
			button.addEventListener('click', function () {
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
		header.addEventListener('click', function () {
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
