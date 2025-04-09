jQuery(document).ready(function($) {
  function openAccordionItem($item) {
    $('.accordion-item.active .accordion-content').stop(true, true).fadeOut(500);
    $('.accordion-item').removeClass('active');

    $item.addClass('active');
    $item.find('.accordion-content').stop(true, true).fadeIn(500);
  }

  $('.next-btn').on('click', function() {
    const $currentItem = $(this).closest('.accordion-item');
    const $nextItem = $currentItem.next('.accordion-item');

    if ($nextItem.length) {
      openAccordionItem($nextItem);
    }
  });

  $('.accordion-header').on('click', function() {
    const $item = $(this).closest('.accordion-item');
    if (!$item.hasClass('active')) {
      openAccordionItem($item);
    }
  });

  $('.accordion-item.active .accordion-content').show();
});
