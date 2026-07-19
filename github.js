// Function to fetch GitHub repository details

async function fetchRepository() {

    const repoUrl = document.getElementById("repoUrl").value.trim();

    if (repoUrl === "") {
        alert("Please enter a GitHub repository URL.");
        return;
    }

    // Example:
    // https://github.com/openai/openai-cookbook

    const parts = repoUrl.split("/");

    const owner = parts[3];
    const repo = parts[4];

    if (!owner || !repo) {
        alert("Invalid GitHub URL.");
        return;
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    try {

        const response = await fetch(apiUrl);

        if (!response.ok) {
            alert("Repository not found!");
            return;
        }

        const data = await response.json();
        
        const langResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/languages`
   );

const langData = await langResponse.json();

const allLanguages = Object.keys(langData).join(", ");
        
        // Store language data with repo data
        data.allLanguages = allLanguages;
        localStorage.setItem("repoData", JSON.stringify(data));

        document.getElementById("repoName").innerText = data.name;
        document.getElementById("owner").innerText = data.owner.login;
        document.getElementById("description").innerText = data.description;
        document.getElementById("language").innerText = allLanguages || data.language || "Not specified";
        document.getElementById("stars").innerText = data.stargazers_count;
        document.getElementById("forks").innerText = data.forks_count;
        document.getElementById("issues").innerText = data.open_issues_count;
        document.getElementById("license").innerText =
            data.license ? data.license.name : "No License";

        const recommendations = [];

        if (!data.description) {
            recommendations.push("✔ Add a repository description.");
        }

        if (!data.license) {
            recommendations.push("✔ Add an open-source license.");
        }

        if (data.open_issues_count > 10) {
            recommendations.push("✔ Resolve open issues.");
        }

        if (data.stargazers_count < 5) {
            recommendations.push("✔ Improve visibility to gain more stars.");
        }

        recommendations.push("✔ Improve README with installation steps.");

        const aiList = document.getElementById("aiRecommendations");
        aiList.innerHTML = "";

        recommendations.forEach(item => {
            aiList.innerHTML += `<li>${item}</li>`;
        });
        let score = 100;

        if (!data.description) score -= 10;
        if (!data.license) score -= 10;
        if (data.open_issues_count > 10) score -= 10;

        let status = "Excellent";

        if (score < 90) status = "Good";
        if (score < 70) status = "Average";

    document.getElementById("recentTable").innerHTML = `
    <tr>
        <td>${data.name}</td>
        <td>${score}%</td>
        <td>${status}</td>
    </tr>
    `;
    
    // Navigate to analysis page
    setTimeout(() => {
        window.location.href = "analysis.html";
    }, 500);
    }

    catch (error) {
        console.log(error);
        alert("Error fetching repository.");
    }

}

window.fetchRepository = fetchRepository;

// Function to navigate to analysis page
function goToAnalysis() {
    const repoData = localStorage.getItem("repoData");
    
    if (!repoData) {
        alert("Please analyze a repository first by entering a GitHub URL.");
        return;
    }
    
    window.location.href = "analysis.html";
}

window.goToAnalysis = goToAnalysis;