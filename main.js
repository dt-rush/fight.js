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

  return promptUser();
}

main()
  .then(() => {
    const outputElement = document.getElementById('output');
    outputElement.style.height = '80%';
    const optionsElement = document.getElementById('options');
    optionsElement.style.display = 'none';
  });