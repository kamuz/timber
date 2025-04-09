<?php
/**
 * Timber starter-theme
 * https://github.com/timber/starter-theme
 */

use Timber\Timber;

// Load Composer dependencies.
require_once __DIR__ . '/vendor/autoload.php';

require_once __DIR__ . '/src/StarterSite.php';

Timber::init();

// Sets the directories (inside your theme) to find .twig files.
Timber::$dirname = [ 'templates', 'views' ];

new StarterSite();

if( function_exists('acf_add_options_page') ) {
	acf_add_options_page(array(
		'page_title' => 'Multi Step Form Data',
		'menu_title' => 'Form Settings',
		'menu_slug'  => 'multi-step-form',
		'capability' => 'edit_posts',
		'redirect'   => false
	));
}

function enqueue_assets() {
    // CSS
    wp_enqueue_style('site-css', get_template_directory_uri() . '/assets/css/site.css');
    wp_enqueue_style('main-css', get_template_directory_uri() . '/assets/css/main.css');

    // JavaScript
    wp_enqueue_script('form-js', get_template_directory_uri() . '/assets/js/form.js', array('jquery'), '1.0.0', true);
    $script = array(
        'ajaxurl' => admin_url( 'admin-ajax.php' ),
    );
    wp_localize_script( 'form-js', 'my_ajax', $script );
}
add_action('wp_enqueue_scripts', 'enqueue_assets');

function register_form_submission_cpt() {
    register_post_type('form_submission', [
        'label' => 'Form Submissions',
        'public' => true,
        'show_ui' => true,
        'supports' => ['title', 'custom-fields'], // Додаємо підтримку custom fields
        'rewrite' => ['slug' => 'form-submissions'], // Це опціонально, для зміни URL
        'show_in_rest' => true, // Це необхідно для підтримки REST API
        'has_archive'  => true,
    ]);

    // Реєстрація мета для first_name
    register_meta(
        'post',
        'first_name',
        [
            'single'         => true,
            'type'           => 'string',
            'default'        => '',
            'show_in_rest'   => true,  // Це дозволить доступ до цього поля через REST API
            'object_subtype' => 'form_submission',
        ]
    );

    // Реєстрація мета для other fields, наприклад, last_name
    register_meta(
        'post',
        'last_name',
        [
            'single'         => true,
            'type'           => 'string',
            'default'        => '',
            'show_in_rest'   => true,
            'object_subtype' => 'form_submission',
        ]
    );

    // Аналогічно для інших полів (email, color і т.д.)
    register_meta(
        'post',
        'email',
        [
            'single'         => true,
            'type'           => 'string',
            'default'        => '',
            'show_in_rest'   => true,
            'object_subtype' => 'form_submission',
        ]
    );
}
add_action('init', 'register_form_submission_cpt');

function handle_multistep_form() {
	if (isset($_POST['acf'])) {
		$acf_data = $_POST['acf'];

		// Перевірка і збереження даних
		$first_name = isset($acf_data['field_67f5358329811']) ? $acf_data['field_67f5358329811'] : '';
		$last_name = isset($acf_data['field_67f535a729812']) ? $acf_data['field_67f535a729812'] : '';
		$email = isset($acf_data['field_67f535b829813']) ? $acf_data['field_67f535b829813'] : '';
		$color = isset($acf_data['field_67f535c129814']) ? $acf_data['field_67f535c129814'] : '';

		// Створення поста
		$post_id = wp_insert_post([
			'post_title'   => $first_name . ' ' . $last_name,
			'post_status'  => 'publish',
			'post_type'    => 'form_submission',
			'meta_input'   => [
				'first_name' => $first_name,
				'last_name'  => $last_name,
				'email'      => $email,
				'color'      => $color
			],
		]);

		// Відправка email
		$admin_email = get_option('admin_email'); // Адреса адміна з налаштувань
		$subject = 'Нова заявка';
		$message = 'Деталі заявки: ' . print_r($acf_data, true);
		wp_mail($admin_email, $subject, $message);

		// Повертаємо результат у форматі JSON
		wp_send_json_success('Заявка успішно надіслана');
	} else {
		wp_send_json_error('Невірні дані');
	}
	die();  // Завершити виконання
}
add_action('wp_ajax_submit_multistep_form', 'handle_multistep_form'); // Для зареєстрованих користувачів
add_action('wp_ajax_nopriv_submit_multistep_form', 'handle_multistep_form'); // Для незареєстрованих користувачів


function add_form_submission_meta_box() {
    add_meta_box(
        'form_submission_meta', // ID мета-боксу
        'Form Submission Details', // Назва мета-боксу
        'render_form_submission_meta_box', // Функція, яка виводить мета-бокс
        'form_submission', // Тип поста, до якого додається мета-бокс
        'normal', // Позиція мета-боксу (normal, side, advanced)
        'high' // Пріоритет мета-боксу
    );
}
add_action('add_meta_boxes', 'add_form_submission_meta_box');

function render_form_submission_meta_box($post) {
    // Отримуємо значення мета-полів
    $first_name = get_post_meta($post->ID, 'first_name', true);
    $last_name = get_post_meta($post->ID, 'last_name', true);
    $email = get_post_meta($post->ID, 'email', true);
    $color = get_post_meta($post->ID, 'color', true);

    // Виводимо поля в мета-боксі
    ?>
    <table class="form-table">
        <tr>
            <th><label for="first_name">First Name</label></th>
            <td><input type="text" name="first_name" value="<?php echo esc_attr($first_name); ?>" class="regular-text" /></td>
        </tr>
        <tr>
            <th><label for="last_name">Last Name</label></th>
            <td><input type="text" name="last_name" value="<?php echo esc_attr($last_name); ?>" class="regular-text" /></td>
        </tr>
        <tr>
            <th><label for="email">Email</label></th>
            <td><input type="email" name="email" value="<?php echo esc_attr($email); ?>" class="regular-text" /></td>
        </tr>
        <tr>
            <th><label for="color">Color</label></th>
            <td><input type="text" name="color" value="<?php echo esc_attr($color); ?>" class="regular-text" /></td>
        </tr>
    </table>
    <?php
}

function save_form_submission_meta($post_id) {
    // Перевірка, чи це не автозбереження
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return $post_id;

    // Перевірка на дозволи
    if (!current_user_can('edit_post', $post_id)) return $post_id;

    // Оновлення мета-полів
    if (isset($_POST['first_name'])) {
        update_post_meta($post_id, 'first_name', sanitize_text_field($_POST['first_name']));
    }
    if (isset($_POST['last_name'])) {
        update_post_meta($post_id, 'last_name', sanitize_text_field($_POST['last_name']));
    }
    if (isset($_POST['email'])) {
        update_post_meta($post_id, 'email', sanitize_email($_POST['email']));
    }
    if (isset($_POST['color'])) {
        update_post_meta($post_id, 'color', sanitize_text_field($_POST['color']));
    }
}
add_action('save_post', 'save_form_submission_meta');
