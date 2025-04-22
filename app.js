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
        "2025-04": 300000
      }
    };
    localStorage.setItem('appData', JSON.stringify(initData));
  }
  
  let data = JSON.parse(localStorage.getItem('appData'));
  const today = new Date();
  const thisMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const dateStr = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('date').textContent = dateStr;
  
  document.getElementById('asset-o').value = data.assets["おー"];
  document.getElementById('asset-m').value = data.assets["みー"];
  document.getElementById('asset-k').value = data.assets["共通"];
  document.getElementById('total').textContent = data.total;
  document.getElementById('chart-total-value').textContent = data.total;
  document.getElementById('goal').value = data.goal;
  
  function saveAssets() {
    const o = parseInt(document.getElementById('asset-o').value) || 0;
    const m = parseInt(document.getElementById('asset-m').value) || 0;
    const k = parseInt(document.getElementById('asset-k').value) || 0;
    const total = o + m + k;
  
    data.assets["おー"] = o;
    data.assets["みー"] = m;
    data.assets["共通"] = k;
    data.total = total;
    data.monthlyAssets[thisMonthKey] = total;
  
    localStorage.setItem('appData', JSON.stringify(data));
    document.getElementById('total').textContent = total;
    document.getElementById('chart-total-value').textContent = total;
    updateChart();
    alert("保存しました！");
  }
  
  function saveGoal() {
    const goal = parseInt(document.getElementById('goal').value);
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
  
    document.getElementById('asset-o').value = data.assets["おー"];
    document.getElementById('asset-m').value = data.assets["みー"];
    document.getElementById('asset-k').value = data.assets["共通"];
    document.getElementById('total').textContent = data.total;
    document.getElementById('chart-total-value').textContent = data.total;
    updateChart();
  
    document.getElementById('expense').value = '';
    alert("支出を登録しました！");
  }
  
  function getPastFourMonths() {
    const result = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push(key);
    }
    return result;
  }
  
  function getMonthlyValues() {
    const keys = getPastFourMonths();
    return keys.map(k => data.monthlyAssets[k] ?? 0);
  }
  
  const chartCtx = document.getElementById('assetChart').getContext('2d');
  let chart = new Chart(chartCtx, {
    type: 'bar',
    data: {
      labels: getPastFourMonths().map(k => `${parseInt(k.split('-')[1])}月`),
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
          suggestedMax: data.goal + 50000
        }
      },
      plugins: {
        annotation: {
          annotations: {
            line1: {
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
    },
    plugins: [Chart.registry.getPlugin('annotation')]
  });
  
  // Chart.js annotation plugin を有効化
  Chart.register({
    id: 'annotation',
    beforeDraw(chart, args, options) {}
  });
  
  function updateChart() {
    chart.data.datasets[0].data = getMonthlyValues();
    chart.options.scales.y.suggestedMax = data.goal + 50000;
    chart.options.plugins.annotation.annotations.line1.yMin = data.goal;
    chart.options.plugins.annotation.annotations.line1.yMax = data.goal;
    chart.options.plugins.annotation.annotations.line1.label.content = `目標：${data.goal}円`;
    chart.update();
  }
  