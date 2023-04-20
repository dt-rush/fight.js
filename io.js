//
// I/O functions
//

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
