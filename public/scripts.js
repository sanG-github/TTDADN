$(document).ready(function () {
	function changeFeed(feedName, value) {
		$.post('/changeFeed', {
			value: value,
			feedName: feedName,
		}).then(function (res) {
			console.log('res:', res);
		});
	}

	$(document).on('click', '#toggleFeed', function (e) {
		var feedName = e.target.parentElement.id;
		var currVal = e.target.parentNode.childNodes[3];
		var nextVal = e.target.innerText;

		currVal.innerText = nextVal;
		changeFeed(feedName, nextVal);
		console.log('toggle', feedName, nextVal);
	});

	$(document).on('click', '#numFeed', function (e) {
		var feedName = e.target.parentElement.id;
		var currVal = e.target.parentNode.childNodes[3];
		var nextVal =
			parseFloat(currVal.innerText) +
			(e.target.innerText === '-' ? -1 : 1);

		currVal.innerText = nextVal;
		changeFeed(feedName, nextVal);
		console.log('change', feedName, nextVal);
	});

	$('#getAllFeeds').on('click', function () {
		$.get('/getAllFeeds', function (data) {
			var ul = document.getElementsByClassName('list-group')[0];

			if (!ul.clientHeight)
				data.map((item) => {
					var btn = `<button class="btn btn-primary" title=${item.description}>${item.key}</button>`;
					var childBtn =
						item.last_value === 'ON' || item.last_value === 'OFF'
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

					var li = document.createElement('li');
					li.innerHTML = btn + childBtn;
					ul.appendChild(li);
				});
		});
	});
});
