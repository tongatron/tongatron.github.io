document.addEventListener("DOMContentLoaded", function() {
  // Load presets from JSON file
  fetch('presets.json')
    .then(response => response.json())
    .then(data => {
      window.presets = data;
    });

  document.getElementById('results-container').style.display = 'none';
});

function showPresetModal(preset, targetId) {
  const items = window.presets[preset];
  const presetItemsContainer = document.getElementById('presetItems');
  presetItemsContainer.innerHTML = '';
  items.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'form-check';
    div.innerHTML = `
      <input class="form-check-input" type="checkbox" value="${item}" id="presetItem${index}">
      <label class="form-check-label" for="presetItem${index}">
        ${item}
      </label>
    `;
    presetItemsContainer.appendChild(div);
  });
  document.getElementById('selectAll').checked = false;
  document.getElementById('selectAll').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('#presetItems .form-check-input');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
  });
  document.getElementById('presetModal').setAttribute('data-target-id', targetId);
  new bootstrap.Modal(document.getElementById('presetModal')).show();
}

function applyPreset() {
  const targetId = document.getElementById('presetModal').getAttribute('data-target-id');
  const checkboxes = document.querySelectorAll('#presetItems .form-check-input');
  const selectedItems = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
  document.getElementById(targetId).value = selectedItems.join('\n');
  bootstrap.Modal.getInstance(document.getElementById('presetModal')).hide();
}



function generatePrompts() {
  const subjects = document.getElementById('subjects').value.split('\n').map(item => item.trim()).filter(item => item);
  const styles = document.getElementById('styles').value.split('\n').map(item => item.trim()).filter(item => item);
  const others = document.getElementById('others').value.split('\n').map(item => item.trim()).filter(item => item);

  let prompts = [];
  
  if (styles.length === 0) styles.push(''); // Aggiungi elemento vuoto se array vuoto
  if (subjects.length === 0) subjects.push(''); // Aggiungi elemento vuoto se array vuoto
  if (others.length === 0) others.push(''); // Aggiungi elemento vuoto se array vuoto

  styles.forEach(style => {
    subjects.forEach(subject => {
      others.forEach(other => {
        prompts.push('"${subject}", style "${style}" as "${other}"`.trim());
      });
    });
  });

  const resultsContainer = document.getElementById('results-container');
  const results = document.getElementById('results');
  results.innerHTML = '';

  if (prompts.length > 0) {
    prompts.forEach(prompt => {
      const item = document.createElement('a');
      item.className = 'list-group-item list-group-item-action result-item';
      item.textContent = prompt;
      item.onclick = () => copyLineToClipboard(prompt);
      results.appendChild(item);
    });
    resultsContainer.style.display = 'block';
  } else {
    resultsContainer.style.display = 'none';
  }
}


function clearInputs() {
  document.getElementById('subjects').value = '';
  document.getElementById('styles').value = '';
  document.getElementById('others').value = '';
  document.getElementById('results').innerHTML = '';
  document.getElementById('results-container').style.display = 'none';
}

function copyLineToClipboard(line) {
  const tempInput = document.createElement('textarea');
  tempInput.style.position = 'absolute';
  tempInput.style.left = '-9999px';
  tempInput.value = line;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  // Mostra la notifica "copiato negli appunti"
  const lineCopyNotification = document.getElementById('line-copy-notification');
  lineCopyNotification.style.display = 'block';

  // Nascondi la notifica dopo 2 secondi
  setTimeout(() => {
    lineCopyNotification.style.display = 'none';
  }, 2000);

  // Evidenzia la riga cliccata
  const resultItems = document.querySelectorAll('.result-item');
  resultItems.forEach(item => {
    if (item.textContent === line) {
      item.classList.add('highlight');
      setTimeout(() => {
        item.classList.remove('highlight');
      }, 2000);
    }
  });
}

function copyAllToClipboard() {
  const results = Array.from(document.getElementById('results').children)
    .map(item => item.textContent)
    .join('\n');
  const tempInput = document.createElement('textarea');
  tempInput.style.position = 'absolute';
  tempInput.style.left = '-9999px';
  tempInput.value = results;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  // Mostra la notifica "copiato"
  const copyNotification = document.getElementById('copy-notification');
  copyNotification.style.display = 'inline';

  // Nascondi la notifica dopo 2 secondi
  setTimeout(() => {
    copyNotification.style.display = 'none';
  }, 2000);
}

function downloadAsTxt() {
  const results = Array.from(document.getElementById('results').children)
    .map(item => item.textContent)
    .join('\n');
  const blob = new Blob([results], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'prompts.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}