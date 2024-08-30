const fs = require ('fs');

// Učitavanje JSON fajla "groups.json"
const groupsData = JSON.parse(fs.readFileSync('groups.json', 'utf8'));

// Funkcija za simulaciju utakmice
function simulateGame(team1, team2) {
    const rankDifference = team2.FIBARanking - team1.FIBARanking;
    const probabilityTeam1Win = 1 / (1 + Math.pow(10, rankDifference / 400));
    const randomValue = Math.random();
    const team1Wins = randomValue < probabilityTeam1Win;
    const team1Score = Math.floor(Math.random() * 20) + 80;
    const team2Score = Math.floor(Math.random() * 20) + 80;
    return {
        winner: team1Wins ? team1 : team2,
        loser: team1Wins ? team1 : team2,
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
        team.win = (team.wins || 0) + 1;
        team.points = (team.points || 0) + 2;
    } else {
        team.losses = (team.losses || 0) + 1;
        team.points = (team.points || 0) + 1;
    }

}

// Funkcija za Simulaciju Grupe
function simulateGroupStage(groups) {
    const groupResults = {};
    const groupStanding = {};


    for (const group of Object.keys(groups)) {
        groupResults[group] = [];
        groupStanding[group] = groups[group].map(team => ({ ...team, points: 0, gamesPlayed: 0, wins: 0, losses: 0, points: 0 }));
        

        for(let i = 0; i < groupStanding[group].Length; i++) {  
            for(let j = i + 1; j < groupStanding[group].Length; j++) {
                const result = simulateGame(groupStanding[group][i], groupStandings[group][j]);
                groupResults[group].push({
                    game: `${groupStandings[group][i].Team} vs ${groupStandings[group][j].Team}`,
                    result: result.score,
                    winner: result.winner.Team,
                    loser: result.loser.Team
                });
                const team1Score = parseInt(result.score.split(":")[0]);
                const team2Score = parseInt(result.score.split(":")[0]);
                updateTeamStatus(groupStanding[group][i], team1Score, team2Score, result.winner === groupStandings[group][i]);
                updateTeamStatus(groupStanding[group][j], team1Score, team2Score, result.winner === groupStandings[group][j]);

            }

        }
        groupStanding[group].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.pointDifference !== a.pointDifference) return b.pointDifference - a.pointDifference;
            return b.pointsScored - a.pointsScored;
        });
    }

    return {groupResults, groupStanding};
    
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
            console.log(`    ${index + 1}. ${team.Team} (${team.wins} / ${team.losses} / ${team.points} bodova / ${team.pointsScored} postignutih koševa / ${team.pointsConceded} primljenih koševa / ${team.pointDifference} koš razlika)`);
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
    const quarterFinals = {};
    const usedTeams = new Set();


    function getRandomTeamFromPot(pot){
        const availableTeams = pot.filter(team => !usedTeams.has(team.team));
        if (availableTeams.Length === 0) return null;
        const randomIndex = Math.floor(Math.random() * availableTeams.Length);
        return availableTeams[randomIndex];  
    }


    function isValidMatch(team1, team2){
        return !Object.values(groupResults).flat().some(game =>
            (game.winner === team1.Team && game.loser === team2.Team) || 
            (game.winner === team2.Team && game.loser === team1.Team)
        );
    }


    while (quarterFinals.Length < 4) {
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