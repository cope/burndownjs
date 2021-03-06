/* global Chart */

var cope = {
	allSprints: document.getElementById("allSprints"),
	sprints: document.getElementById("sprints").value,
	barChartData: {},
	data: [
		{id: 1, completed: 20, added: 0, removed: 0},
		{id: 2, completed: 15, added: 0, removed: 0},
		{id: 3, completed: 20, added: 0, removed: 10},
		{id: 4, completed: 10, added: 15, removed: 0},
		{id: 5, completed: 20, added: 0, removed: 10}
	],
	target: 0,
	start: 0
};

var p = function (v) {
	return parseInt(v, 10);
};

cope.pushLabelIfNeeded = function (check, label) {
	if (check > cope.data.length) {
		cope.barChartData.labels.push(label);
		cope.remaining.push(0);
		cope.completed.push(0);
	}
};

cope.processTargetVelocity = function () {
	// console.log(cope.start, cope.change, (cope.start + cope.change), cope.target, (cope.start + cope.change) / cope.target);

	var velocity = (cope.start + cope.change) / cope.target;
	document.getElementById("targetVelocity").innerHTML = "<b>" + Math.ceil(velocity) + "</b>" + (velocity === Math.ceil(velocity) ? "" : " (" + velocity.toFixed(2) + ")");

	var predictValue = cope.start + cope.change;
	cope.prediction = [predictValue];
	var step = predictValue / cope.target;
	for (var a = 0; a < cope.target; a++) {
		predictValue -= step;
		cope.prediction.push(Math.round(predictValue));
		cope.pushLabelIfNeeded(a, "Sprint " + (a + 1));
	}
	cope.pushLabelIfNeeded(cope.target, "Sprint " + cope.prediction.length);

	cope.prediction[cope.prediction.length - 1] = 0;
};

cope.pushPredictionValues = function (predictValue, step) {
	while (predictValue > 0) {
		predictValue -= step;
		cope.prediction.push(predictValue);
	}
};

cope.pushPredictionValues = function (predictValue, step, len) {
	for (var c = 1; c < len; c++) {
		predictValue -= step;
		cope.prediction.push(predictValue);
		cope.pushLabelIfNeeded(c, "Sprint " + (c + 1));
	}
};

cope.processNoTargetVelocitiesPrediction = function (predictValue, step) {
	cope.pushPredictionValues(predictValue, step);

	var len = cope.prediction.length;
	predictValue = cope.start + cope.change;
	cope.prediction = [predictValue];
	step = Math.round(predictValue / (len - 1));

	cope.pushPredictionValues(predictValue, step, len);
};

cope.processNoTargetVelocity = function (remainingCount) {
	var predictValue = cope.start + cope.change;
	cope.prediction = [predictValue];
	var step = (predictValue - remainingCount) / cope.data.length;
	for (var b = 0; b < cope.data.length; b++) {
		predictValue -= step;
		cope.prediction.push(predictValue);
	}

	if (predictValue > 0) cope.processNoTargetVelocitiesPrediction(predictValue, step);
	cope.prediction[cope.prediction.length - 1] = 0;
};

cope.updateBarChartData = function () {
	cope.start = document.getElementById("start").value;
	cope.start = p(cope.start);
	cope.start = Math.max(cope.start, 1);

	cope.target = document.getElementById("target").value;
	if (cope.target > 0) cope.target = Math.max(cope.target, cope.data.length);
	document.getElementById("target").value = cope.target;

	cope.change = 0;
	var remainingCount = cope.start;
	var completedCount = 0;
	cope.completed = [0];
	cope.remaining = [cope.start];

	cope.barChartData.labels = [];
	cope.data.forEach(function (dataset) {
		cope.barChartData.labels.push("Sprint " + dataset.id);

		completedCount += p(dataset.completed);
		cope.completed.push(completedCount);

		remainingCount = p(remainingCount) - p(dataset.completed) + p(dataset.added) - p(dataset.removed);
		cope.remaining.push(remainingCount);

		cope.change += p(dataset.added) - p(dataset.removed);
	});
	cope.barChartData.labels.push("Sprint " + (cope.data.length + 1));
	remainingCount = Math.max(remainingCount, 0);

	document.getElementById("targetVelocity").innerHTML = "-";

	if (cope.target > 0) cope.processTargetVelocity();
	else cope.processNoTargetVelocity(remainingCount);

	// DATASETS
	cope.barChartData.datasets = [{
		type: "line",
		backgroundColor: "#8CC976",
		borderColor: "#8CC976",
		borderDash: [5, 5],
		label: "Prediction",
		borderWidth: 3,
		fill: false,
		lineTension: 0,
		data: cope.prediction
	}, {
		label: "Remaining Tasks",
		backgroundColor: "#2AB6CD",
		data: cope.remaining
	}, {
		label: "Completed Tasks",
		backgroundColor: "#9D5CA3",
		data: cope.completed
	}];
};

window.onload = function () {
	var sprints = document.getElementById("sprints");
	var target = document.getElementById("target");
	for (var i = 6; i <= 20; i++) {
		var option1 = document.createElement("option");
		option1.setAttribute("value", i);
		option1.appendChild(document.createTextNode(i));
		sprints.appendChild(option1);

		var option2 = document.createElement("option");
		option2.setAttribute("value", i);
		option2.appendChild(document.createTextNode(i));
		target.appendChild(option2);
	}

	var ctx = document.getElementById("canvas").getContext("2d");
	cope.myBar = new Chart(ctx, {
		type: "bar",
		data: cope.barChartData,
		options: {
			title: {
				display: true,
				text: "Burndown Chart"
			},
			tooltips: {
				mode: "index",
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
		dataset.completed = document.getElementById("completed" + dataset.id).value;
		dataset.added = document.getElementById("added" + dataset.id).value;
		dataset.removed = document.getElementById("removed" + dataset.id).value;
	});

	cope.updateBarChartData();

	if (cope.myBar) cope.myBar.update();
};

cope.updateSprints = function () {
	var sprints = document.getElementById("sprints").value;
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
	cope.allSprints.innerHTML = "";

	var table = document.createElement("table");
	table.setAttribute("cellpadding", "5");
	var tbody = document.createElement("tbody");

	var tr1 = document.createElement("tr");
	var tr2 = document.createElement("tr");
	var tr3 = document.createElement("tr");
	var tr4 = document.createElement("tr");
	tr1.appendChild(document.createElement("th"));
	tr2.appendChild(cope.createLabelTD(cope.createBoldLabel("Completed", "#9D5CA3")));
	tr3.appendChild(cope.createLabelTD(cope.createBoldLabel("Added", "#00FF00")));
	tr4.appendChild(cope.createLabelTD(cope.createBoldLabel("Removed", "#FF0000")));
	cope.data.forEach(function (dataset) {
		var id = dataset.id;
		tr1.appendChild(cope.createHeaders(id));
		tr2.appendChild(cope.createInputTD("completed", id, dataset.completed));
		tr3.appendChild(cope.createInputTD("added", id, dataset.added));
		tr4.appendChild(cope.createInputTD("removed", id, dataset.removed));
	});

	tbody.appendChild(tr1);
	tbody.appendChild(tr2);
	tbody.appendChild(tr3);
	tbody.appendChild(tr4);

	table.appendChild(tbody);
	cope.allSprints.appendChild(table);
};

cope.createHeaders = function (id) {
	var th = document.createElement("th");
	th.appendChild(document.createTextNode("Sprint " + id));
	return th;
};

cope.createBoldLabel = function (text, color) {
	var b = document.createElement("b");
	b.setAttribute("style", "color:" + color + ";");
	b.appendChild(document.createTextNode(text + ":"));
	return b;
};

cope.createLabelTD = function (content) {
	var td = document.createElement("td");
	td.setAttribute("nowrap", "");
	td.setAttribute("align", "right");
	td.appendChild(content);
	td.setAttribute("style", "padding-right:15px;");
	return td;
};

cope.createInputTD = function (label, id, value) {
	var td = document.createElement("td");
	td.setAttribute("nowrap", "");
	td.setAttribute("align", "left");

	var input = document.createElement("input");
	input.setAttribute("type", "number");
	input.setAttribute("onchange", "cope.drawBurndownChart()");
	input.setAttribute("min", "0");
	input.setAttribute("step", "1");
	input.setAttribute("value", value || 0);
	input.setAttribute("id", label.toLowerCase() + id);
	td.appendChild(input);

	return td;
};
