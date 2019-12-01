var vavg = 0;
var SendPushDown = true;
var SendPushUp = true;
var handle = 0;
var criticVavg = 123;


window.onload = function () {
	function parseFunc() {
		var xmlhttp;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var json = xmlhttp.responseText;
				var data = JSON.parse(json);

				vavg = 0;

				for (var i = 0; i < 100; i++) {
					vavg += data[i].vavg;
				}

				vavg = vavg / 100;
				
				if (vavg <= document.getElementById('input_min').value) {
					if (SendPushDown) {
						notifyMe();
						SendPushDown = false;
						SendPushUp = true;
					}
					if (handle == 0)
						handle = setTimeout(notifyMe, 60*1000);
				} else if (vavg > document.getElementById('input_min').value) {
					SendPushDown = true;
					if (SendPushUp) {
						notifyUp();
						SendPushUp = false;
					}
					clearTimeout(handle);
				}

				document.getElementById("myDiv").innerText = "Средняя скорость: " + vavg;
				document.getElementById("myDiv").innerText += "\n Текущее время: " + new Date() + "\n\n";
			}
		};
		xmlhttp.open("GET", "http://13.69.157.123/get-last-data", true);
		xmlhttp.send();
	}

	setInterval(function () {
		parseFunc();
	}, 1000);

	setTimeout(function () {
		Data = new Date();
		var dps = [];
		var chart = new CanvasJS.Chart("chartContainer", {
			title: {
				text: "График показателя скорости в реальном времени"
			},
			axisY: {
				includeZero: false
			},
			axisX: {
				labelFormatter: function (e) {
					return CanvasJS.formatDate(e.value, "hh:mm:ss");
				},
				interval: 1,
				intervalType: "second",
			},
			toolTip: {

				contentFormatter: function (e) {
					return "Second: " + e.entries[0].dataPoint.x.getSeconds() + "| Vavg: " + e.entries[0].dataPoint.y;
				},
			},
			data: [{
				type: "line",
				dataPoints: dps,
			}]
		});
		Data = new Date();

		var xVal = new Date(Data.getYear(), Data.getMonth(), Data.getDay(), Data.getHours(), Data.getMinutes(), Data.getSeconds());
		var yVal = vavg;
		var updateInterval = 1000;
		var dataLength = 10;

		function updateChart(count) {
			Data = new Date();
			if (vavg <= document.getElementById('input_min').value) {
				criticVavg = document.getElementById('input_min').value;
				chart.toolTip.set("fontColor", "red");
				chart.data[0].set("color", "red");
			} else {
				chart.toolTip.set("fontColor", "blue");
				chart.data[0].set("color", "blue");
			}

			count = count || 1;

			for (var j = 0; j < count; j++) {
				yVal = vavg;
				xVal = new Date(Data.getYear(), Data.getMonth(), Data.getDay(), Data.getHours(), Data.getMinutes(), Data.getSeconds());
				dps.push({
					x: xVal,
					y: yVal
				});
			}

			if (dps.length > dataLength) {
				dps.shift();
			}

			chart.render();
		}

		updateChart(dataLength);
		setInterval(function () {
			updateChart();
		}, updateInterval);

	}, 2000);

};

var iteration = 1;

function notifyMe() {
	var notification = new Notification("НЛМК", {
		body: "Средняя скорость ниже допустимой. Номер: " + iteration + " ",
		icon: "img/nlmk.png"
	});
	iteration++;
	handle = 0;
}
function notifyUp() {
	var notification = new Notification("НЛМК", {
		body: "Значение средней скорости нормализировалось. Номер: " + iteration + " ",
		icon: "img/nlmk.png"
	});
	iteration++;
}

function notifSet() {
	if (!("Notification" in window))
		alert("Ваш браузер не поддерживает уведомления.");
	else if (Notification.permission === "granted")
		setTimeout(notifyMe, 2000);
	else if (Notification.permission !== "denied") {
		Notification.requestPermission(function (permission) {
			if (!('permission' in Notification))
				Notification.permission = permission;
			if (permission === "granted")
				setTimeout(notifyMe, 2000);
		});
	}

	

}
