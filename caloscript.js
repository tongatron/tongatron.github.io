let items = {};

const selectedItems = [];

const dailyValues = {
    calories: 2500,
    carbs: 300,
    sugars: 36,
    protein: 56,
    fat: 70,
    saturatedFat: 20,
    sodium: 2300,
    fiber: 30
};

// Carica i dati dal file JSON
fetch('dati_nutrizionali.json')
    .then(response => response.json())
    .then(data => {
        items = data;
        populateSelect();
    });

function populateSelect() {
    const select = document.getElementById('itemSelect');
    select.innerHTML = '';
    for (const key in items) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = items[key].name;
        select.appendChild(option);
    }
}

function addItem(itemKey = null) {
    const select = document.getElementById('itemSelect');
    const key = itemKey || select.value;
    const existingItem = selectedItems.find(item => item.key === key);

    if (existingItem) {
        existingItem.count++;
    } else {
        const item = { key: key, count: 1 };
        selectedItems.push(item);
    }

    updateSelectedItems();
    updateCalories();
}

function removeItem(itemKey) {
    const itemIndex = selectedItems.findIndex(item => item.key === itemKey);

    if (itemIndex > -1) {
        if (selectedItems[itemIndex].count > 1) {
            selectedItems[itemIndex].count--;
        } else {
            selectedItems.splice(itemIndex, 1);
        }
    }

    updateSelectedItems();
    updateCalories();
}

function updateSelectedItems() {
    const list = document.getElementById('selectedItems');
    list.innerHTML = '';
    selectedItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            ${items[item.key].name} (${items[item.key].type === 'drink' ? items[item.key].ml + ' ml' : items[item.key].g + ' g'}) - ${item.count} 
            <div>
                <button class="btn btn-sm btn-primary" onclick="addItem('${item.key}')">+</button>
                <button class="btn btn-sm btn-danger" onclick="removeItem('${item.key}')">-</button>
            </div>
        `;
        list.appendChild(listItem);
    });
}

function updateCalories() {
    const itemCaloriesList = document.getElementById('itemCalories');
    itemCaloriesList.innerHTML = '';
    let totalCalories = 0;

    const nutritionTotals = {
        calories: 0,
        carbs: 0,
        sugars: 0,
        protein: 0,
        fat: 0,
        saturatedFat: 0,
        sodium: 0,
        fiber: 0
    };

    selectedItems.forEach(item => {
        const totalItemCalories = items[item.key].calories * item.count;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${items[item.key].name}</td>
            <td>${item.count}</td>
            <td>${totalItemCalories} cal</td>
        `;
        itemCaloriesList.appendChild(row);

        totalCalories += totalItemCalories;
        nutritionTotals.calories += items[item.key].calories * item.count;
        nutritionTotals.carbs += items[item.key].carbs * item.count;
        nutritionTotals.sugars += items[item.key].sugars * item.count;
        nutritionTotals.protein += items[item.key].protein * item.count;
        nutritionTotals.fat += items[item.key].fat * item.count;
        if (items[item.key].saturatedFat) {
            nutritionTotals.saturatedFat += items[item.key].saturatedFat * item.count;
        }
        if (items[item.key].sodium) {
            nutritionTotals.sodium += items[item.key].sodium * item.count;
        }
        if (items[item.key].fiber) {
            nutritionTotals.fiber += items[item.key].fiber * item.count;
        }
    });

    document.getElementById('totalCalories').innerHTML = `
        Calorie Totali: ${totalCalories} cal<br>
    `;

    updateNutritionTable(nutritionTotals);
}

function updateNutritionTable(nutritionTotals) {
    const nutritionTable = document.getElementById('nutritionTable');
    nutritionTable.innerHTML = `
        <tr>
            <td>Calorie</td>
            <td>${nutritionTotals.calories} cal</td>
            <td>${dailyValues.calories} cal</td>
        </tr>
        <tr>
            <td>Carboidrati</td>
            <td>${nutritionTotals.carbs} g</td>
            <td>${dailyValues.carbs} g</td>
        </tr>
        <tr>
            <td>Zuccheri</td>
            <td>${nutritionTotals.sugars} g</td>
            <td>${dailyValues.sugars} g</td>
        </tr>
        <tr>
            <td>Proteine</td>
            <td>${nutritionTotals.protein} g</td>
            <td>${dailyValues.protein} g</td>
        </tr>
        <tr>
            <td>Grassi</td>
            <td>${nutritionTotals.fat} g</td>
            <td>${dailyValues.fat} g</td>
        </tr>
        <tr>
            <td>Grassi Saturi</td>
            <td>${nutritionTotals.saturatedFat} g</td>
            <td>${dailyValues.saturatedFat} g</td>
        </tr>
        <tr>
            <td>Sodio</td>
            <td>${nutritionTotals.sodium} mg</td>
            <td>${dailyValues.sodium} mg</td>
        </tr>
        <tr>
            <td>Fibra</td>
            <td>${nutritionTotals.fiber} g</td>
            <td>${dailyValues.fiber} g</td>
        </trEcco la funzione aggiornata `generateChart` e il resto del codice JavaScript:

### Funzione `generateChart` (`caloscript.js`):
```javascript
function generateChart() {
    const nutritionTotals = {
        calories: 0,
        carbs: 0,
        sugars: 0,
        protein: 0,
        fat: 0,
        saturatedFat: 0,
        sodium: 0,
        fiber: 0
    };

    selectedItems.forEach(item => {
        nutritionTotals.calories += items[item.key].calories * item.count;
        nutritionTotals.carbs += items[item.key].carbs * item.count;
        nutritionTotals.sugars += items[item.key].sugars * item.count;
        nutritionTotals.protein += items[item.key].protein * item.count;
        nutritionTotals.fat += items[item.key].fat * item.count;
        if (items[item.key].saturatedFat) {
            nutritionTotals.saturatedFat += items[item.key].saturatedFat * item.count;
        }
        if (items[item.key].sodium) {
            nutritionTotals.sodium += items[item.key].sodium * item.count;
        }
        if (items[item.key].fiber) {
            nutritionTotals.fiber += items[item.key].fiber * item.count;
        }
    });

    const ctx = document.getElementById('nutritionChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Calorie', 'Carboidrati', 'Zuccheri', 'Proteine', 'Grassi', 'Grassi Saturi', 'Sodio', 'Fibra'],
            datasets: [{
                label: 'Valori Nutrizionali Totali',
                data: [
                    nutritionTotals.calories,
                    nutritionTotals.carbs,
                    nutritionTotals.sugars,
                    nutritionTotals.protein,
                    nutritionTotals.fat,
                    nutritionTotals.saturatedFat,
                    nutritionTotals.sodium,
                    nutritionTotals.fiber
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Valori Nutrizionali Giornalieri Raccomandati',
                data: [
                    dailyValues.calories,
                    dailyValues.carbs,
                    dailyValues.sugars,
                    dailyValues.protein,
                    dailyValues.fat,
                    dailyValues.saturatedFat,
                    dailyValues.sodium,
                    dailyValues.fiber
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
