let presets = {};

fetch('presets.json')
  .then(response => response.json())
  .then(data => {
    presets = data;
    populateDropdowns();
  })
  .catch(error => console.error('Error loading presets:', error));

function populateDropdowns() {
  populateDropdown('Soggetti', 'dropdownMenuSubjects');
  populateDropdown('Stili', 'dropdownMenuStyles');
  populateDropdown('Altro', 'dropdownMenuOthers');
}

function populateDropdown(category, dropdownId) {
  const dropdownMenu = document.getElementById(dropdownId);
  if (dropdownMenu) {
    Object.keys(presets[category]).forEach(preset => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dropdown-item';
      a.href = '#';
      a.textContent = preset;
      a.onclick = () => showPresetModal(preset, category);
      li.appendChild(a);
      dropdownMenu.appendChild(li);
    });
  }
}

function showPresetModal(preset, category) {
  const presetList = document.getElementById('presetList');
  presetList.innerHTML = '';

  const items = presets[category][preset];
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'list-group-item list-group-item-action';
    div.textContent = item;
    div.onclick = () => toggleSelection(div);
    presetList.appendChild(div);
  });

  document.getElementById('presetModalLabel').textContent = `Seleziona Preset per ${preset}`;
  const selectAllBtn = document.getElementById('selectAllBtn');
  selectAllBtn.onclick = () => selectAll(presetList, category.toLowerCase());

  const modal = new bootstrap.Modal(document.getElementById('presetModal'));
  modal.show();
}

function toggleSelection(element) {
  element.classList.toggle('active');
}

function selectAll(presetList, targetId) {
  const items = presetList.querySelectorAll('.list-group-item');
  const selectedItems = [];

  items.forEach(item => {
    item.classList.add('active');
    selectedItems.push(item.textContent);
  });

  document.getElementById(targetId).value = selectedItems.join('\n');
  const modal = bootstrap.Modal.getInstance(document.getElementById('presetModal'));
  modal.hide();
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
        prompts.push(`an "${subject}", style "${style}" as "${other}"`.trim());
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
  document.getElementById('results').innerHTML = ''; // Cancella anche i risultati
  document.getElementById('results-container').style.display = 'none'; // Nascondi il contenitore dei risultati
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

  const notification = document.getElementById('line-copy-notification');
  notification.style.display = 'inline';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 2000);
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

  const notification = document.getElementById('copy-notification');
  notification.style.display = 'inline';
  setTimeout(() => {
    notification.style.display = 'none';
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
