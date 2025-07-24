document.addEventListener('DOMContentLoaded', function() {
    // 自動填入測驗日期
    const testDateInput = document.getElementById('test-date');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    testDateInput.value = `${yyyy}-${mm}-${dd}`;

    // 動態生成題目
    const form = document.getElementById('disc-form');
    // 注意：questions 變數來自於 js/data.js
    questions.forEach((options, qIndex) => {
        const group = document.createElement('div');
        group.className = 'question-group';
        group.innerHTML = `<p class="question-group-title">第 ${qIndex + 1} 組</p>`;

        const mostSection = document.createElement('div');
        mostSection.className = 'choice-section';
        mostSection.innerHTML = `<div class="choice-title most-title">最像你 (Most)</div>`;
        const mostGrid = document.createElement('div');
        mostGrid.className = 'options-grid';
        options.forEach((opt, oIndex) => {
            const id = `q${qIndex}_most_${oIndex}`;
            mostGrid.innerHTML += `<div><input type="radio" id="${id}" name="q_most_${qIndex}" value="${oIndex}"><label for="${id}">${opt}</label></div>`;
        });
        mostSection.appendChild(mostGrid);

        const leastSection = document.createElement('div');
        leastSection.className = 'choice-section';
        leastSection.innerHTML = `<div class="choice-title least-title">最不像你 (Least)</div>`;
        const leastGrid = document.createElement('div');
        leastGrid.className = 'options-grid';
        options.forEach((opt, oIndex) => {
            const id = `q${qIndex}_least_${oIndex}`;
            leastGrid.innerHTML += `<div><input type="radio" id="${id}" name="q_least_${qIndex}" value="${oIndex}"><label for="${id}">${opt}</label></div>`;
        });
        leastSection.appendChild(leastGrid);
        
        group.appendChild(mostSection);
        group.appendChild(leastSection);
        form.appendChild(group);
    });

    const submitBtn = document.getElementById('submit-btn');
    const validationMsg = document.getElementById('validation-message');
    
    submitBtn.addEventListener('click', function() {
        submitBtn.disabled = true;
        submitBtn.textContent = '計算中...';

        const userInfo = {
            name: document.getElementById('name').value.trim(),
            gender: document.querySelector('input[name="gender"]:checked')?.value,
            birthDate: document.getElementById('birth-date').value,
            testDate: document.getElementById('test-date').value
        };

        if (!userInfo.name || !userInfo.gender || !userInfo.birthDate) {
            validationMsg.textContent = '錯誤：請完整填寫姓名、性別和出生日期！';
            validationMsg.style.display = 'block';
            validationMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            submitBtn.disabled = false;
            submitBtn.textContent = '完成測驗，查看分析報告';
            return;
        }

        const scores = { D: 0, I: 0, S: 0, C: 0 };
        let allAnswered = true;
        
        for (let i = 0; i < questions.length; i++) {
            const mostSelected = form.querySelector(`input[name="q_most_${i}"]:checked`);
            const leastSelected = form.querySelector(`input[name="q_least_${i}"]:checked`);

            if (!mostSelected || !leastSelected) {
                validationMsg.textContent = `錯誤：第 ${i + 1} 題未完整作答！`;
                validationMsg.style.display = 'block';
                allAnswered = false;
                break;
            }
            if (mostSelected.value === leastSelected.value) {
                validationMsg.textContent = `錯誤：第 ${i + 1} 題的「最像」和「最不像」不能選擇同一個項目。`;
                validationMsg.style.display = 'block';
                allAnswered = false;
                break;
            }
            
            // 注意：scoringKey 變數來自於 js/data.js
            const mostIndex = parseInt(mostSelected.value);
            const leastIndex = parseInt(leastSelected.value);
            const mostScoreChange = scoringKey[i][mostIndex].M;
            const leastScoreChange = scoringKey[i][leastIndex].L;
            scores[mostScoreChange]++;
            scores[leastScoreChange]--;
        }

        if (allAnswered) {
            validationMsg.style.display = 'none';
            displayResults(userInfo, scores);
            document.getElementById('results').style.display = 'block';
            document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
            sendDataToBackend({ userInfo, scores });
        }

        submitBtn.disabled = false;
        submitBtn.textContent = '完成測驗，查看分析報告';
    });
    
    let chartInstance = null;
    function displayResults(userInfo, scores) {
        document.getElementById('report-name').textContent = userInfo.name;
        document.getElementById('report-date').textContent = userInfo.testDate;

        const finalScores = {};
        const minScore = Math.min(...Object.values(scores));
        Object.keys(scores).forEach(key => {
            finalScores[key] = scores[key] - minScore + 5; 
        });

        const ctx = document.getElementById('disc-radar-chart').getContext('2d');
        if(chartInstance) { chartInstance.destroy(); }
        chartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['D (掌控型)', 'I (影響型)', 'S (穩定型)', 'C (分析型)'],
                datasets: [{
                    label: '您的行為風格',
                    data: [finalScores.D, finalScores.I, finalScores.S, finalScores.C],
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(13, 110, 253, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(13, 110, 253, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        angleLines: { display: true },
                        suggestedMin: 0,
                        pointLabels: { font: { size: 14, weight: 'bold' } },
                        ticks: { display: false }
                    }
                },
                plugins: { legend: { position: 'top' } }
            }
        });

        const sortedTraits = Object.entries(scores).sort(([, a], [, b]) => b - a);
        const primaryTrait = sortedTraits[0][0];
        const secondaryTrait = sortedTraits[1][0];
        const comboTrait = primaryTrait + secondaryTrait;
        
        // 注意：resultAnalyses 變數來自於 js/data.js
        const analysis = resultAnalyses[comboTrait] || resultAnalyses.default;
        
        document.getElementById('result-title').textContent = `您的主要類型：${analysis.title}`;
        document.getElementById('result-description').textContent = analysis.description;
        
        const strengthsList = document.getElementById('result-strengths');
        strengthsList.innerHTML = '';
        analysis.strengths.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            strengthsList.appendChild(li);
        });

        const challengesList = document.getElementById('result-challenges');
        challengesList.innerHTML = '';
        analysis.challenges.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            challengesList.appendChild(li);
        });

        document.getElementById('result-pressure').textContent = analysis.pressure;
    }

    function sendDataToBackend(data) {
        console.log("準備發送完整數據到後端:", data);
        /*
        // 實際應用時，請取消此段註解並替換成您的後端 API 位址
        fetch('https://your-backend-api.com/save-disc-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => console.log('後端儲存成功:', data))
        .catch((error) => console.error('後端儲存失敗:', error));
        */
    }
});