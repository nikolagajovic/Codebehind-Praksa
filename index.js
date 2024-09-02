const fs = require ('fs');

// Učitavanje JSON fajla "groups.json"
const groupsData = JSON.parse(fs.readFileSync('groups.json', 'utf8'));

// Funkcija za simulaciju utakmice
function simulateGame(team1, team2, allowDraw = false) {
    const rankDifference = team2.FIBARanking - team1.FIBARanking;
    const probabilityTeam1Win = 1 / (1 + Math.pow(10, rankDifference / 400));
    const randomValue = Math.random();
    const team1Wins = randomValue < probabilityTeam1Win;
    const team1Score = Math.floor(Math.random() * 20) + 80;
    const team2Score = Math.floor(Math.random() * 20) + 80;

    if (!allowDraw && team1Score === team2Score) {
        if (team1Wins) {
            team1Score += 1;
        } else {
            team2Score += 1;
        }
    }

    
    return {
        winner: team1Wins ? team1 : team2,
        loser: team1Wins ? team2 : team1,
        score: team1Wins ? `${team1Score}:${team2Score}` : `${team2Score}:${team1Score}`
    };

}

// Funkcija za Ažuriranje Statistika Tima
function updateTeamStatus(team, scoredPoints, concededPoints, win) {
    team.gamesPlayed = (team.gamesPlayed || 0) + 1;
    team.pointsScored = (team.pointsScored || 0) + scoredPoints;
    team.pointsConceded = (team.pointsConceded || 0) + concededPoints;
    team.pointDifference = team.pointsScored - team.pointsConceded;
    if (win) {
        team.wins = (team.wins || 0) + 1;
        team.points = (team.points || 0) + 2;
    } else {
        team.losses = (team.losses || 0) + 1;
        team.points = (team.points || 0) + 1;
    }

}

// Funkcija za Simulaciju Grupe
function simulateGroupStage(groups) {
    const groupResults = {};
    const groupStandings = {};


    for (const group of Object.keys(groups)) {
        groupResults[group] = [];
        groupStandings[group] = groups[group].map(team => ({ ...team, points: 0, gamesPlayed: 0, wins: 0, losses: 0, points: 0 }));
        

        for(let i = 0; i < groupStandings[group].length; i++) {  
            for(let j = i + 1; j < groupStandings[group].length; j++) {
                const result = simulateGame(groupStandings[group][i], groupStandings[group][j]);
                groupResults[group].push({
                    game: `${groupStandings[group][i].Team} vs ${groupStandings[group][j].Team}`,
                    result: result.score,
                    winner: result.winner.Team,
                    loser: result.loser.Team
                });
                const team1Score = parseInt(result.score.split(":")[0]);
                const team2Score = parseInt(result.score.split(":")[1]);
                updateTeamStatus(groupStandings[group][i], team1Score, team2Score, result.winner === groupStandings[group][i]);
                updateTeamStatus(groupStandings[group][j], team1Score, team2Score, result.winner === groupStandings[group][j]);

            }

        }
        groupStandings[group].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.pointDifference !== a.pointDifference) return b.pointDifference - a.pointDifference;
            return b.pointsScored - a.pointsScored;
        });
    }

    return {groupResults, groupStandings};
    
}

//Prikazivanje rezultata
function displayResults(groupStageResults) {
    for (const group of Object.keys(groupStageResults)) {
        console.log(`Grupa ${group}:`);
        for (const game of groupStageResults[group]) {
            console.log(`    ${game.game} (${game.result})`);
        }
    }
}

//Prikazivanje tabele
function displayGroupStandings(groupStandings){
    for (const group of Object.keys(groupStandings)) {
        console.log(`Grupa ${group}:`);
        groupStandings[group].forEach((team, index) => {
            console.log(`    ${index + 1}. ${team.Team} (${team.wins} / ${team.losses} / ${team.points} bodova / 
                ${team.pointsScored} postignutih koševa / ${team.pointsConceded} primljenih koševa / ${team.pointDifference} koš razlika)`);
        });
    }
        
}

//Kreiranje šešira
function createPots(groupStandings){
    const pots = {D: [], E: [], F:[], G:[]}
    const allTeams = [];
    for(const group of Object.keys(groupStandings)) {
        allTeams.push(...groupStandings[group]);
    }
    const sortedTeams = allTeams.sort((a, b) => b.points - a.points || b.pointDifference - a.pointDifference || b.pointsScored - a.pointsScored);
    pots.D.push(sortedTeams[0], sortedTeams[1]);
    pots.E.push(sortedTeams[2], sortedTeams[3]);
    pots.F.push(sortedTeams[4], sortedTeams[5]);
    pots.G.push(sortedTeams[6], sortedTeams[7]);
    return pots;
}

//Žreb Četvrtfinala

function drawQuarterFinals(pots, groupResults){
    const quarterFinals = [];
    const usedTeams = new Set();

    function getRandomTeamFromPot(pot){
        const availableTeams = pot.filter(team => !usedTeams.has(team.Team));
        if (availableTeams.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * availableTeams.length);
        return availableTeams[randomIndex];  
    }

    function isValidMatch(team1, team2){
        return !Object.values(groupResults).flat().some(game =>
            (game.winner === team1.Team && game.loser === team2.Team) || 
            (game.winner === team2.Team && game.loser === team1.Team)
        );
    }

    while (quarterFinals.length < 4) {
        const team1D = getRandomTeamFromPot(pots.D);
        const team2G = getRandomTeamFromPot(pots.G);
        const team1E = getRandomTeamFromPot(pots.E);
        const team2F = getRandomTeamFromPot(pots.F);

        if (team1D && team2G && isValidMatch(team1D, team2G)) {
            usedTeams.add(team1D.Team);
            usedTeams.add(team2G.Team);
            quarterFinals.push({team1: team1D, team2: team2G});
        }

        if (team1E && team2F && isValidMatch(team1E, team2F)) {
            usedTeams.add(team1E.Team);
            usedTeams.add(team2F.Team);
            quarterFinals.push({team1: team1E, team2: team2F});
        }
    }
    return quarterFinals;
}   


//Simulacija Eliminacione Faze
function simulateKnockoutStage(game) {
    const results = [];
    game.forEach(game => {
        const result = simulateGame(game.team1, game.team2);
        results.push({
            game: `${result.winner.Team} - ${result.loser.Team}`,
            score: result.score,
            winner: result.winner,
            loser: result.loser
        });
    });
    return results;
}

//Simulacija Polufinala
function arrangeSemiFinals(quarterFinalsResults) {
    const semiFinals = [];
    semiFinals.push ({ team1: quarterFinalsResults[0].winner, team2: quarterFinalsResults[1].winner});
    semiFinals.push ({ team1: quarterFinalsResults[2].winner, team2: quarterFinalsResults[3].winner});
    return semiFinals;
}

//Finale i Utakmice za Treće Mesto
function arrangeFinalAndThirdPlace(semiFinalsResults) {
    const thirdPlaceGame = { team1: semiFinalsResults[0].loser, team2: semiFinalsResults[1].loser};
    const finalGame = { team1: semiFinalsResults[0].winner, team2: semiFinalsResults[1].winner};
    return { thirdPlaceGame, finalGame};
}

//Prikaz Šešira
function displayPots(pots) {
    console.log("Šeširi:");
    for(const pot in pots) {
        console.log(`   Šešir ${pot}`);
        pots[pot].forEach(team => {
            console.log(`      ${team.Team}`);
        });
    }
}

// Prikaz Žreba Četvrtfinala
function displayKnockoutDraw(quarterFinals) {
    console.log("Eliminaciona faza:");
    quarterFinals.forEach ((game, index) => {
        console.log(`    ${game.team1.Team} - ${game.team2.Team}`);
    });
}

//Prilaz Medalja
function displayMedalWinners(finalResults, thirdPlaceResults) {
    console.log("Medalje:");
    console.log(`   1. mesto: ${finalResults.winner.Team}`);
    console.log(`   2. mesto: ${finalResults.loser.Team}`);
    console.log(`   3. mesto: ${thirdPlaceResults.winner.Team}`);

}

//Simulacija grupne faze
const {groupResults, groupStandings} = simulateGroupStage(groupsData);
displayResults(groupResults);
displayGroupStandings(groupStandings);


//Organizacija i žreb četvrtfinala
const pots = createPots(groupStandings);
displayPots(pots);
const quarterFinals = drawQuarterFinals(pots, groupResults);
displayKnockoutDraw(quarterFinals);


//Simulacija Četvrtfinala
const quarterFinalsResults = simulateKnockoutStage(quarterFinals);
console.log("Četvrtfinale:");
quarterFinalsResults.forEach(result => {
    console.log(`   ${result.game} (${result.score})`);
});


//Simulacija Polufinala
const semiFinals = arrangeSemiFinals(quarterFinalsResults);
const semiFinalsResults = simulateKnockoutStage(semiFinals);
console.log("Polufinale:");
semiFinalsResults.forEach(result => {
    console.log(`   ${result.game} (${result.score})`);
}); 



//Simulacija finala i utakmice za trece mesto
const {thirdPlaceGame, finalGame} = arrangeFinalAndThirdPlace(semiFinalsResults);
const thirdPlaceResult = simulateKnockoutStage([thirdPlaceGame])[0];
const finalResult = simulateKnockoutStage([finalGame])[0];
console.log("Utakmica za treće mesto:");
console.log(`   ${thirdPlaceResult.game} (${thirdPlaceResult.score})`);
console.log("Finale:");
console.log(`   ${finalResult.game} (${finalResult.score})`);



//Prikazivanje osvajača medalja
displayMedalWinners(finalResult, thirdPlaceResult);