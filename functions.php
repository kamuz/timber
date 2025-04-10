<?php
/**
 * Timber starter-theme
 */

use Timber\Timber;

// Load Composer dependencies.
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/src/StarterSite.php';
Timber::init();

// Sets the directories (inside your theme) to find .twig files.
Timber::$dirname = array( 'templates', 'views' );
new StarterSite();

// Add Setting Page for Form.
if ( function_exists( 'acf_add_options_page' ) ) {
	acf_add_options_page(
		array(
			'page_title' => 'Multi Step Form Data',
			'menu_title' => 'Form Settings',
			'menu_slug'  => 'multi-step-form',
			'capability' => 'edit_posts',
			'redirect'   => false,
		)
	);
}

/**
 * Add JavaScript and CSS
 */
function enqueue_assets() {
	wp_enqueue_style( 'site-css', get_template_directory_uri() . '/assets/css/site.css' );
	wp_enqueue_style( 'main-css', get_template_directory_uri() . '/assets/css/main.css' );
	wp_enqueue_script( 'form-js', get_template_directory_uri() . '/assets/js/form.js', '1.0.0', true );
	$script = array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
	);
	wp_localize_script( 'form-js', 'my_ajax', $script );
}
add_action( 'wp_enqueue_scripts', 'enqueue_assets' );

/**
 * Hangle Multi Step form
 */
function handle_multi_step_form() {
	if ( ! isset( $_POST['data'] ) ) {
		wp_send_json_error( array( 'message' => 'Data not sent.' ) );
	}
	parse_str( $_POST['data'], $form_data );
	// Building a message from all fields.
	$message = "New form submission received:\n\n";
	foreach ( $form_data as $key => $value ) {
		if ( is_array( $value ) ) {
			$value = implode( ', ', array_map( 'sanitize_text_field', $value ) );
		} else {
			$value = sanitize_text_field( $value );
		}
		$label    = ucwords( str_replace( '_', ' ', $key ) );
		$message .= "{$label}: {$value}\n";
	}
	// Recipient email.
	$admin_email = 'v.kamuz@gmail.com';
	$subject     = 'New Form Submission';
	$headers     = array( 'Content-Type: text/plain; charset=UTF-8' );
	$sent        = wp_mail( $admin_email, $subject, $message, $headers );
	if ( $sent ) {
		wp_send_json_success(
			array(
				'message' => 'Form successfully submitted.',
				'debug'   => array(
					'email'   => $admin_email,
					'subject' => $subject,
					'message' => $message,
				),
			)
		);
	} else {
		wp_send_json_error(
			array(
				'message' => 'Error sending email.',
				'debug'   => error_get_last(),
			)
		);
	}
}
add_action( 'wp_ajax_submit_multi_step_form', 'handle_multi_step_form' );
add_action( 'wp_ajax_nopriv_submit_multi_step_form', 'handle_multi_step_form' );