////////////////////////////////////////////////////////////////////////////////////////////////////
// image upload ////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var file_stack = { };

function upload(files) {
	let exif_orientation_to_degrees = {
		0: 0,
		1: 0,
		2: 0,
		3: 180,
		4: 0,
		5: 0,
		6: 90,
		7: 0,
		8: 270
	};

	FileAPI.filterFiles(files, function(file, info) {
		if (/^image/.test(file.type)) {
			file_stack[file["name"]] = info;
			return true;
		//	return info.width >= 320 && info.height >= 240;
		}
		return false;
	}, function(files, rejected) {
		if (files.length) {
			$(".submit", $app["post"]).addClass("disabled");

			// preview
			FileAPI.each(files, function(file) {
				var exif_orientation = file_stack[file["name"]]["exif"]["Orientation"];
				file_stack[file["name"]]["ref"] = tarefa_active + "-" + Lista.Usuario["id"] + "-" +
					moment().format("X") + "-" + rand(0, 999).toFixed(0);

				if (file["type"] == "image/gif") {
					var reader = new FileReader();
					reader.onload = function(event) {
						var img = $("<img />").attr("src", event.target.result);
						var $tracker = $("<input type=\"hidden\" name=\"image-order[]\" />").val(file_stack[file["name"]]["ref"]);

						var $status = $("<div />").addClass("progress");
						$("<div />").addClass("status").html("<strong>Enviando&hellip;</strong>").appendTo($status);
						$("<div />").addClass("bar").appendTo($status);

						var $preview = $("<li />").attr("id", "file-" +
								file_stack[file["name"]]["ref"]).append($tracker).append($status).append(img);
						$("#dropzone #board").append($preview);
					};
					reader.readAsDataURL(file);
				} else {
					FileAPI
						.Image(file)
						.rotate(exif_orientation_to_degrees[exif_orientation])
						.resize(600, 300, "preview")
						.get(function(err, img) {
						//	$tracker = $("<input type=\"hidden\" name=\"image-order[]\" />")
						//		.val(tarefa_active + "-" + Lista.Usuario["id"] + "-" + file["name"]);
							var $tracker = $("<input type=\"hidden\" name=\"image-order[]\" />").val(file_stack[file["name"]]["ref"]);

							var $status = $("<div />").addClass("progress");
							$("<div />").addClass("status").html("<strong>Enviando&hellip;</strong>").appendTo($status);
							$("<div />").addClass("bar").appendTo($status);

							var $preview = $("<li />").attr("id", "file-" +
									file_stack[file["name"]]["ref"]).append($tracker).append($status).append(img);
							$("#dropzone #board").append($preview);
						});
				}
			});

			// upload
			FileAPI.upload({
				url: "/tarefas/" + tarefa_active + "/postar",
				data: {
					"action": "upload",
					"edicao": Lista.Edicao["titulo"],
					"tarefa": tarefa_active,
					"turma": Lista.Usuario["turma"],
					"user": Lista.Usuario["id"]
				},
				prepare: function(file, options) {
					options.data.ref = file_stack[file["name"]]["ref"];
					file.ref = file_stack[file["name"]]["ref"];
				},

				imageAutoOrientation: (files[0]["type"] !== "image/gif"? true : null),
				imageTransform: (files[0]["type"] !== "image/gif"? {
					maxWidth: 1920,
					maxHeight: 1920
				} : null),

				files: files,
				fileprogress: function(event, file, xhr) {
					var percent = ((event["loaded"] / event["total"]) * 100).toFixed(0),
						status = (percent < 100? "<strong>Enviando&hellip;</strong> " +
								percent + "%" : "<strong>Processando&hellip;</strong>");

					$("#file-" + file["ref"] + " .status", "#dropzone").html(status);
				},
				progress: function(event) {
				//	var percent = ((event["loaded"] / event["total"]) * 100).toFixed(0) + "%"
				//	console.log(percent);
				},
				filecomplete: function(file, xhr, options) {
				//	console.log(file, xhr, options);
					$("#file-" + options["ref"] + " .status", "#dropzone").html("<i class=\"material-icons\">check</i>");
				},
				complete: function(err, xhr) {
					app.Post.authorize();
					// $(".submit-button", $app["post"]).removeClass("disabled");
				}
			});
		}
	});
}

$.fn.dropzone = function() {
	// dropzone
	var $dropzone = $("#dropzone", this);
	FileAPI.event.dnd($dropzone[0], function(over) {
		if (over) {
			$dropzone.addClass("active");
		} else {
			$dropzone.removeClass("active");
		}
	}, function(files) {
		upload(files);
	});

	// manual select
	var $file_input = document.getElementById("form-file");
	FileAPI.event.on($file_input, "change", function(event) {
		var files = FileAPI.getFiles(event);
		upload(files);
	});

	// reorder
	var $board = $("#board", this);
	$board.on("slip:beforewait", function(event) {
		if (UI.data["interaction-type"] === "pointer") {
			event.preventDefault();
		}
	}).on("slip:afterswipe", function(event) {
		event.target.remove();
	}).on("slip:reorder", function(event) {
		event = event.originalEvent;
		event.target.parentNode.insertBefore(event.target, event.detail.insertBefore);
		return false;
	});

	new Slip($board[0]);
};
