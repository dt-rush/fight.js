//
// I/O functions
//

// who is either "player" or "computer"
function writeToOutput(text, classes = 'info', divId = 'output') {
  const div = document.getElementById(divId);
  div.innerHTML += `<div class="message ${classes}"><span class="pill">` + (text || "") + `</div></div>`;
  div.scrollTop = div.scrollHeight;
}

async function displayClickableDivs(options, query, divId = 'options') {
  const div = document.getElementById(divId);
  div.innerHTML = ''; // Clear previous options

  const queryDiv = document.createElement('div');
  queryDiv.classList.add('query');
  queryDiv.textContent = query;
  div.appendChild(queryDiv);

  const gridList = document.createElement('div');
  gridList.classList.add('gridList');
  div.appendChild(gridList);

  // Create clickable divs for each option
  const clickableDivs = options.map((option, index) => {
    const clickableDiv = document.createElement('div');
    clickableDiv.textContent = `${option}`;
    clickableDiv.classList.add('clickable-option');
    clickableDiv.dataset.value = index + 1;
    gridList.appendChild(clickableDiv);
    return clickableDiv;
  });

  // Return a promise that resolves with the clicked option value
  return new Promise(resolve => {
    const onClick = event => {
      if (event.target.classList.contains('clickable-option')) {
        const value = event.target.dataset.value;
        div.removeEventListener('click', onClick); // Remove event listener after a valid click
        div.innerHTML = '';
        resolve(value);
      }
    };

    div.addEventListener('click', onClick);
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
