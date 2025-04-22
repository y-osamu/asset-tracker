// app.js（修正：当月+過去2ヶ月、動的に表示）

Chart.register(window['chartjs-plugin-annotation']);

if (!localStorage.getItem('appData')) {
  const initData = {
    total: 300000,
    goal: 500000,
    assets: {
      "おー": 120000,
      "みー": 100000,
      "共通": 80000
    },
    monthlyAssets: {
      "2025-01": 300000,
      "2025-02": 300000,
      "2025-03": 300000,
      "2025-04": 300000
    }
  };
  localStorage.setItem('appData', JSON.stringify(initData));
}

const data = JSON.parse(localStorage.getItem('appData'));
const today = new Date();
// debag 
// const today = new Date("2025-05-15");  // ← 仮に7月にしてみる

const thisMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const dateStr = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

const dateEl = document.getElementById('date');
const goalEl = document.getElementById('goal');
const assetOEl = document.getElementById('asset-o');
const assetMEl = document.getElementById('asset-m');
const assetKEl = document.getElementById('asset-k');
const totalEl = document.getElementById('total');

if (dateEl) dateEl.textContent = dateStr;
if (goalEl) goalEl.value = data.goal;
if (assetOEl) assetOEl.value = data.assets["おー"];
if (assetMEl) assetMEl.value = data.assets["みー"];
if (assetKEl) assetKEl.value = data.assets["共通"];
if (totalEl) totalEl.textContent = data.total;

function saveAssets() {
  const o = parseInt(assetOEl.value) || 0;
  const m = parseInt(assetMEl.value) || 0;
  const k = parseInt(assetKEl.value) || 0;
  const total = o + m + k;

  data.assets["おー"] = o;
  data.assets["みー"] = m;
  data.assets["共通"] = k;
  data.total = total;
  data.monthlyAssets[thisMonthKey] = total;

  localStorage.setItem('appData', JSON.stringify(data));
  totalEl.textContent = total;
  updateChart();
  alert("保存しました！");
}

function saveGoal() {
  const goal = parseInt(goalEl.value);
  if (isNaN(goal) || goal <= 0) return alert("有効な目標金額を入力してください");

  data.goal = goal;
  localStorage.setItem('appData', JSON.stringify(data));
  updateChart();
  alert("目標金額を設定しました！");
}

function addExpense() {
  const category = document.getElementById('category').value;
  const amount = parseInt(document.getElementById('expense').value);
  if (isNaN(amount) || amount <= 0) return alert("金額を正しく入力してください");

  data.assets[category] = Math.max(0, data.assets[category] - amount);
  data.total = data.assets["おー"] + data.assets["みー"] + data.assets["共通"];
  data.monthlyAssets[thisMonthKey] = data.total;

  localStorage.setItem('appData', JSON.stringify(data));

  assetOEl.value = data.assets["おー"];
  assetMEl.value = data.assets["みー"];
  assetKEl.value = data.assets["共通"];
  totalEl.textContent = data.total;

  document.getElementById('expense').value = '';
  alert("支出を登録しました！");
}
function getPastThreeMonths() {
    const result = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push(key);
    }
    return result;
  }
  
  function getMonthlyValues() {
    const keys = getPastThreeMonths();
    return keys.map(k => {
      return (k === thisMonthKey ? data.total : (data.monthlyAssets[k] ?? 0));
    });
  }
  
  function updateChart() {
    const monthKeys = getPastThreeMonths();
    const monthLabels = monthKeys.map(k => `${parseInt(k.split('-')[1])}月`);
    const monthValues = getMonthlyValues();
  
    chart.data.labels = monthLabels;
    chart.data.datasets[0].data = monthValues;
    chart.update();
  }
  
  
const chartCtx = document.getElementById('assetChart').getContext('2d');
let chart = new Chart(chartCtx, {
  type: 'bar',
  data: {
    labels: getPastThreeMonths().map(k => `${parseInt(k.split('-')[1])}月`),
    datasets: [{
      label: '資産推移',
      data: getMonthlyValues(),
      backgroundColor: 'rgba(54, 162, 235, 0.6)'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: data.goal + 50000,
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      annotation: {
        annotations: {
          goalLine: {
            type: 'line',
            yMin: data.goal,
            yMax: data.goal,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: `目標：${data.goal}円`,
              enabled: true,
              position: 'start'
            }
          }
        }
      }
    }
  }
});

function updateChart() {
    const labels = getPastThreeMonths().map(k => `${parseInt(k.split('-')[1])}月`);
    const values = getMonthlyValues();
  
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
  
    chart.options.scales.y.suggestedMax = data.goal + 50000;
    chart.options.plugins.annotation.annotations.goalLine.yMin = data.goal;
    chart.options.plugins.annotation.annotations.goalLine.yMax = data.goal;
    chart.options.plugins.annotation.annotations.goalLine.label.content = `目標：${data.goal}円`;
  
    chart.update();
  }
  