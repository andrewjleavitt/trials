// This is presentation stuff

window.decorateList = function decorate() {
	$container = $('#photo-list');
	  $container.fadeIn('slow').isotope({
	    itemSelector : '.photo-item',
	  });

	  // filter items when filter link is clicked
	  $('#filters a').click(function(){
	    var selector = $(this).attr('data-filter');
	    $container.isotope({ filter: selector });
	    return false;
	  });

	  $('.photo').hover(
		function() {
			$(this).find('.hover-message').delay(100).fadeIn(800);
			$(this).find('.remove').delay(100).fadeIn(800);
		},
		function() {
			$(this).find('.hover-message').fadeOut('slow');
			$(this).find('.remove').fadeOut('slow');
		}
	  );
}

$(window).load(function(){
  
  window.decorateList;

  $(".detail").fancybox({
	'openEffect' : 'fade',
	'closeEffect' : 'fade',
	'nextEffect' : 'fade',
	'prevEffect' : 'fade',
	'openSpeed' : 'slow',
	'closeSpeed' : 'slow',
	'nextSpeed' : 'slow',
	'prevSpeed' : 'slow',
	'helpers'	: {
		'title'	: {
			'type': 'outside'
		},
	}
  });
});