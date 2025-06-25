﻿// Keeps track if a series link was clicked - used in enableImageSeriesLinks()
var series_link_clicked = false;
var series_link_clicked_index = null;
// Keeps track of tags and which images to show - used in ready()'s shuffle function and createTagsDropdown()
var tags_to_show = {};
// Keeps track if Show All mode is on
var show_all_mode = false;
var showing_art = true;
var showing_ships = false;

// When the document finished loading and is ready...
$(document).ready(function() {
	$("#art-button").addClass("art-button-active");

	// The gallery images from data.js
	var images = all_commissions.images;

	// The ship images from all_ships.js
	var ships = all_ships.images;

	// Set of tags collected from the images
	const tags = new Set();
	const ship_tags = new Set();
	setUpGallery(images, tags, false);
	createDatePickerDropdown();
	createTagsDropdown(tags);
	showDefaultImages();
	updateImageCountLabel();

	$("#art-button").click(function() {
		$("#showType").html("Gallery");
		$("#countType").html("commissions");
		$(this).addClass("art-button-active");
		$("#ships-button").removeClass("ships-button-active");
		$("#shuffle").show();
		$("#datepicker-button").show();
		show_all_mode = false;
		$("#show-all").removeClass("show-all-button-active");
		showing_art = true;
		showing_ships = false;
		setUpGallery(images, tags, false);
		createDatePickerDropdown();
		createTagsDropdown(tags);
		showDefaultImages();
		updateImageCountLabel();
	});

	$("#ships-button").click(function() {
		$("#showType").html("Ships");
		$("#countType").html("ships");
		$(this).addClass("ships-button-active");
		$("#art-button").removeClass("art-button-active");
		$("#shuffle").hide();
		$("#datepicker-button").hide();
		show_all_mode = false;
		$("#show-all").removeClass("show-all-button-active");
		showing_ships = true;
		showing_art = false;
		setUpShips(ships, ship_tags, false);
		createTagsDropdown(ship_tags);
		showDefaultShips();
		updateImageCountLabel();

	});

	// Shuffle the image order when the shuffle button is clicked
	$("#shuffle").click(function() {
		setUpGallery(images, tags, true);

		if (!show_all_mode) {
			// Show only the images that need to be shown (filtering by tags)
			showImagesThatMatch();
		}
	});

	// Shows all images and resets the Filter
	$("#show-all").click(function() {
		if (show_all_mode) {
			// Toggle of show all mode which will revert to default images
			show_all_mode = false;
			$(this).removeClass("show-all-button-active");
			if(showing_art == true ){ 
						showDefaultImages();

			}
			else {
				showDefaultShips();
			}
			return;
		}
		else {
			show_all_mode = true;
			var nsfw_confirmation = nsfwVerification();
			if (!nsfw_confirmation) {
				show_all_mode = false;
				return;
			}
		}
		// Handle when show all mode is turned on
		// Reset filter and search bar and then show all images
		$(this).addClass("show-all-button-active");
		$("#tags-dropdown input[type=checkbox]").each(function() {
			if($(this).closest("li").hasClass("active")) {
				this.click();
			}
		});
		document.getElementById("search-bar").value = "";
		$("#year").val("None");
		$("#month").val("None");
		var images = all_commissions.images;
		var search_str = document.getElementById("search-bar").value.toLowerCase();
		for (var i = 0; i < images.length; i++) {
			$("#img"+i).show();
		}
		$(".hidden-image").hide();
		updateImageCountLabel();
	});

	// Handle closing the modal when the back button is clicked
	backButtonHideModal();

	// If the URL has a hash, then open that image based on the hash index
	if (window.location.hash) {
		var hash_index = window.location.hash.substring(1);
		// Permalink disabled for this site
		//$("#img"+hash_index).click();
	}
});

// Create the gallery image modal description section
function getModalDescText(image) {
	text = "";
	if (image.src.length == 1) {
		text += "1 image<br/><br/>";
	}
	else {
		text += ""+image.src.length+" images<br/><br/>";
	}
	text += "<strong>Artist:</strong> "+image.artist+"<br/>";

	if (image.artist_url == null) {
		text += "";
	}
	else {
		text += "<strong><a href='"+image.artist_url+"' data-bs-toggle='tooltip' data-bs-placement='right' title='"+image.artist_url+"' target='_blank'>Artist's Page</a></strong><br/>";
	}

	if (image.art_url == null) {
		text += "Artwork was not posted publicly.<br/>";
	}
	else {
		text += "<strong><a href='"+image.art_url+"' data-bs-toggle='tooltip' data-bs-placement='right' title='"+image.art_url+"' target='_blank'>Art Source</a></strong><br/>";
	}

	text += "<br/><i>" + image.quote + "</i><br/>";
	text += "<br/><strong>Description:</strong><br/>" + image.desc + "<br/>";

	text += "<br/>[" + image.date_str + "]<br/>";

	if (image.tags.length == 0) {
		text += "<br/><strong>No tags</strong><br/>";
	}
	else if (image.tags.length == 1 && image.tags[0] == "") {
		text += "<br/><strong>No tags</strong><br/>";
	}
	else {
		text += "<br/><strong>Tags:</strong> "
		for (var i = 0; i < image.tags.length; i += 1) {
			text += translateWord(image.tags[i])
			if (i < image.tags.length - 1) {
				text += " + "
			}
		}
	}

	return text;
}

// Create the gallery image modal description section
function getShipModalDescText(image) {
	text = "";
	if (image.src.length == 1) {
		text += "1 image<br/><br/>";
	}
	else {
		text += ""+image.src.length+" images<br/><br/>";
	}

	if(image.timeline_1 == image.timeline_2) {
		text += "<strong>Timeline: </strong>" + image.timeline_1 + "<br/><br/>";
	}
	else {
		text += "<strong>" + image.character_1 + "'s Timeline: </strong>" + image.timeline_1 + "<br/>";
		text += "<strong>" + image.character_2 + "'s Timeline: </strong>" + image.timeline_2 + "<br/><br/>";
	}

	text += "<strong>Background:</strong><br/>" + image.desc;

	text += "<br/><br/><strong>History:</strong><br/>" + image.history + "<br/>";

	return text;
}

// Enable tooltips
function enableTooltips() {
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl)
	})
}

// Shuffle an array (Fisher-Yates [aka Knuth] Shuffle)
function shuffle(array) {
	var currentIndex = array.length,  randomIndex;
	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

function setUpGallery(images, tags, shuffleOrder) {
	$(".modal-dialog").removeClass("dialog-ship");
	// The indexes of the images array which will determine in which order the images will be displayed in the gallery
	var images_indexes = [...Array(images.length).keys()];
	$(".carousel-inner").removeClass("carousel-inner-padding-ship");
	
	// Shuffle the images indexes for a random order every time the page is loaded
	if (shuffleOrder) {
		shuffle(images_indexes);
	}
	var gallery_html = "";
	// For every image, display it in the gallery
	for (var i = 0; i < images_indexes.length; i += 1) {
		var index = images_indexes[i];
		var image = images[index];
		var tags_class = image.tags.join(" ");	// CSS classes for tags
		// Add tag to the tags set
		for (var t = 0; t < image.tags.length; t += 1) {
			tags.add(image.tags[t]);
		}
		// If image is hidden, then don't show it
		gallery_html += "<a data-bs-toggle='modal' data-bs-target='#imageModal' class='gallery-img"+((image.hidden) ? " hidden-image" : "") +"' index='"+index+"' id='img"+index+"'><img src='"+image.thumbnail+"' alt='"+image.alt+"' index='"+index+"' class='"+tags_class+"'><div class='thumbnail-title'>"+image.title+"</div></a>";
	}
	$("#gallery").html(gallery_html);

	// Add a click listener to open a modal when an image in the gallery is clicked
	for (var i = 0; i < images.length; i += 1) {
		$("#img"+i).click(function() {
			// The index number is the number assigned when the gallery was created (corresponds to the index of the images array in data.js)
			var index = +($(this).attr("index"));
			$("#imageModalLabel").html(images[index].title);
			$("#artModalQuote").html(images[index].quote);
			
			// Create the carousel for the image(s)
			var src = images[index].src;
			var carousel_html = "";
			for (var j = 0; j < src.length; j += 1) {

				// The first image in the carousel is active
				if (j == 0) {
					carousel_html += "<div class='carousel-item active'>";
				}
				else {
					carousel_html += "<div class='carousel-item'>";
				}

				// If there are multiple images, then have the carousel images be a bit small to show the controls
				// Otherwise, have the carousel image span across the entire width available
				if (src.length > 1) {
					carousel_html += "<img src='"+ src[j] +"' class='d-block img-carousel-responsive' alt='...'>";
				}
				else {
					carousel_html += "<img src='"+ src[j] +"' class='d-block img-responsive' alt='...'>";
				}
				carousel_html += "</div>"
				$("#imageModalImage").html(carousel_html);
			}
			// If there are multiple images, then show the carousel controls and indicators and make the image slightly smaller
			// Otherwise, hide them
			if (src.length > 1) {
				$(".carousel-control-prev").show();
				$(".carousel-control-next").show();
				$(".carousel-indicators").show();
				var indicator_html = "";
				for (var j = 0; j < src.length; j += 1) {
					if (j == 0) {
						indicator_html += "<button type='button' data-bs-target='#modal-carousel' data-bs-slide-to='"+j+"' class='active' aria-current='true' aria-label='Slide "+(j+1)+"'></button>";
					}
					else {
						indicator_html += "<button type='button' data-bs-target='#modal-carousel' data-bs-slide-to='"+j+"' aria-label='Slide "+(j+1)+"'></button>";
					}
				}
				$(".carousel-indicators").html(indicator_html);
				$(".carousel-inner").addClass("carousel-inner-padding");
				$("#imageModalDesc").addClass("imageModalDescPadding");
			}
			else {
				$(".carousel-control-prev").hide();
				$(".carousel-control-next").hide();
				$(".carousel-indicators").hide();
				$(".carousel-inner").removeClass("carousel-inner-padding");
				$("#imageModalDesc").removeClass("imageModalDescPadding");
			}
			$("#imageModalDesc").html(getModalDescText(images[index]));
			enableImageSeriesLinks();
			//enableTooltips();
			$("#imageModal").modal("show", $(this));
		});
	}
	updateImageCountLabel();
}

function setUpShips(images, tags) {
	$(".modal-dialog").addClass("dialog-ship");
	// The indexes of the images array which will determine in which order the images will be displayed in the gallery
	var images_indexes = [...Array(images.length).keys()];
	
	$(".carousel-inner").addClass("carousel-inner-padding-ship");

	var gallery_html = "";
	// For every image, display it in the gallery
	for (var i = 0; i < images_indexes.length; i += 1) {
		var index = images_indexes[i];
		var image = images[index];
		var tags_class = image.tags.join(" ");	// CSS classes for tags
		// Add tag to the tags set
		for (var t = 0; t < image.tags.length; t += 1) {
			tags.add(image.tags[t]);
		}
		// If image is hidden, then don't show it
		gallery_html += "<a data-bs-toggle='modal' data-bs-target='#shipModal' class='gallery-img"+((image.hidden) ? " hidden-image" : "") +"' index='"+index+"' id='img"+index+"'><img src='"+image.thumbnail+"' alt='"+image.alt+"' index='"+index+"' class='"+tags_class+"'><div class='thumbnail-title'>"+image.title+"</div></a>";
	}
	$("#gallery").html(gallery_html);

	// Add a click listener to open a modal when an image in the gallery is clicked
	for (var i = 0; i < images.length; i += 1) {
		$("#img"+i).click(function() {
			// The index number is the number assigned when the gallery was created (corresponds to the index of the images array in data.js)
			var index = +($(this).attr("index"));
			$("#shipModalLabel").html(images[index].title);
			$("#shipModalQuote").html(images[index].quote);
			// Create the carousel for the image(s)
			var src = images[index].src;
			var carousel_html = "";
			for (var j = 0; j < src.length; j += 1) {

				// The first image in the carousel is active
				if (j == 0) {
					carousel_html += "<div class='carousel-item active'>";
				}
				else {
					carousel_html += "<div class='carousel-item'>";
				}

				// If there are multiple images, then have the carousel images be a bit small to show the controls
				// Otherwise, have the carousel image span across the entire width available
				if (src.length > 1) {
					carousel_html += "<img src='"+ src[j] +"' class='d-block img-carousel-responsive' alt='...'>";
				}
				else {
					carousel_html += "<img src='"+ src[j] +"' class='d-block img-responsive' alt='...'>";
				}
				carousel_html += "</div>"
				$("#shipModalImage").html(carousel_html);
			}
			// If there are multiple images, then show the carousel controls and indicators and make the image slightly smaller
			// Otherwise, hide them

			if (src.length > 1) {
				$(".carousel-control-prev").show();
				$(".carousel-control-next").show();
				$(".carousel-indicators").show();
				var indicator_html = "";
				for (var j = 0; j < src.length; j += 1) {
					if (j == 0) {
						indicator_html += "<button type='button' data-bs-target='#modal-carousel2' data-bs-slide-to='"+j+"' class='active' aria-current='true' aria-label='Slide "+(j+1)+"'></button>";
					}
					else {
						indicator_html += "<button type='button' data-bs-target='#modal-carousel2' data-bs-slide-to='"+j+"' aria-label='Slide "+(j+1)+"'></button>";
					}
				}
				$(".carousel-indicators").html(indicator_html);
				$(".carousel-inner").addClass("carousel-inner-padding");
				$("#shipModalDesc").addClass("shipModalDescPadding");
			}
			else {
				$(".carousel-control-prev").hide();
				$(".carousel-control-next").hide();
				$(".carousel-indicators").hide();
				$(".carousel-inner").removeClass("carousel-inner-padding");
				$("#shipModalDesc").removeClass("shipModalDescPadding");
			}
			$("#shipModalDesc").html(getShipModalDescText(images[index]));
			enableImageSeriesLinks();
			//enableTooltips();
			$("#shipModal").modal("show", $(this));
		});
	}
	updateImageCountLabel();
}

// Update the image count label
function updateImageCountLabel() {
	var numOfVisibleImages = $(".gallery-img > img:visible").length;
	if(showing_ships == true) {
		$("#count").html(numOfVisibleImages + " of my ships");
	}
	else {
		$("#count").html(numOfVisibleImages + " of my commissions");
	}
}

// Map a string to another string
function translateWord(word) {
	var translations = {
		sfw: "🟢 SFW",
		nsfw: "🔴 NSFW",
		gifts_given: "🎁 Gifts (to others)",
		gifts_received: "🎁 Gifts (from others)",
		male_robin_lucina: "💕 M!Robin/Lucina",
		female_robin_lucina: "💕 F!Robin/Lucina",
		larcei_morgan: "💕 Larcei/Morgan",
		shamir_kiria: "💕 Shamir/Kiria",
		ike_mia: "💕 Ike/Mia",
		mia_lucina: "💕 Mia/Lucina",
		ayra_altina: "💕 Ayra/Altina",
		alcryst_lapis: "💕 Alcryst/Lapis",
		kloe_rixia: "💕 Kloe/Rixia",
		other_ships: "💕 Other Ships",
		solo: "👤 Solo Character",
		fe: "🔥 Fire Emblem",
		non_fe: " 🟣 Other Series",
		pokemon: "⚪ Pokemon",
		granblue: "☁ Granblue Fantasy",
		trails: "⚔ Trails",
		twewy: "🏙 TWEWY",
		mmd: "💻 MMD"
	};
	if (word in translations) {
		return translations[word];
	}
	else {
		return word;
	}
}

// Create date picker dropdown
function createDatePickerDropdown() {
	// Start the counter at 2021
	var year_dropdown_HTML = "<option selected value='None'>None</option>";
	for (var i = 2021; i <= new Date().getFullYear(); i += 1) {
		year_dropdown_HTML += "<option value='"+i+"'>"+i+"</option>";
	}
	$("#year").html(year_dropdown_HTML);

	var month_dropdown_HTML = "<option selected value='None'>None</option>";
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	for (var i = 0; i < months.length; i += 1) {
		month_dropdown_HTML += "<option value='"+months[i]+"'>"+months[i]+"</option>";
	}
	$("#month").html(month_dropdown_HTML);

	$(".datepicker-option").on("change", function() {
		var year = $("#year").val();
		var month = $("#month").val();
		show_all_mode = false;
		$("#show-all").removeClass("show-all-button-active");
		showImagesThatMatch();
	});

	$("#datepicker-reset").click(function() {
		$("#year").val("None");
		$("#month").val("None");
		showImagesThatMatch();
	});
}

// Create the tags dropdown menu
function createTagsDropdown(tags) {
	// Delete the empty string tag
	tags.delete("");

	tags_to_show = {};

	// Create the dropdown options
	var tags_dropdown_HTML = "";
	tags.forEach (function(value) {
		tags_dropdown_HTML += "<li><label><input type='checkbox' value='"+value+"'> <strong>"+translateWord(value)+"</strong></label></li>"
		tags_to_show[value] = false;
	});
	$("#tags-dropdown").html(tags_dropdown_HTML);

	// When a checkbox is checked/unchecked in the dropdown menu...
	$(".checkbox-menu").on("change", "input[type='checkbox']", function() {
		var tag = $(this)[0].value;

		// If the tag is "nsfw" and is checked, then ask for 18+ confirmation
		if (tag == "nsfw" && $(this).closest("input").prop("checked")) {
			// The checked property is set to true at this call because clicking on the checkbox causes it to flip checked at this moment
			var nsfw_confirmation = nsfwVerification();
			// Set the checkbox to unchecked if Cancel was selected instead of OK
			if (!nsfw_confirmation) {
				$(this).closest("input").prop("checked", false);
				return false;
			}
		}

		// If the tag is "extreme" and is checked, then ask for extreme confirmation
		if (tag == "extreme" && $(this).closest("input").prop("checked")) {
			// The checked property is set to true at this call because clicking on the checkbox causes it to flip checked at this moment
			var extreme_confirmation = extremeVerification();
			// Set the checkbox to unchecked if Cancel was selected instead of OK
			if (!extreme_confirmation) {
				$(this).closest("input").prop("checked", false);
				return false;
			}
		}

		// Mark the tag in the map to true if checked and false if unchecked
		$(this).closest("li").toggleClass("active", this.checked);
		if ($(this).closest("li").hasClass("active")) {
			// Disable show all mode when the user selects a tag from the dropdown
			// Disabling only at this step allows the user to shuffle when in show all mode without resetting
			show_all_mode = false;
			$("#show-all").removeClass("show-all-button-active");
			tags_to_show[tag] = true;
		}
		else {
			tags_to_show[tag] = false;
		}

		// Show only the images that need to be shown (filtering by tags)
		showImagesThatMatch();
	});

	$("#search-bar").on("change keydown paste input", function() {
		// When the search bar is updated, update the filters
		showImagesThatMatch();
	});
}

function nsfwVerification() {
	if (localStorage.getItem("nsfwVerified") && localStorage.getItem("nsfwVerified") == "verified") {
		return true;
	}
	var nsfw_confirmation = confirm("By clicking OK, you are confirming that you are 18 years or older and are okay with NSFW images being displayed on your screen. Click Cancel if you are not.");
	if (!nsfw_confirmation) {
		localStorage.setItem("nsfwVerified", "notVerified")
		return false;
	}
	else {
		localStorage.setItem("nsfwVerified", "verified")
		return true;
	}
}

function extremeVerification() {
	if (localStorage.getItem("extremeVerified") && localStorage.getItem("extremeVerified") == "verified") {
		return true;
	}
	var extreme_confirmation = confirm("WARNING: This section contains commissions that are more intense than most – for example through inhuman characters, allusions to harm, and/or dubiously consensual sexual content. By clicking OK, you are confirming that you are 18 years or older and are okay with this content being displayed on your screen. Click Cancel if you are not.");
	if (!extreme_confirmation) {
		localStorage.setItem("extremeVerified", "notVerified")
		return false;
	}
	else {
		localStorage.setItem("extremeVerified", "verified")
		return true;
	}
}

// When a series link is clicked, then it closes the modal and changes the content and re-opens it with the new image
function enableImageSeriesLinks() {
	$(".series-link").click(function() {
		// This global variable is important so that closing the modal triggers the hide modal event only once
		series_link_clicked = true;
		$("#imageModal").modal("hide");
		series_link_clicked_index = +($(this).attr("index"));
		$("#imageModal").on("hidden.bs.modal", function () {
			if (series_link_clicked) {
				$("#img"+series_link_clicked_index).click();
				series_link_clicked = false;
			}
		});
	});
}

function enableImageSeriesLinks2() {
	$(".series-link").click(function() {
		// This global variable is important so that closing the modal triggers the hide modal event only once
		series_link_clicked = true;
		$("#imageModal2").modal("hide");
		series_link_clicked_index = +($(this).attr("index"));
		$("#imageModal2").on("hidden.bs.modal", function () {
			if (series_link_clicked) {
				$("#img"+series_link_clicked_index).click();
				series_link_clicked = false;
			}
		});
	});
}

// When a modal is opened, the URL is updated so that when the back button is clicked, the modal is closed.
function backButtonHideModal() {
	// https://stackoverflow.com/questions/40314576/bootstrap-3-close-modal-when-pushing-browser-back-button
	$("div.modal").on("show.bs.modal", function(e) {
		var modal = this;
		var index = +($($(e.relatedTarget)[0]).attr("index"));
		// Handle the case when the About Me modal is opened where its index is -1
		if (index == -1) {
			index = "AboutMe"
		}
		var hash = index
		window.location.hash = hash;
		window.onhashchange = function() {
			if (!location.hash){
				$(modal).modal("hide");
			}
		}
	});
	$("div.modal").on("hidden.bs.modal", function() {
		var hash = this.id;
		history.replaceState("", document.title, window.location.pathname);
	});
	// when close button clicked simulate back
	$("div.modal button.close").on("click", function(){
		window.history.back();
	})
	// when esc pressed when modal open simulate back
	$("div.modal").keyup(function(e) {
		if (e.keyCode == 27){
			window.history.back();
		}
	});
}

// Filters images by tags and search using danbooru logic.
// The image must include the tags indicated in the dropdown
// AND
// The image must also have the search term in one of the fields to be shown.
function showImagesThatMatch() {
	// Get the visible tags in string form
	var visible_tags = [];
	for (var tag_key in tags_to_show) {
		if (tags_to_show[tag_key]) {
			visible_tags.push(tag_key)
		}
	}

	var year = $("#year").val();
	var month = $("#month").val();
	var date_picked = year != "None" && month != "None";

	// Show default images if tags have not been selected in the Filter
	if (visible_tags.length == 0 && !show_all_mode && !date_picked) {
		if(showing_art == true) {
			showDefaultImages();
		}
		else if (showing_ships == true) {
			showDefaultShips();
		}
		return;
	}

	// Then compare it with the tags of each image. If they match, then show. Otherwise, hide.
	var images;
	if(showing_art == true ) {
		images = all_commissions.images;
	}
	else if(showing_ships == true ) {
		images = all_ships.images;
	}
	var search_str = document.getElementById("search-bar").value.toLowerCase();

	if (show_all_mode) {
		for (var i = 0; i < images.length; i++) {
			if(showing_art == true) {
				searchCheck(search_str, i, images);
			}
			else if (showing_ships == true ){
				shipSearchCheck(search_str, i, images);
			}
		}
	}
	else {
		for (var i = 0; i < images.length; i++) {
			var tags_arr = images[i].tags;

			// The interesection of selected tags and image tags must be the same number of elements as the number of selected tags
			// This will give danbooru style logic where an image must include the selected tags
			if (intersect(visible_tags, tags_arr).length == visible_tags.length) {
				if(showing_art == true) {
					searchCheck(search_str, i, images);
				}
				else if(showing_ships == true ) {
					shipSearchCheck(search_str, i, images)
				}
			}
			else {
				$("#img"+i).hide();
			}
		}
	}
	// Hide NSFW entries unless selected
	if (!tags_to_show["nsfw"] && !show_all_mode) {
		$(".nsfw").parent().hide();
	}


	// Hide hidden images no matter what
	$(".hidden-image").hide();

	updateImageCountLabel();
}

// These are the images that will show up on the page when all filters are empty
function showDefaultImages() {
	var images = all_commissions.images;

	for (var i = 0; i < images.length; i++) {
		var tags_arr = images[i].tags;

		var search_str = document.getElementById("search-bar").value.toLowerCase();
		if (tags_arr.includes("sfw")) {
			searchCheck(search_str, i, images);
		}
		else {
			$("#img"+i).hide();
		}
	}
	$(".hidden-image").hide();
	updateImageCountLabel();
}

// These are the ships that will show up on the page when all filters are empty
function showDefaultShips() {
	var ships = all_ships.images;

	for (var i = 0; i < ships.length; i++) {
		var tags_arr = ships[i].tags;

		var search_str = document.getElementById("search-bar").value.toLowerCase();
		shipSearchCheck(search_str, i, ships);
	}
	$(".hidden-image").hide();
	updateImageCountLabel();
}


// Returns the intersection of array "a" and "b"
function intersect(a, b) {
	var setA = new Set(a);
	var setB = new Set(b);
	var intersection = new Set([...setA].filter(x => setB.has(x)));
	return Array.from(intersection);
}

function searchCheck(search_str, image_index, images) {
	var year = $("#year").val();
	var month = $("#month").val();
	var date_picked = year != "None" && month != "None";
	var date_matched = images[image_index].date_str && images[image_index].date_str.includes(year) && images[image_index].date_str.includes(month);

	if (search_str == "") {
		if (date_picked && date_matched) {
			$("#img"+image_index).show();
		}
		else if (date_picked && !date_matched) {
			$("#img"+image_index).hide();
		}
		else {
			$("#img"+image_index).show();
		}
	}
	else {
		// The search bar is not empty, so check the data fields for matches
		if (images[image_index].title.toLowerCase().includes(search_str)
			|| images[image_index].desc.toLowerCase().includes(search_str)
			|| images[image_index].artist.toLowerCase().includes(search_str)) {
			if (date_picked && date_matched) {
				$("#img"+image_index).show();
			}
			else if (date_picked && !date_matched) {
				$("#img"+image_index).hide();
			}
			else {
				$("#img"+image_index).show();
			}
		}
		else {
			$("#img"+image_index).hide();
		}
	}
}

function shipSearchCheck(search_str, image_index, images) {

	if (search_str == "") {
		$("#img"+image_index).show();
	}
	else {
		// The search bar is not empty, so check the data fields for matches
		if (images[image_index].title.toLowerCase().includes(search_str)) {
			$("#img"+image_index).show();
		}
		else {
			$("#img"+image_index).hide();
		}
	}
}