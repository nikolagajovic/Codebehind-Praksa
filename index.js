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

