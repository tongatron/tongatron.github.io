document.addEventListener('DOMContentLoaded', function () {
    let beverages = {};

    // Carica i dati dal file JSON
    fetch('beverages.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            beverages = data;
            populateBeverageSelect();
        })
        .catch(error => console.error('Errore nel caricamento dei dati:', error));

    const addButton = document.getElementById('addButton');
    const clearButton = document.getElementById('clearButton');
    const resultList = document.getElementById('resultList');
    const totalCaloriesDisplay = document.getElementById('totalCalories');
    let totalCalories = 0;

    addButton.addEventListener('click', function () {
        const beverageSelect = document.getElementById('beverageSelect');
        const selectedBeverage = beverageSelect.value;
        const beverage = beverages[selectedBeverage];

        if (beverage) {
            totalCalories += beverage.calories;

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.innerHTML = `${beverage.name}: ${beverage.calories} calorie<br>
                                  Carboidrati: ${beverage.carbs}g, Zuccheri: ${beverage.sugars}g, 
                                  Proteine: ${beverage.protein}g, Grassi: ${beverage.fat}g`;

            resultList.appendChild(listItem);
            totalCaloriesDisplay.textContent = `Calorie Totali: ${totalCalories.toFixed(2)}`;
        }
    });

    clearButton.addEventListener('click', function () {
        resultList.innerHTML = '';
        totalCalories = 0;
        totalCaloriesDisplay.textContent = `Calorie Totali: 0`;
    });

    function populateBeverageSelect() {
        const beverageSelect = document.getElementById('beverageSelect');
        for (const key in beverages) {
            if (beverages.hasOwnProperty(key)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${beverages[key].name} (${beverages[key].calories} calorie)`;
                beverageSelect.appendChild(option);
            }
        }
    }
});
