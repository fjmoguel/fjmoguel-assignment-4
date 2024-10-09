document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('search-form');

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault(); 

        const query = document.getElementById('query').value; 
        if (query === "") {
            alert("Please enter a query");
            return;
        }

        fetchResults(query);
    });

    function fetchResults(query) {
        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    displayResults(data.results);
                    displayChart(data.results);
                } else {
                    alert('No results found');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function displayResults(results) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = ''; 

        results.forEach((result, index) => {
            const resultElement = document.createElement('div');
            resultElement.classList.add('result-item');
            resultElement.innerHTML = `
                <div class="document-header">Document ${index + 1}</div>
                <p><strong>From:</strong> ${extractEmail(result.text)}</p>
                <p><strong>Subject:</strong> ${extractSubject(result.text)}</p>
                <p><strong>Snippet:</strong> ${result.text.slice(0, 500)}...</p>  <!-- Increased snippet length -->
                <p class="similarity"><strong>Similarity:</strong> ${result.similarity.toFixed(6)}</p>  <!-- 6 decimal places -->
            `;
            resultsContainer.appendChild(resultElement);
        });
    }

    function displayChart(results) {
        const similarityScores = results.map(result => result.similarity);
        const labels = results.map((_, index) => `Doc ${index + 1}`);

        const data = [
            {
                x: labels,
                y: similarityScores,
                type: 'bar',
                marker: {
                    color: 'rgba(255, 105, 180, 0.5)'  // Transparent pink color
                }
            },
        ];

        Plotly.newPlot('chartDiv', data);
    }

    // Helper functions to extract email and subject from the text (simplified for this example)
    function extractEmail(text) {
        const emailMatch = text.match(/From:\s(.+?@.+?\.\w+)/);
        return emailMatch ? emailMatch[1] : "Unknown";
    }

    function extractSubject(text) {
        const subjectMatch = text.match(/Subject:\s(.+)/);
        return subjectMatch ? subjectMatch[1] : "No subject";
    }
});
