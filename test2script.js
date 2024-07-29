document.addEventListener('DOMContentLoaded', function () {
    fetch('test.json')
        .then(response => response.json())
        .then(data => {
            displayData(data);
        })
        .catch(error => console.error('Errore nel caricamento dei dati:', error));

    function displayData(data) {
        const resultDiv = document.getElementById('result');
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const beverage = data[key];
                const beverageInfo = document.createElement('p');
                beverageInfo.innerHTML = `Nome: ${beverage.name}<br>
                                          Tipo: ${beverage.type}<br>
                                          Calorie: ${beverage.calories}<br>
                                          Carboidrati: ${beverage.carbs}g<br>
                                          Zuccheri: ${beverage.sugars}g<br>
                                          Proteine: ${beverage.protein}g<br>
                                          Grassi: ${beverage.fat}g`;
                resultDiv.appendChild(beverageInfo);
            }
        }
    }
});
