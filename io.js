//
// I/O functions
//

function displayVitals() {
  const vitalsDiv = document.getElementById('vitals');
  vitalsDiv.innerHTML = '';

  const createRow = (classes) => {
    const row = document.createElement('div');
    row.classList.add('row', ...classes);
    return row;
  };

  const createVital = (classes, content) => {
    const vital = document.createElement('div');
    vital.classList.add('vital', ...classes);
    vital.textContent = content;
    return vital;
  };

  const row1 = createRow(["name"]);
  let displayName = fighterName;
  if (displayName.length > 32) {
    displayName = displayName.substr(0, 32) + "...";
  }
  row1.appendChild(createVital(['playerName'], displayName));
  row1.appendChild(createVital(['computerName'], 'Computer'));

  const row2 = createRow(["health"]);
  row2.appendChild(createVital(['playerHealth'], `${health[0]}`));
  row2.appendChild(createVital(['symbol'], '❤️'));
  row2.appendChild(createVital(['computerHealth'], `${health[1]}`));

  const row3 = createRow(["acuity"]);
  row3.appendChild(createVital(['playerAcuity'], `${Math.round(acuity[0])}`));
  row3.appendChild(createVital(['symbol'], '💡'));
  row3.appendChild(createVital(['computerAcuity'], `${Math.round(acuity[1])}`));

  const row4 = createRow(["submission"]);
  row4.appendChild(createVital(['playerSubmission'], `${Math.round(submissionProgress[0])}`));
  row4.appendChild(createVital(['symbol'], '🤼'));
  row4.appendChild(createVital(['computerSubmission'], `${Math.round(submissionProgress[1])}`));

  vitalsDiv.appendChild(row1);
  vitalsDiv.appendChild(row2);
  vitalsDiv.appendChild(row3);
  vitalsDiv.appendChild(row4);
}

function displayRound() {
  const roundDiv = document.getElementById('round');
  roundDiv.innerHTML = `Round: ${round}`;
}

function hideRound() {
  const roundDiv = document.getElementById('round');
  roundDiv.innerHTML = '';
}

function writeToOutput(text, classes = 'info', divId = 'output') {
  const div = document.getElementById(divId);
  const messageDiv = document.createElement('div');
  classList = classes.split(" ");
  messageDiv.classList.add('message', ...classList);
  messageDiv.innerHTML = `<span class="pill">` + (text || "") + `</span>`;
  div.appendChild(messageDiv);
  div.scrollTop = div.scrollHeight;
  return messageDiv;
}


async function displayClickableDivs(options, query, divId = 'options') {
  const div = document.getElementById(divId);
  div.innerHTML = ''; // Clear previous options

  const queryDiv = document.createElement('div');
  queryDiv.classList.add('query');
  queryDiv.textContent = query;
  div.appendChild(queryDiv);

  const grid = document.createElement('div');
  grid.classList.add('grid');
  div.appendChild(grid);

  const gridList = document.createElement('div');
  gridList.classList.add('gridList');
  grid.appendChild(gridList);

  // Return a promise that resolves with the clicked option value
  return new Promise(resolve => {
    const onOptionClick = event => {
      const value = event.currentTarget.dataset.value;
      div.innerHTML = '';
      resolve(value);
    };

    // Create clickable divs for each option
    options.forEach((option, index) => {
      const clickableDiv = document.createElement('div');
      clickableDiv.classList.add('clickable-option');
      clickableDiv.dataset.value = index + 1;

      const inner = document.createElement('div');
      inner.classList.add('label');
      inner.textContent = `${option}`;
      clickableDiv.appendChild(inner);

      clickableDiv.addEventListener('click', onOptionClick);

      gridList.appendChild(clickableDiv);
    });
  });
}

function askQuestion(query) {
  return new Promise(resolve => {
    // Create modal div
    const modalDiv = document.createElement('div');
    modalDiv.classList.add('modal');

    // Create text input and append it to the modal div
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = query; // Set the query text as the input placeholder
    input.setAttribute('autocomplete', 'off'); // Disable autocomplete
    modalDiv.appendChild(input);

    // Add modal div to the body!
    document.body.appendChild(modalDiv);

    // Set focus on the input
    input.focus();

    // Handle input submission
    const onKeyPress = event => {
      if (event.key === 'Enter') {
        // Remove event listener and modal div
        input.removeEventListener('keypress', onKeyPress);
        document.body.removeChild(modalDiv);

        // Resolve promise with input value
        resolve(input.value);
      }
    };

    // Attach event listener
    input.addEventListener('keypress', onKeyPress);
  });
}
