// Minimal Chart.js example
function renderRatingsChart() {
    // Extract week labels
    const weekLabels = allRatings.map(weekArr => `Week ${weekArr[0].week}`);

    // Get all team names
    const teams = Object.keys(TEAMS);

    // Build datasets: one per team
    const dashedTeams = ['Winnipeg', 'Montreal', 'Hamilton'];
    const datasets = teams.map(team => {
        return {
            label: team,
            data: allRatings.map(weekArr => {
                // Find this team's rating for the week
                const found = weekArr.find(r => r.team === team);
                return found ? found.rating : null;
            }),
            borderColor: randomColor(team),
            fill: false,
            borderDash: dashedTeams.includes(team) ? [8, 4] : undefined
        };
    });

    const ctx = document.getElementById('ratingsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: weekLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            layout: {
                padding: {
                    right: 180 // Adjust as needed for label space
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: false // disables all default datalabels
                }
            }
        },
        plugins: [ChartDataLabels, customLabelPlugin]
    });
}

const customLabelPlugin = {
    id: 'customLabelPlugin',
    afterDraw: function (chart) {
        const ctx = chart.ctx;
        const datasets = chart.data.datasets;
        const lastIndex = chart.data.labels.length - 1;

        // Step 1: Collect label info
        let labels = datasets.map((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            const point = meta.data[lastIndex];
            return {
                team: dataset.label,
                elo: dataset.data[lastIndex],
                x: point.x + 15, // offset to the right
                y: point.y,
                color: dataset.borderColor,
                text: `${dataset.label} ${dataset.data[lastIndex]}`
            };
        });

        // Step 2: Sort by y
        labels.sort((a, b) => a.y - b.y);

        // Step 3: Adjust to avoid overlap
        const minSpacing = 16; // minimum vertical space between labels
        for (let i = 1; i < labels.length; i++) {
            if (labels[i].y - labels[i - 1].y < minSpacing) {
                labels[i].y = labels[i - 1].y + minSpacing;
            }
        }

        // Step 4: Draw labels
        labels.forEach(label => {
            ctx.save();
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = label.color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label.text, label.x, label.y);
            ctx.restore();
        });
    }
};

/*  Variables   */
const TEAMS = {
    BC: "BC",
    Calgary: "Calgary",
    Edmonton: "Edmonton",
    Hamilton: "Hamilton",
    Montreal: "Montreal",
    Ottawa: "Ottawa",
    Saskatchewan: "Saskatchewan",
    Toronto: "Toronto",
    Winnipeg: "Winnipeg"
};
const k = 25;
const HFA = 25;
const latestRatings = new Map();
const teamLogos = new Map();

let allResults = [];
let allRatings = [];

/*  Classes     */
class Result {
    constructor(year, week, awayTeam, awayScore, homeTeam, homeScore) {
        this.year = year;
        this.week = week;
        this.awayTeam = awayTeam;
        this.awayScore = awayScore;
        this.homeTeam = homeTeam;
        this.homeScore = homeScore;
    }
}

class WeeklyRating {
    constructor(week, team, rating) {
        this.week = week;
        this.team = team;
        this.rating = rating;
    }
}

function loadDictionary() {
    latestRatings.set(TEAMS.BC, 1500);
    latestRatings.set(TEAMS.Calgary, 1500);
    latestRatings.set(TEAMS.Edmonton, 1500);
    latestRatings.set(TEAMS.Hamilton, 1500);
    latestRatings.set(TEAMS.Montreal, 1500);
    latestRatings.set(TEAMS.Ottawa, 1500);
    latestRatings.set(TEAMS.Saskatchewan, 1500);
    latestRatings.set(TEAMS.Toronto, 1500);
    latestRatings.set(TEAMS.Winnipeg, 1500);
    // Add week 0 ratings for all teams
    CreateWeeklyRatings(0);

    teamLogos.set(TEAMS.BC, 'https://bellmedia-images.stats.bellmedia.ca/images/sports/football/cfl/bc-lions.webp');
    teamLogos.set(TEAMS.Calgary, 'https://bellmedia-images.stats.bellmedia.ca/images/sports/football/cfl/calgary-stampeders.webp');
    teamLogos.set(TEAMS.Edmonton, 'https://bellmedia-images.stats.bellmedia.ca/images/sports/football/cfl/edmonton-elks.webp');
    teamLogos.set(TEAMS.Hamilton, 'https://bellmedia-images.stats.bellmedia.ca/images/sports/football/cfl/hamilton-tiger-cats.webp');
    teamLogos.set(TEAMS.Montreal, 'https://bellmedia-images.stats.bellmedia.ca/images/sports/football/cfl/montreal-alouettes.webp');
    teamLogos.set(TEAMS.Ottawa, 'https://bellmedia-images.stats.bellmedia.ca/images/sports/football/cfl/ottawa-redblacks.webp');
    teamLogos.set(TEAMS.Saskatchewan, 'https://bellmedia-images.stats.bellmedia.ca/images/sports/football/cfl/saskatchewan-roughriders.webp');
    teamLogos.set(TEAMS.Toronto, 'https://bellmedia-images.stats.bellmedia.ca/images/sports/football/cfl/toronto-argonauts.webp');
    teamLogos.set(TEAMS.Winnipeg, 'https://bellmedia-images.stats.bellmedia.ca/images/sports/football/cfl/winnipeg-blue-bombers.webp');
}

// Helper to generate a color per team
function randomColor(team) {
    // Assign fixed colors for consistency
    const colors = {
        BC: '#ff9800', Calgary: '#d32f2f', Edmonton: '#FFD700', Hamilton: '#fbc02d',
        Montreal: '#d32f2f', Ottawa: '#212121', Saskatchewan: '#43a047', Toronto: '#0288d1', Winnipeg: '#1976d2'
    };
    return colors[team] || '#888';
}

function LoadResults() {
    allResults = [];
    allResults.push(new Result(2026, 1, TEAMS.Montreal, 30, TEAMS.Hamilton, 27));
    allResults.push(new Result(2026, 1, TEAMS.Winnipeg, 30, TEAMS.Calgary, 28));
    allResults.push(new Result(2026, 1, TEAMS.Edmonton, 29, TEAMS.Ottawa, 21));

    const latestWeek = Math.max(...allResults.map(r => r.week));

    for (let w = 1; w <= latestWeek; w++) {
        for (let i = 0; i < allResults.length; i++) {
            if (allResults[i].week == w) {
                CalculateRatings(allResults[i]);
            }
        }
        CreateWeeklyRatings(w);
    }

    document.querySelector('#currentRankingsContainer h2').textContent = `Current Weekly Rankings (Week ${latestWeek})`;
}

function CreateWeeklyRatings(weekToRate) {
    let teams = Object.keys(TEAMS);
    const newArray = [];
    for (let team of teams) {
        newArray.push(new WeeklyRating(weekToRate, team, latestRatings.get(team)));
    }
    allRatings.push(newArray);
}

function CalculateRatings(result) {
    let awayOriginalRating = latestRatings.get(result.awayTeam);
    let homeOriginalRating = latestRatings.get(result.homeTeam);
    let awayDiff = homeOriginalRating - awayOriginalRating + HFA;
    let homeDiff = awayOriginalRating - homeOriginalRating - HFA;
    if (result.week == 24) {
        awayDiff = homeOriginalRating - awayOriginalRating;
        homeDiff = awayOriginalRating - homeOriginalRating;
    }
    let awayEP = 1 / (Math.pow(10, (awayDiff) / 400) + 1);
    let homeEp = 1 / (Math.pow(10, (homeDiff) / 400) + 1);
    let kmod = k * Math.log(Math.abs(result.homeScore - result.awayScore) + 1);
    let awayResult = .5;
    let homeResult = .5;
    if (result.homeScore > result.awayScore) {
        homeResult = 1;
        awayResult = 0;
    } else if (result.homeScore < result.awayScore) {
        homeResult = 0;
        awayResult = 1;
    }
    let newAwayRating = Math.round(awayOriginalRating + kmod * (awayResult - awayEP));
    let newHomeRating = Math.round(homeOriginalRating + kmod * (homeResult - homeEp));
    latestRatings.set(result.awayTeam, newAwayRating);
    latestRatings.set(result.homeTeam, newHomeRating);
}

window.onload = (event) => {
    loadDictionary();
    LoadResults();
    renderCurrentRankingsTable();
    renderAllWeeksTable();
    renderRatingsChart();
}

// Renders the current weekly rankings table (latest week, sorted)
function renderCurrentRankingsTable() {
    const table = document.getElementById('currentRankingsTable').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    if (!allRatings.length) return;
    const latestWeekRatings = allRatings[allRatings.length - 1].slice();
    latestWeekRatings.sort((a, b) => b.rating - a.rating);
    latestWeekRatings.forEach((r, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${idx + 1}</td><td>${r.team}</td><td>${r.rating}</td>`;
        table.appendChild(row);
    });
}

// Renders the all weeks table (each column is a team, each row is a week)
function renderAllWeeksTable() {
    const table = document.getElementById('allWeeksTable');
    const thead = table.getElementsByTagName('thead')[0];
    const tbody = table.getElementsByTagName('tbody')[0];
    thead.innerHTML = '';
    tbody.innerHTML = '';
    if (!allRatings.length) return;
    // Header row: one column per week
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = allRatings.map(weekArr => `<th>Week ${weekArr[0].week}</th>`).join('');
    thead.appendChild(headerRow);
    // For each rank (row), fill in team name and Elo for that rank in each week
    const numTeams = allRatings[0].length;
    for (let rank = 0; rank < numTeams; rank++) {
        const row = document.createElement('tr');
        row.innerHTML = allRatings.map(weekArr => {
            // Sort teams by Elo for this week
            const sorted = weekArr.slice().sort((a, b) => b.rating - a.rating);
            const r = sorted[rank];
            return `<td>${r.team} (${r.rating})</td>`;
        }).join('');
        tbody.appendChild(row);
    }
}