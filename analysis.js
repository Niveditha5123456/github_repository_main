// Load repository details when analysis page opens

window.onload = function () {

    const repo = JSON.parse(localStorage.getItem("repoData"));

    if (!repo) {
        alert("No repository selected.");
        window.location.href = "dashboard.html";
        return;
    }

    document.getElementById("repoName").innerText = repo.name;
    document.getElementById("owner").innerText = repo.owner.login;
    document.getElementById("language").innerText = repo.allLanguages || repo.language || "Not specified";
    document.getElementById("stars").innerText = repo.stargazers_count;
    document.getElementById("forks").innerText = repo.forks_count;
};

// Generate intelligent analysis based on repository data
function generateIntelligentAnalysis(repo) {
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const issues = repo.open_issues_count || 0;
    const hasLicense = !!repo.license;
    const languages = repo.allLanguages || repo.language || "Not specified";
    const topics = repo.topics || [];
    const isForked = repo.fork || false;

    // Calculate health score based on multiple factors
    let score = 50;

    if (stars > 10000) score += 15;
    else if (stars > 1000) score += 12;
    else if (stars > 100) score += 8;
    else if (stars > 10) score += 4;

    if (forks > 100) score += 10;
    else if (forks > 20) score += 7;
    else if (forks > 5) score += 4;

    if (hasLicense) score += 15;

    if (issues < 20) score += 10;
    else if (issues < 50) score += 7;
    else if (issues < 100) score += 4;
    else if (issues > 200) score -= 5;

    if (repo.description && repo.description.length > 50) score += 3;
    if (topics && topics.length > 0) score += 2;
    if (!isForked) score += 5;

    score = Math.max(0, Math.min(100, score));

    let status = "Good";
    if (score >= 80) status = "Excellent";
    else if (score >= 60) status = "Good";
    else if (score >= 40) status = "Average";
    else status = "Needs Improvement";

    const analysis = `README_ANALYSIS: ${repo.description || 'No description available'}. The repository ${repo.has_wiki ? 'includes wiki documentation' : 'should include comprehensive documentation'}. Add setup instructions, usage examples, and API documentation for better clarity. Consider adding badges for build status and code coverage.

PROJECT_STRUCTURE: The project is built with ${languages}. ${stars > 100 ? 'It has proven its utility with strong community adoption.' : 'As a smaller project, consider establishing clear architectural patterns.'} Structure appears ${forks > 20 ? 'well-organized with active community interest' : 'organized with clear purpose'}. Document your folder structure and provide guidelines for contributors.

MISSING_FILES: Recommended additions for project maturity:
- Comprehensive README.md with examples
- ${!hasLicense ? 'LICENSE file - consider using MIT, Apache 2.0, or GPL' : 'License file present - good!'}
- CONTRIBUTING.md for contributor guidelines
- CODE_OF_CONDUCT.md for community standards
- CHANGELOG.md or HISTORY.md for version tracking
- .editorconfig for consistent code style
- Security policy (SECURITY.md)

SECURITY: Essential security practices:
- Keep dependencies updated regularly using dependabot
- Implement automated security scanning (GitHub Security tab)
- Use npm audit or similar vulnerability checkers
- Add security.txt file for vulnerability reporting
- Review third-party dependencies quarterly
- Implement rate limiting if API endpoints exist
- Use environment variables for sensitive data
- Enable branch protection rules on main branch

CODE_QUALITY: Recommended improvements:
- Set up automated testing (Jest, pytest, or similar)
- Implement linting (ESLint, Pylint, etc.)
- Use code formatting tools (Prettier, Black, etc.)
- Achieve 80%+ test coverage
- Set up CI/CD pipeline (GitHub Actions recommended)
- Perform regular code reviews before merging
- Use pre-commit hooks for code quality checks
- Document complex algorithms and business logic

AI_SUGGESTIONS:
1. ${issues < 20 ? 'Maintain current issue management practices' : 'Reduce open issue count by prioritizing and closing resolved issues'} - helps maintainability
2. ${stars > 100 ? 'Consider creating detailed tutorials' : 'Focus on documentation and examples for better adoption'} for better user experience
3. Implement automated testing pipeline - increases reliability and attracts contributors
4. Add more comprehensive documentation and API reference
5. Set up automated security scanning and dependency updates

HEALTH_SCORE: ${score}
REPO_STATUS: ${status}`;

    return analysis;
}

// Run AI Analysis
async function runAIAnalysis() {
    const repo = JSON.parse(localStorage.getItem("repoData"));

    if (!repo) {
        alert("No repository data found.");
        return;
    }

    const loadingBox = document.querySelector(".loading-box");
    if (loadingBox) {
        loadingBox.style.display = "flex";
    }

    try {
        console.log("Starting analysis for:", repo.name);

        let analysisText = null;

        try {
            const response = await Promise.race([
                fetch("http://localhost:3000/api/analyze", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        prompt: `Analyze this GitHub repository: ${repo.name}. ${repo.description}`,
                        repoData: repo
                    })
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Server timeout')), 5000)
                )
            ]);

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.analysis) {
                    analysisText = result.analysis;
                    console.log('Using server analysis');
                }
            }
        } catch (serverError) {
            console.warn('Server not available, using intelligent analysis:', serverError.message);
        }

        if (!analysisText) {
            console.log('Using client-side intelligent analysis');
            analysisText = generateIntelligentAnalysis(repo);
        }

        parseAndDisplayAnalysis(analysisText, repo);

        if (loadingBox) {
            loadingBox.style.display = "none";
        }

    } catch (error) {
        console.error('Analysis Error:', error);
        if (loadingBox) {
            loadingBox.style.display = "none";
        }
        alert("Error during analysis:\n" + error.message);
    }
}

// Parse and display the analysis
function parseAndDisplayAnalysis(analysisText, repo) {
    const analysis = {
        readme: "",
        structure: "",
        missing: "",
        security: "",
        quality: "",
        suggestions: [],
        score: 75,
        status: "Good"
    };

    const readmeMatch = analysisText.match(/README_ANALYSIS:\s*([^\n]*(?:\n(?!(?:PROJECT_STRUCTURE|MISSING_FILES|SECURITY|CODE_QUALITY|AI_SUGGESTIONS|HEALTH_SCORE|REPO_STATUS):)[^\n]*)*)/i);
    const structureMatch = analysisText.match(/PROJECT_STRUCTURE:\s*([^\n]*(?:\n(?!(?:README_ANALYSIS|MISSING_FILES|SECURITY|CODE_QUALITY|AI_SUGGESTIONS|HEALTH_SCORE|REPO_STATUS):)[^\n]*)*)/i);
    const missingMatch = analysisText.match(/MISSING_FILES:\s*([^\n]*(?:\n(?!(?:README_ANALYSIS|PROJECT_STRUCTURE|SECURITY|CODE_QUALITY|AI_SUGGESTIONS|HEALTH_SCORE|REPO_STATUS):)[^\n]*)*)/i);
    const securityMatch = analysisText.match(/SECURITY:\s*([^\n]*(?:\n(?!(?:README_ANALYSIS|PROJECT_STRUCTURE|MISSING_FILES|CODE_QUALITY|AI_SUGGESTIONS|HEALTH_SCORE|REPO_STATUS):)[^\n]*)*)/i);
    const qualityMatch = analysisText.match(/CODE_QUALITY:\s*([^\n]*(?:\n(?!(?:README_ANALYSIS|PROJECT_STRUCTURE|MISSING_FILES|SECURITY|AI_SUGGESTIONS|HEALTH_SCORE|REPO_STATUS):)[^\n]*)*)/i);
    const suggestionsMatch = analysisText.match(/AI_SUGGESTIONS:\s*([^\n]*(?:\n(?!(?:README_ANALYSIS|PROJECT_STRUCTURE|MISSING_FILES|SECURITY|CODE_QUALITY|HEALTH_SCORE|REPO_STATUS):)[^\n]*)*)/i);
    const scoreMatch = analysisText.match(/HEALTH_SCORE:\s*(\d+)/i);
    const statusMatch = analysisText.match(/REPO_STATUS:\s*([^\n]+)/i);

    if (readmeMatch) analysis.readme = readmeMatch[1].trim();
    if (structureMatch) analysis.structure = structureMatch[1].trim();
    if (missingMatch) analysis.missing = missingMatch[1].trim();
    if (securityMatch) analysis.security = securityMatch[1].trim();
    if (qualityMatch) analysis.quality = qualityMatch[1].trim();
    if (suggestionsMatch) {
        const suggestionsText = suggestionsMatch[1].trim();
        analysis.suggestions = suggestionsText.split('\n').filter(s => s.trim().length > 0);
    }
    if (scoreMatch) analysis.score = parseInt(scoreMatch[1]) || 75;
    if (statusMatch) analysis.status = statusMatch[1].trim();

    document.getElementById("readmeAnalysis").innerText = analysis.readme || "README analysis not available.";
    document.getElementById("projectStructure").innerText = analysis.structure || "Project structure analysis not available.";
    document.getElementById("missingFiles").innerText = analysis.missing || "No missing files identified.";
    document.getElementById("security").innerText = analysis.security || "Security analysis not available.";
    document.getElementById("codeQuality").innerText = analysis.quality || "Code quality analysis not available.";

    const score = analysis.score || 75;
    const healthScoreElement = document.getElementById("healthScore");
    healthScoreElement.innerText = score + "%";

    if (score >= 80) {
        healthScoreElement.style.color = "#4CAF50";
    } else if (score >= 60) {
        healthScoreElement.style.color = "#FFC107";
    } else {
        healthScoreElement.style.color = "#F44336";
    }

    const status = analysis.status || "Good";
    const statusElement = document.getElementById("repoStatus");
    statusElement.innerText = status;

    const statusLower = status.toLowerCase();
    statusElement.className = "";
    if (statusLower.includes("excellent")) {
        statusElement.className = "excellent";
    } else if (statusLower.includes("good")) {
        statusElement.className = "good";
    } else if (statusLower.includes("average")) {
        statusElement.className = "average";
    } else if (statusLower.includes("needs improvement")) {
        statusElement.className = "needs-improvement";
    }

    const suggestionsList = document.getElementById("aiSuggestions");
    suggestionsList.innerHTML = "";
    if (analysis.suggestions.length > 0) {
        analysis.suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.innerText = suggestion.trim();
            suggestionsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.innerText = "No suggestions available.";
        suggestionsList.appendChild(li);
    }

    const reportData = {
        repoName: repo.name,
        owner: repo.owner.login,
        language: repo.allLanguages || repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        issues: repo.open_issues_count,
        license: repo.license ? repo.license.name : "No License",

        score: analysis.score,
        status: analysis.status,
        readme: analysis.readme,
        missing: analysis.missing,
        security: analysis.security,
        suggestions: analysis.suggestions
    };

    localStorage.setItem("reportData", JSON.stringify(reportData));

    let history = JSON.parse(localStorage.getItem("history")) || [];

    reportData.date = new Date().toLocaleDateString();

    history.unshift(reportData);

    localStorage.setItem("history", JSON.stringify(history));

    // Enable the "View Full Report" button now that reportData exists
    const viewReportBtn = document.getElementById("viewReportBtn");
    if (viewReportBtn) {
        viewReportBtn.disabled = false;
        viewReportBtn.style.opacity = "1";
        viewReportBtn.style.cursor = "pointer";
    }
}

window.runAIAnalysis = runAIAnalysis;

window.addEventListener('DOMContentLoaded', function() {
    const loadingBox = document.querySelector(".loading-box");
    if (loadingBox) {
        loadingBox.style.display = "none";
    }
});