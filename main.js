//
// main
//

async function main() {
  // TODO: implement fighter save/load
  fighterName = await getFighterName("Enter name: ");
  nickName = await getFighterName("Enter nickname: ");
  /*
          fighterName = "Ronaldo Guzman";
          nickName = "The Goose";
          */
  displayVitals();
  displayRound();
  window.scrollTo(0, 0);
  return promptUser();
}

main()
  .then(() => {
    const optionsElement = document.getElementById('options');
    optionsElement.style.display = 'none';
  });
