// history.js

const history = JSON.parse(localStorage.getItem("history")) || [];

// Summary cards
document.getElementById("totalRepos").innerText = history.length;

let totalScore = 0;
let highestScore = 0;

history.forEach(report => {
    totalScore += report.score || 0;

    if ((report.score || 0) > highestScore) {
        highestScore = report.score;
    }
});

document.getElementById("averageScore").innerText =
    history.length > 0
        ? Math.round(totalScore / history.length) + "%"
        : "0%";

document.getElementById("highestScore").innerText =
    highestScore + "%";

// Render the history table
function renderHistoryTable(list) {
    // FIX: was document.getElementById("historyTable"), which does not exist.
    // Rows must be appended to the <tbody>, not the <table> itself.
    const tableBody = document.getElementById("historyTableBody");
    tableBody.innerHTML = "";

    if (list.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">No analysis history found.</td>
            </tr>
        `;
        return;
    }

    list.slice(0, 4).forEach(report => {

        let statusClass = "";

        if (report.status === "Excellent")
            statusClass = "excellent";
        else if (report.status === "Good")
            statusClass = "good";
        else if (report.status === "Average")
            statusClass = "average";
        else
            statusClass = "poor";

        tableBody.innerHTML += `
            <tr>
                <td>${report.repoName || "Unknown"}</td>
                <td>${report.score || 0}%</td>
                <td>${report.date || "-"}</td>
                <td>
                    <span class="${statusClass}">
                        ${report.status || "Unknown"}
                    </span>
                </td>
                <td>
                    <button class="view-btn" data-repo="${report.repoName}">View Report</button>
                </td>
            </tr>
        `;
    });
}

renderHistoryTable(history);

// Simple search-by-repository-name filter
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

function runSearch() {
    const term = (searchInput.value || "").trim().toLowerCase();
    if (!term) {
        renderHistoryTable(history);
        return;
    }
    const filtered = history.filter(report =>
        (report.repoName || "").toLowerCase().includes(term)
    );
    renderHistoryTable(filtered);
}

if (searchBtn) {
    searchBtn.addEventListener("click", runSearch);
}

if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") runSearch();
    });
}

// Open the stored report for a given repo when "View Report" is clicked
document.getElementById("historyTableBody").addEventListener("click", (e) => {
    if (e.target.classList.contains("view-btn")) {
        const repoName = e.target.getAttribute("data-repo");
        const match = history.find(r => r.repoName === repoName);
        if (match) {
            localStorage.setItem("reportData", JSON.stringify(match));
            window.location.href = "report.html";
        }
    }
});