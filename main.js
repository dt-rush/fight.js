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
  document.getElementById("vitals").scrollIntoView();
  return promptUser();
}

main()
  .then(() => {
    const optionsElement = document.getElementById('options');
    optionsElement.style.display = 'none';
  });
