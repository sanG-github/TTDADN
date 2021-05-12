$(document).ready(function () {
	$(document).on("click", "#toggleFeed", function (e) {
		var feedName = e.target.parentElement.id;
		var currVal = e.target.parentNode.childNodes[3];
		var nextVal = e.target.innerText === "ON" ? "OFF" : "ON";

		currVal.innerText = nextVal;
		console.log("toggle", feedName, nextVal);
	});

	$(document).on("click", "#numFeed", function (e) {
		var feedName = e.target.parentElement.id;
		var currVal = e.target.parentNode.childNodes[3];
		var nextVal =
			parseFloat(currVal.innerText) +
			(e.target.innerText === "-" ? -1 : 1);

		currVal.innerText = nextVal;
		console.log("change", feedName, nextVal);
	});

	$("#getAllFeeds").on("click", function () {
		$.get("/getAllFeeds", function (data) {
			var ul = document.getElementsByClassName("list-group")[0];
			console.log(data);
			if (!ul.clientHeight)
				data.map((item) => {
					var btn = `<button class="btn btn-primary" title=${item.description}>${item.key}</button>`;
					var childBtn =
						(item.last_value === "ON") | "OFF"
							? `<div id=${item.key}>
					<button type="button" class="btn btn-danger" id="toggleFeed">OFF</button>
					<h2>${item.last_value}</h2>
					<button type="button" class="btn btn-success" id="toggleFeed">ON</button>
					</div>`
							: `<div id=${item.key}>
					<button type="button" class="btn btn-danger" id="numFeed">-</button>
					<h2>${item.last_value}</h2>
					<button type="button" class="btn btn-success" id="numFeed">+</button>
					</div>`;

					var li = document.createElement("li");
					li.innerHTML = btn + childBtn;
					ul.appendChild(li);
				});
		});
	});
});
