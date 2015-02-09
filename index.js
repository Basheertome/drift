var cities = [
	["Honolulu", "Hawaii"],
	[["Anchorage", "Alaska"], ["Unalaska", "Alaska"]],
	[["San Francisco", "California"], ["Anchorage", "Alaska"]],
	[["Denver", "Colorado"], ["San Francisco", "California"]],
	[["Chicago", "Illinois"], ["Denver", "Colorado"]],
	[["New York", "New York"], ["Chicago", "Illinois"]],
	[["Bridgetown", "Barbados"], ["New York", "New York"]],
	[["Nuuk", "Greenland"], ["São Paulo", "Brazil"]],
	[["São Paulo", "Brazil"], ["Nuuk", "Greenland"]],
	["Praia", "Cape Verde"],
	[["London", "UK"], ["Reykjavík", "Iceland"]],
	[["Paris", "France"], ["London", "UK"]],
	[["Istanbul", "Turkey"], ["Paris", "France"]],
	[["Moscow", "Russia"], ["Istanbul", "Turkey"]],
	["Dubai", "United Arab Emirates"],
	["Malé", "Maldives"],
	["Astana", "Kazakhstan"],
	["Bangkok", "Thailand"],
	["Hong Kong", "Hong Kong"],
	["Tokyo", "Japan"],
	["Sydney", "Australia"],
	["Koror", "Palau"],
	[["Auckland", "New Zealand"], ["Funafuti", "Tuvalu"]],
	[["Apia", "Samoa"], ["Auckland", "New Zealand"]]
]

var wake = {time: 8};
var bed = {time: 0};

var date = new Date();

$(document).ready(function(){

	FastClick.attach(document.body);

	$(window).bind('touchmove', function(e) {
		e.preventDefault();
	});

	$('.navigation').click(function(){
		$('.card').toggleClass('flipped');
	});

	$('.stage').css('perspective', $(this).width()*3);
 
	date.hours = date.getHours();
	date.minutes = date.getMinutes();
	date.offset = date.getTimezoneOffset() / -60;
	if (date.minutes > 29) {
		if (date.hours > 22) {
			date.hours = 0;
		} else {
			date.hours++;
		}
	}

	updateWake();
	updateBed();	

	$('select[name*="wakeTime"]').change(function() {
		localStorage.setItem("waketime", $('select[name*="wakeTime"]').val());
		updateWake();
	});

	$('select[name*="bedTime"]').change(function() {
		localStorage.setItem("bedtime", $('select[name*="bedTime"]').val());
		updateBed();
	});

});

function updateWake() {
	if (localStorage.getItem("waketime") != null) {
		var waketime = localStorage.getItem("waketime");
		$('select[name*="wakeTime"]').val(parseInt(waketime));
		wake.time = parseInt(waketime);
	}
	wake.offset = wrapTime(date.offset + wake.time - date.hours);
	writeCity(wake.offset, "wake");
	if (wake.offset == date.offset) {
		writeHere("wake");
	}
}

function updateBed() {
	if (localStorage.getItem("bedtime") != null) {
		var bedtime = localStorage.getItem("bedtime");
		$('select[name*="bedTime"]').val(parseInt(bedtime));
		bed.time = parseInt(bedtime);
	}
	bed.offset = wrapTime(date.offset + bed.time - date.hours);
	writeCity(bed.offset, "bed");
	if (bed.offset == date.offset) {
		writeHere("bed");
	}
}

function wrapTime(offset) {
	if (offset < -10) {
		offset += 24;
	} else if (offset > 13) {
		offset -= 24
	}
	return offset;
}

function writeCity(offset, id) {

	offset = offset + 10;

	if (offset > 0 && offset < 9) {
		// Check for US Daylight Savings Time
		$.getJSON('https://maps.googleapis.com/maps/api/timezone/json?location=40.7127,-74.0059&key=AIzaSyAeCzmj9L300wDUz6Mepkd8C5h2MvdMkAk&timestamp=' + (date.getTime() / 1000), function(data) {
			$('.' + id + ' h2').text(cities[offset][Boolean(data.dstOffset)?1:0][0]);
			$('.' + id + ' h3').text(cities[offset][Boolean(data.dstOffset)?1:0][1]);
		});
	} else if (offset > 9 && offset < 14) {
		// Check for EU Daylight Savings Time
		$.getJSON('https://maps.googleapis.com/maps/api/timezone/json?location=51.5072,-0.1275&key=AIzaSyAeCzmj9L300wDUz6Mepkd8C5h2MvdMkAk&timestamp=' + (date.getTime() / 1000), function(data) {
			$('.' + id + ' h2').text(cities[offset][Boolean(data.dstOffset)?1:0][0]);
			$('.' + id + ' h3').text(cities[offset][Boolean(data.dstOffset)?1:0][1]);
		});
	} else if (offset > 21) {
		// Check for New Zealand Daylight Savings Time
		$.getJSON('https://maps.googleapis.com/maps/api/timezone/json?location=-36.8404,174.7399&key=AIzaSyAeCzmj9L300wDUz6Mepkd8C5h2MvdMkAk&timestamp=' + (date.getTime() / 1000), function(data) {
			$('.' + id + ' h2').text(cities[offset][Boolean(data.dstOffset)?1:0][0]);
			$('.' + id + ' h3').text(cities[offset][Boolean(data.dstOffset)?1:0][1]);
		});
	} else {
		$('.' + id + ' h2').text(cities[offset][0]);
		$('.' + id + ' h3').text(cities[offset][1]);	
	}
	
}

function writeHere(id) {
	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(showPosition);
	}
	function showPosition(position) {
	    $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&result_type=locality&key=AIzaSyAeCzmj9L300wDUz6Mepkd8C5h2MvdMkAk", function(data) {
	    	var city; var state; var country;
	    	$.each(data.results[0].address_components, function(i,item) {
				switch(item.types[0]) {
					case "locality":
						city = item.long_name;
						break;
					case "administrative_area_level_1":
						state = item.long_name;
						break;
					case "country":
						country = item.long_name;
						break;
	    		}
	    	});
	    	if (country === "United States") {
	    		$('.' + id + ' h2').text(city);
	    		$('.' + id + ' h3').text(state);
	    	} else {
	    		$('.' + id + ' h2').text(city);
	    		$('.' + id + ' h3').text(country);
	    	}
	    });
	}
}