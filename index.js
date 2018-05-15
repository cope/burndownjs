cope = ("undefined" === typeof cope) ? {} : cope;
cope.allSprints = document.getElementById('allSprints');
cope.sprints = document.getElementById('sprints').value;

cope.data = [
	{
		id: 1,
		completed: 0,
		added: 0,
		removed: 0
	}
];

cope.createBarChartDataLabels = function () {
	var labels = [];
	cope.data.forEach(function (dataset) {
		labels.push('Sprint ' + dataset.id);
	});
	labels.push('Sprint ' + (cope.data.length + 1));
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

	var prediction = [start];
	var predictionStep = start / p(cope.sprints);
	var predictionValue = start;
	for (i = 1; i < len; i++) {
		predictionValue -= predictionStep;
		prediction.push(predictionValue);
	}
	prediction.push(0);

	var remainingCount = start;
	var completed = [0];
	var progress = [start];
	var remaining = [start];
	cope.data.forEach(function (dataset) {
		remainingCount = p(remainingCount) - p(dataset.completed) + p(dataset.added) - p(dataset.removed);
		completed.push(p(dataset.completed));
		remaining.push(remainingCount);
		progress.push(remainingCount);
	});
	console.log('prediction', JSON.stringify(prediction));
	console.log('completed', JSON.stringify(completed));
	console.log('remaining', JSON.stringify(remaining));

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
		type: 'line',
		label: 'Progress',
		borderColor: '#000000',
		borderWidth: 3,
		fill: false,
		lineTension: 0,
		data: progress
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
	var tbody = document.createElement('tbody');

	var tr1 = document.createElement('tr');
	var tr2 = document.createElement('tr');
	cope.data.forEach(function (dataset) {
		var id = dataset.id;
		tr1.appendChild(cope.createSprint(id));
		tr2.appendChild(cope.createSprintInputs(dataset));
	});

	tbody.appendChild(tr1);
	tbody.appendChild(tr2);

	table.appendChild(tbody);
	cope.allSprints.appendChild(table);
};

cope.createSprint = function (id) {
	var th = document.createElement('th');
	th.appendChild(document.createTextNode('Sprint ' + id));
	return th;
};

cope.createSprintInputs = function (dataset) {
	var id = dataset.id;
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	tbody.appendChild(cope.createInputRow('Completed', id, dataset.completed));
	tbody.appendChild(cope.createInputRow('Added', id, dataset.added));
	tbody.appendChild(cope.createInputRow('Removed', id, dataset.removed));
	table.appendChild(tbody);

	var th = document.createElement('th');
	th.appendChild(table);
	return th;
};

cope.createInputRow = function (label, id, value) {
	var tr = document.createElement('tr');
	tr.appendChild(cope.createLabelTD(label));
	tr.appendChild(cope.createInputTD(label, id, value));
	return tr;
};

cope.createLabelTD = function (label) {
	var td = document.createElement('td');
	td.setAttribute('nowrap', '');
	td.setAttribute('align', 'right');
	td.appendChild(document.createTextNode(label + ':'));
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
