document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('timesheet-form');
    const table = document.getElementById('timesheet-table');
    const dateInput = document.getElementById('date');

    // Imposta la data odierna come predefinita
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        addTimesheetEntry();
        form.reset();
        dateInput.value = today;
    });

    function addTimesheetEntry() {
        const date = form.elements.date.value;
        const startTime = form.elements['start-time'].value;
        const endTime = form.elements['end-time'].value;
        const activity = form.elements.activity.value;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${startTime} - ${endTime}</td>
            <td>${activity}</td>
        `;
        table.querySelector('tbody').appendChild(row);
    }
});
