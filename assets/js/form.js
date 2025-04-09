jQuery( document ).ready(
	function ($) {
		// Function to open accordion item and hide others
		function openAccordionItem($item) {
			const $nextContent = $item.find( '.accordion-content' );
			$( '.accordion-item .accordion-content' ).not( $nextContent ).hide();
			$( '.accordion-item' ).removeClass( 'active' );
			$item.addClass( 'active' );
			scrollToAccordion(
				$item,
				function () {
					$nextContent.stop( true, true ).fadeIn( 500 );
				}
			);
		}

		// Function to scroll to the accordion item with animation
		function scrollToAccordion($item, callback) {
			const offset = $item.offset().top - 120;
			$( 'html, body' ).animate( { scrollTop: offset }, 500, callback );
		}

		// Event handler for "Next" buttons within accordion items
		$( '.next-btn' ).on(
			'click',
			function (e) {
				e.preventDefault();
				const $nextItem = $( this ).closest( '.accordion-item' ).next( '.accordion-item' );
				if ($nextItem.length) {
					openAccordionItem( $nextItem );
				}
			}
		);

		// Event handler for clicking on accordion headers
		$( '.accordion-header' ).on(
			'click',
			function () {
				const $item = $( this ).closest( '.accordion-item' );
				if ( ! $item.hasClass( 'active' )) {
					openAccordionItem( $item );
				}
			}
		);

		// Initialize accordion - hide all content except active item
		$( '.accordion-item .accordion-content' ).hide();
		$( '.accordion-item.active .accordion-content' ).show();

		// AJAX form submission handler
		$( 'form' ).on(
			'submit',
			function (e) {
				e.preventDefault();
				const $form    = $( this );
				const formData = $form.serialize();
				$.ajax(
					{
						url: '/wp-admin/admin-ajax.php', // or your custom endpoint
						type: 'POST',
						data: {
							action: 'submit_multi_step_form',
							data: formData
						},
						success: function (response) {
							// Hide accordion and show success message
							$( '.accordion' ).fadeOut(300, function () {
									$('html, body').animate({scrollTop: 0}, 500);
									$( '.form-success-message' ).fadeIn( 300 );
								}
							);
						},
						error: function (response) {
							alert( 'An error occurred while submitting the form.' );
							console.log( response );
						}
					}
				);
			}
		);

		// Event handler for closing success message
		$( '.form-success-message .close' ).on(
			'click',
			function () {
				$( this ).closest( '.form-success-message' ).fadeOut( 300 ); // Closes message with animation
			}
		);

		// Input field label animation handler
		$( '.accordion-item.step-6 .form-items input' ).each(
			function () {
				// Check on page load
				if ($( this ).val().trim() !== '') {
					$( this ).addClass( 'has-text' );
				}
				// Check on input change
				$( this ).on(
					'input',
					function () {
						if ($( this ).val().trim() !== '') {
							$( this ).addClass( 'has-text' );
						} else {
							$( this ).removeClass( 'has-text' );
						}
					}
				);
			}
		);
	}
);