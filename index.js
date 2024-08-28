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