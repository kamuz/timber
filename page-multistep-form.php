<?php
/**
 * Template Name: Multi Step Form
 */

use Timber\Timber;

$context            = Timber::context();
$context['post']    = Timber::get_post();
$context['options'] = get_fields( 'options' );

Timber::render( array( 'page-multistep-form.twig' ), $context );
