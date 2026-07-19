const report = JSON.parse(localStorage.getItem("reportData"));

if (!report) {
    alert("No report found.");
    window.location.href = "analysis.html";
} else {

    document.getElementById("repoName").innerText = report.repoName;
    document.getElementById("owner").innerText = report.owner;
    document.getElementById("language").innerText = report.language;
    document.getElementById("stars").innerText = report.stars;
    document.getElementById("forks").innerText = report.forks;
    document.getElementById("license").innerText = report.license;

    document.getElementById("score").innerText = report.score + "%";
    document.getElementById("status").innerText = report.status;

    document.getElementById("readme").innerText = report.readme;
    document.getElementById("security").innerText = report.security;

    // Missing files
    const missingList = document.getElementById("missing");
    missingList.innerHTML = "";
    (report.missing || "").split("\n").forEach(item => {
        if (item.trim()) {
            const li = document.createElement("li");
            li.innerText = item;
            missingList.appendChild(li);
        }
    });

    // Suggestions
    const suggestionList = document.getElementById("suggestions");
    suggestionList.innerHTML = "";
    (report.suggestions || []).forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        suggestionList.appendChild(li);
    });

    new Chart(document.getElementById("issueChart"), {
        type: "bar",
        data: {
            labels: ["Open Issues", "Forks", "Stars", "License"],
            datasets: [{
                label: "Repository Data",
                data: [
                    report.issues,
                    report.forks,
                    report.stars,
                    report.license === "No License" ? 0 : 1
                ],
                backgroundColor: "#F7B731"
            }]
        }
    });

    new Chart(document.getElementById("qualityChart"), {
        type: "doughnut",
        data: {
            labels: ["Structure", "README", "Testing", "Security"],
            datasets: [{
                data: [
                    report.score,
                    Math.max(report.score - 5, 0),
                    Math.max(report.score - 15, 0),
                    Math.max(report.score - 2, 0)
                ],
                backgroundColor: [
                    "#F7B731",
                    "#FFD166",
                    "#E67E22",
                    "#C98C00"
                ]
            }]
        }
    });
}

function downloadReport() {
    const element = document.getElementById("report");

    const options = {
        margin: 0.5,
        filename: "RepoAI_Report.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait"
        }
    };

    html2pdf().set(options).from(element).save();
}

document.getElementById("shareBtn").addEventListener("click", async () => {
    const report = JSON.parse(localStorage.getItem("reportData"));

    if (!report) {
        alert("No report found!");
        return;
    }

    const shareText = `
GitHub Repository Analysis Report

Repository: ${report.repoName}
Owner: ${report.owner}
Stars: ${report.stars}
Forks: ${report.forks}
Issues: ${report.issues}
License: ${report.license}

Generated using RepoAI.
`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: "GitHub Repository Report",
                text: shareText
            });
        } catch (err) {
            console.log("Share cancelled");
        }
    } else {
        navigator.clipboard.writeText(shareText);
        alert("Report copied to clipboard!");
    }
});