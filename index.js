var cope = ("undefined" === typeof cope) ? {} : cope;
cope.allSprints = document.getElementById('allSprints');
cope.sprints = document.getElementById('sprints').value;
cope.barChartData = {};

cope.data = [
	{id: 1, completed: 20, added: 0, removed: 0},
	{id: 2, completed: 15, added: 0, removed: 0},
	{id: 3, completed: 20, added: 0, removed: 10},
	{id: 4, completed: 10, added: 15, removed: 0},
	{id: 5, completed: 20, added: 0, removed: 10}
];

var p = function (v) {
	return parseInt(v, 10);
};

cope.updateBarChartData = function () {
	var target = document.getElementById('target').value;

	var i, len = cope.data.length;
	var start = document.getElementById('start').value;
	start = p(start);
	start = Math.max(start, 1);

	if (target > 0) target = Math.max(target, len);
	document.getElementById('target').value = target;

	// LABELS
	cope.barChartData.labels = [];
	cope.data.forEach(function (dataset) {
		cope.barChartData.labels.push('Sprint ' + dataset.id);
	});
	cope.barChartData.labels.push('Sprint ' + (cope.data.length + 1));

	var change = 0;
	var remainingCount = start;
	var completedCount = 0;
	var completed = [0];
	var remaining = [start];

	cope.data.forEach(function (dataset) {
		completedCount += p(dataset.completed);
		completed.push(completedCount);

		remainingCount = p(remainingCount) - p(dataset.completed) + p(dataset.added) - p(dataset.removed);
		remaining.push(remainingCount);

		change += p(dataset.added) - p(dataset.removed);
	});

	var targetVelocity = document.getElementById('targetVelocity');
	targetVelocity.innerHTML = "-";

	var predictValue, prediction, step;
	if (target > 0) {
		console.log(start, change, (start + change), target, (start + change) / target);

		var velocity = (start + change) / target;
		targetVelocity.innerHTML = "<b>" + Math.ceil(velocity) + "</b>" +
			(velocity === Math.ceil(velocity) ? "" : " (" + velocity.toFixed(2) + ")");

		predictValue = start + change;
		prediction = [predictValue];
		step = predictValue / target;
		for (i = 0; i < target; i++) {
			predictValue -= step;
			prediction.push(Math.round(predictValue));

			if (i > cope.data.length) {
				cope.barChartData.labels.push('Sprint ' + (i + 1));
				remaining.push(0);
				completed.push(0);
			}
		}
		if (target > len) {
			cope.barChartData.labels.push('Sprint ' + prediction.length);
			remaining.push(0);
			completed.push(0);
		}
		prediction[prediction.length - 1] = 0;

	} else {
		remainingCount = Math.max(remainingCount, 0);
		predictValue = start + change;
		prediction = [predictValue];
		step = (predictValue - remainingCount) / len;
		for (i = 0; i < len; i++) {
			predictValue -= step;
			prediction.push(predictValue);
		}

		if (predictValue > 0) {
			while (predictValue > 0) {
				predictValue -= step;
				prediction.push(predictValue);
			}

			len = prediction.length;
			predictValue = start + change;
			prediction = [predictValue];
			step = Math.round(predictValue / (len - 1));
			for (i = 1; i < len; i++) {
				predictValue -= step;
				prediction.push(predictValue);

				if (i > cope.data.length) {
					cope.barChartData.labels.push('Sprint ' + (i + 1));
					remaining.push(0);
					completed.push(0);
				}
			}
		}
		prediction[prediction.length - 1] = 0;
	}

	// DATASETS
	cope.barChartData.datasets = [{
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

window.onload = function () {
	var sprints = document.getElementById('sprints');
	var target = document.getElementById('target');
	for (var i = 6; i <= 20; i++) {
		var option1 = document.createElement('option');
		option1.setAttribute('value', i);
		option1.appendChild(document.createTextNode(i));
		sprints.appendChild(option1);

		var option2 = document.createElement('option');
		option2.setAttribute('value', i);
		option2.appendChild(document.createTextNode(i));
		target.appendChild(option2);
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

	cope.updateBarChartData();

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
