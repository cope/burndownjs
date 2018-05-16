cope = ("undefined" === typeof cope) ? {} : cope;
cope.allSprints = document.getElementById('allSprints');
cope.sprints = document.getElementById('sprints').value;

cope.data = [];
for (var i = 1; i <= 5; i++) cope.data.push({
	id: i,
	completed: 20,
	added: 0,
	removed: 0
})

cope.createBarChartDataLabels = function () {
	var labels = [];
	cope.data.forEach(function (dataset) {
		labels.push('Sprint ' + dataset.id);
	});
	// labels.push('Sprint ' + (cope.data.length + 1));
	labels.push(' ');
	return labels;
};

var p = function (v) {
	return parseInt(v, 10);
};

cope.createBarChartDataDatasets = function () {
	var i, len = cope.data.length;
	var start = document.getElementById('start').value;
	start = p(start, 10);
	start = Math.max(start, 1);

	var remainingCount = start;
	var completed = [0];
	var remaining = [start];
	cope.data.forEach(function (dataset) {
		remainingCount = p(remainingCount) - p(dataset.completed) + p(dataset.added) - p(dataset.removed);
		completed.push(p(dataset.completed));
		remaining.push(remainingCount);
	});

	i = 1;
	var remaining2d = [];
	remaining.forEach(function (v) {
		remaining2d.push([i++, v]);
	});
	var predict = regression.linear(remaining2d);
	var prediction = predict.points.map(function (v) {
		return v[1];
	});

	return [{
		type: 'line',
		backgroundColor: '#8CC976',
		borderColor: '#8CC976',
		borderDash: [5, 5],
		label: 'Prediction',
		borderWidth: 3,
		fill: false,
		lineTension: 0,
		data: prediction
	}, {
		label: 'Remaining Tasks',
		backgroundColor: '#2AB6CD',
		data: remaining
	}, {
		label: 'Completed Tasks',
		backgroundColor: '#9D5CA3',
		data: completed
	}];
};

cope.barChartData = {
	labels: cope.createBarChartDataLabels(),
	datasets: cope.createBarChartDataDatasets()
};

window.onload = function () {
	var sprints = document.getElementById('sprints');
	for (var i = 6; i <= 20; i++) {
		var option = document.createElement('option');
		option.setAttribute('value', i);
		option.appendChild(document.createTextNode(i));
		sprints.appendChild(option);
	}

	var ctx = document.getElementById('canvas').getContext('2d');
	cope.myBar = new Chart(ctx, {
		type: 'bar',
		data: cope.barChartData,
		options: {
			title: {
				display: true,
				text: 'Burndown Chart'
			},
			tooltips: {
				mode: 'index',
				intersect: false
			},
			responsive: true,
			scales: {
				xAxes: [{
					stacked: true,
				}],
				yAxes: [{
					stacked: true
				}]
			}
		}
	});
	cope.updateSprints();
};

cope.drawBurndownChart = function () {
	cope.data.forEach(function (dataset) {
		dataset.completed = document.getElementById('completed' + dataset.id).value;
		dataset.added = document.getElementById('added' + dataset.id).value;
		dataset.removed = document.getElementById('removed' + dataset.id).value;
	});

	cope.barChartData.labels = cope.createBarChartDataLabels();
	cope.barChartData.datasets = cope.createBarChartDataDatasets();

	if (cope.myBar) cope.myBar.update();
};

cope.updateSprints = function () {
	var sprints = document.getElementById('sprints').value;
	sprints = Math.max(sprints, 1);

	if (sprints !== cope.sprints) {
		cope.sprints = sprints;

		while (cope.data.length < cope.sprints) {
			cope.data.push({
				id: cope.data.length + 1,
				completed: 0,
				added: 0,
				removed: 0
			});
		}
		cope.data = cope.data.slice(0, cope.sprints);

		cope.drawSprintsTable();
	}

	cope.drawBurndownChart();
};

cope.drawSprintsTable = function () {
	cope.allSprints.innerHTML = '';

	var table = document.createElement('table');
	table.setAttribute('cellpadding', '5');
	var tbody = document.createElement('tbody');

	var tr1 = document.createElement('tr');
	var tr2 = document.createElement('tr');
	var tr3 = document.createElement('tr');
	var tr4 = document.createElement('tr');
	tr1.appendChild(document.createElement('th'));
	tr2.appendChild(cope.createLabelTD(cope.createBoldLabel('Completed', '#9D5CA3')));
	tr3.appendChild(cope.createLabelTD(cope.createBoldLabel('Added', '#00FF00')));
	tr4.appendChild(cope.createLabelTD(cope.createBoldLabel('Removed', '#FF0000')));
	cope.data.forEach(function (dataset) {
		var id = dataset.id;
		tr1.appendChild(cope.createHeaders(id));
		tr2.appendChild(cope.createInputTD('completed', id, dataset.completed));
		tr3.appendChild(cope.createInputTD('added', id, dataset.added));
		tr4.appendChild(cope.createInputTD('removed', id, dataset.removed));
	});

	tbody.appendChild(tr1);
	tbody.appendChild(tr2);
	tbody.appendChild(tr3);
	tbody.appendChild(tr4);

	table.appendChild(tbody);
	cope.allSprints.appendChild(table);
};

cope.createHeaders = function (id) {
	var th = document.createElement('th');
	th.appendChild(document.createTextNode('Sprint ' + id));
	return th;
};

cope.createBoldLabel = function (text, color) {
	var b = document.createElement('b');
	b.setAttribute('style', 'color:' + color + ';');
	b.appendChild(document.createTextNode(text + ':'));
	return b;
};

cope.createLabelTD = function (content) {
	var td = document.createElement('td');
	td.setAttribute('nowrap', '');
	td.setAttribute('align', 'right');
	td.appendChild(content);
	td.setAttribute('style', 'padding-right:15px;');
	return td;
};

cope.createInputTD = function (label, id, value) {
	var td = document.createElement('td');
	td.setAttribute('nowrap', '');
	td.setAttribute('align', 'left');

	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	input.setAttribute('onchange', 'cope.drawBurndownChart()');
	input.setAttribute('min', '0');
	input.setAttribute('step', '1');
	input.setAttribute('value', value || 0);
	input.setAttribute('id', label.toLowerCase() + id);
	td.appendChild(input);

	return td;
};
