Chart.register(window['chartjs-plugin-annotation']);

if (!localStorage.getItem('appData')) {
  const initData = {
    total: 300000,
    goal: 500000,
    assets: {
      "おー": 120000,
      "みー": 100000,
      "共通": 80000,
      "負債": -20000
    }
  };
  localStorage.setItem('appData', JSON.stringify(initData));
}

let data = JSON.parse(localStorage.getItem('appData'));
const totalEl = document.getElementById('total');
const dateEl = document.getElementById('date');
const today = new Date();

if (dateEl) {
  dateEl.textContent = today.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}
if (totalEl) totalEl.textContent = data.total;

const ctx = document.getElementById('assetChart').getContext('2d');
let chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['資産合計'],
    datasets: [{
      label: '資産合計',
      data: [data.total],
      backgroundColor: '#4caf50'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: false,
        external: function(context) {
          const tooltipModel = context.tooltip;
          let tooltipEl = document.getElementById('chartjs-tooltip');

          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.zIndex = '1001';
            tooltipEl.style.background = 'white';
            tooltipEl.style.padding = '16px';
            tooltipEl.style.borderRadius = '12px';
            tooltipEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
            tooltipEl.innerHTML = `
              <strong>資産内訳</strong><br>
              おー: <input id="tt-o" type="number" style="width:80px"><br>
              みー: <input id="tt-m" type="number" style="width:80px"><br>
              共通: <input id="tt-k" type="number" style="width:80px"><br>
              負債: <input id="tt-d" type="number" style="width:80px"><br>
              <button onclick="saveTooltipEdit()">保存</button>
            `;
            document.body.appendChild(tooltipEl);
          }

          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }

          document.getElementById('tt-o').value = data.assets["おー"];
          document.getElementById('tt-m').value = data.assets["みー"];
          document.getElementById('tt-k').value = data.assets["共通"];
          document.getElementById('tt-d').value = data.assets["負債"];

          const pos = context.chart.canvas.getBoundingClientRect();
          tooltipEl.style.left = pos.left + window.pageXOffset + tooltipModel.caretX + 'px';
          tooltipEl.style.top = pos.top + window.pageYOffset + tooltipModel.caretY + 'px';
          tooltipEl.style.opacity = 1;
        }
      },
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

window.saveTooltipEdit = function() {
  data.assets["おー"] = parseInt(document.getElementById('tt-o').value) || 0;
  data.assets["みー"] = parseInt(document.getElementById('tt-m').value) || 0;
  data.assets["共通"] = parseInt(document.getElementById('tt-k').value) || 0;
  data.assets["負債"] = parseInt(document.getElementById('tt-d').value) || 0;
  updateChart();
  localStorage.setItem('appData', JSON.stringify(data));
  alert("保存しました！");
};

function updateChart() {
  data.total = data.assets["おー"] + data.assets["みー"] + data.assets["共通"] + data.assets["負債"];
  chart.data.datasets[0].data = [data.total];
  chart.update();
  totalEl.textContent = data.total;
}

function showPopup() {
  document.getElementById('popup').style.display = 'block';
}

function hidePopup() {
  document.getElementById('popup').style.display = 'none';
}

// テンキー処理
let currentInput = "0";

window.appendDigit = function(d) {
  if (currentInput === "0") currentInput = "";
  currentInput += d;
  document.getElementById('custom-input').textContent = currentInput;
};

window.deleteDigit = function() {
  currentInput = currentInput.slice(0, -1);
  if (currentInput === "") currentInput = "0";
  document.getElementById('custom-input').textContent = currentInput;
};

window.submitKeypadInput = function() {
  const category = document.getElementById('popup-category').value;
  const amount = parseInt(currentInput);
  if (isNaN(amount) || amount <= 0) return alert("金額を正しく入力してください");

  data.assets[category] -= amount;
  updateChart();
  localStorage.setItem('appData', JSON.stringify(data));

  currentInput = "0";
  document.getElementById('custom-input').textContent = currentInput;
  hidePopup();
  alert("支出を登録しました！");
};
