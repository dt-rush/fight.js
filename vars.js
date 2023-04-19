//
// career vars
//

let fighterName = undefined;
let nickName = undefined;

//
// contest vars
//

let round = 1;
let t = 0;
let roundTime = 12; // note: not minutes, just increments every time promptUser() is called
let nRounds = 3;
let judgeScores = [[0, 0], [0, 0], [0, 0]];
let roundPoints = [0, 0];

//
// combat vars
//

let mode = "standing";
let health = [20, 20];
let acuity = [50, 50];
let submissionProgress = [0, 0];
let initiative = "player"; // "player" or "computer"
