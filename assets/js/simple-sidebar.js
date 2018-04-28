$(function(){
	
	$(window).on("resize",function(){
		if ($(window).width()<996){
			$("#wrapper").removeClass("toggled");
		} else {
			$("#wrapper").addClass("toggled");
		}
		
		$(".sidebar-overlay").hide();
	});
	
	if ($(window).width()>=996){
		$("#wrapper").addClass("toggled");
	}
	
	
});

$(window).on("load",function(){
	
	$("body").prepend("<div class='sidebar-overlay'></div>");
	
	
	$("#menu-toggle").click(function(e) {
		e.preventDefault();
		$("#wrapper").toggleClass("toggled");
		$(".sidebar-overlay").show();
	});
	
	$(".sidebar-overlay").click(function(e) {
		e.preventDefault();
		$("#wrapper").toggleClass("toggled");
		$(".sidebar-overlay").hide();
	});
	
});