cope = ("undefined" === typeof cope) ? {} : cope;
// cope.Loader = ("undefined" === typeof cope.Loader) ? {} : cope.Loader;

randomScalingFactor = function () {
	return Math.round(Math.random() * 100);
};

cope.barChartData = {
	labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5'],
	datasets: [{
		type: 'line',
		label: 'Dataset 1',
		borderColor: '#000000',
		borderWidth: 2,
		fill: false,
		data: [
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor()
		]
	}, {
		type: 'line',
		label: 'Dataset 2',
		borderColor: '#00FFFF',
		borderWidth: 2,
		fill: false,
		data: [
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor()
		]
	}, {
		label: 'Remaining Tasks',
		backgroundColor: '#2AB6CD',
		data: [
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor()
		]
	}, {
		label: 'Completed Tasks',
		backgroundColor: '#9D5CA3',
		data: [
			0,
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor(),
			randomScalingFactor()
		]
	}]
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
				}]
				// , yAxes: [{
				// 	stacked: true
				// }]
			}
		}
	});
};

cope.updateBurndown = function () {
	cope.barChartData.datasets.forEach(function (dataset) {
		dataset.data = dataset.data.map(function () {
			return randomScalingFactor();
		});
	});
	if (cope.myBar) cope.myBar.update();
};

document
	.getElementById('randomizeData')
	.addEventListener('click', function () {
		cope.barChartData.datasets.forEach(function (dataset) {
			dataset.data = dataset.data.map(function () {
				return randomScalingFactor();
			});
		});
		if (cope.myBar) cope.myBar.update();
	});
