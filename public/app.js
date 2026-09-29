function populateTables() {
    fetch('/api/tables')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('table-select');
            select.innerHTML = '<option value="">Select a table</option>';
            data.tables.forEach(table => {
                const option = document.createElement('option');
                option.value = table;
                option.textContent = table;
                select.appendChild(option);
            });
        });
}

document.getElementById('upload-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const data = await response.json();
        if (data.success) {
            document.getElementById('query-section').style.display = 'block';
            populateTables();
        } else {
            alert(`Upload failed: ${data.message}`);
        }
    } else {
        alert('Upload failed');
    }
});

document.getElementById('query-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const tableName = document.getElementById('table-select').value;
    const question = document.querySelector('input[name="question"]').value;

    const response = await fetch('/api/query', {
        method: 'POST',
        body: JSON.stringify({ tableName, question }),
        headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    const resultsHeader = document.getElementById('results-header');
    const resultsBody = document.getElementById('results-body');
    resultsHeader.innerHTML = '';
    resultsBody.innerHTML = '';

    if (data.success) {
        document.getElementById('result-section').style.display = 'block';

        if (data.results.length > 0) {
            const firstRow = data.results[0];
            Object.keys(firstRow).forEach(key => {
                const th = document.createElement('th');
                th.textContent = key;
                resultsHeader.appendChild(th);
            });
        }

        data.results.forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            resultsBody.appendChild(tr);
        });
    } else {
        const resultsText = document.getElementById('results-text');
        resultsText.textContent = `Error: ${data.message}`;
    }
});

populateTables();
