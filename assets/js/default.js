


$(function(){
	
	$("body").prepend("<div class='overlay'></div>");
	
	
	
	
	
	
	$(".navbar-toggle").on("click",function(){
		if (!$(".navbar-collapse").hasClass("in")) {
			$(".overlay").show();
		} else {
			$(".overlay").hide();
		}
	});
	
	$(".overlay").on("click",function(){
		$(".navbar-toggle").trigger("click");
	});
	
	$(window).on("scroll",function(){
		$(".overlay").hide();
		$(".navbar-collapse").removeClass("in");
	});
	
	
	
	$(document).on('click', 'a.anchor', function(event){
		event.preventDefault();

		$('html, body').animate({
			scrollTop: $( $.attr(this, 'href') ).offset().top
		}, 500);
	});
	
	
	
	
	
	
	$("#menu-toggle").click(function(e) {
		e.preventDefault();
		$("#wrapper").toggleClass("toggled");
	});
	
	$(".sidebar-overlay").click(function(e) {
		e.preventDefault();
		$("#wrapper").toggleClass("toggled");
	});
	
	$(".sidebar-nav li.parent a").on("click",function(){
		$(".sidebar-nav .nav-sub").removeClass("in");
	});
	
});