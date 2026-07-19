const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Mock AI Analysis - Generates intelligent analysis based on repo data
function generateMockAnalysis(repoData) {
    const stars = repoData.stargazers_count || 0;
    const forks = repoData.forks_count || 0;
    const issues = repoData.open_issues_count || 0;
    const hasLicense = !!repoData.license;
    const isActive = new Date() - new Date(repoData.updated_at) < 30 * 24 * 60 * 60 * 1000;
    
    // Calculate health score
    let score = 50;
    if (stars > 1000) score += 15;
    else if (stars > 100) score += 10;
    else if (stars > 10) score += 5;
    
    if (forks > 100) score += 10;
    else if (forks > 10) score += 5;
    
    if (hasLicense) score += 15;
    if (isActive) score += 10;
    if (issues < 50) score += 5;
    else if (issues > 200) score -= 10;
    
    score = Math.max(0, Math.min(100, score));
    
    // Determine status
    let status = "Good";
    if (score >= 80) status = "Excellent";
    else if (score >= 60) status = "Good";
    else if (score >= 40) status = "Average";
    else status = "Needs Improvement";
    
    const analysis = `README_ANALYSIS: The repository appears to be ${repoData.description || 'a project'}. ${stars > 100 ? 'It has gained significant community interest' : 'It is a newer or niche project'} with good documentation structure. Consider adding comprehensive setup instructions and contribution guidelines.

PROJECT_STRUCTURE: The project structure is ${isActive ? 'actively maintained' : 'not recently updated'}. Ensure clear separation of concerns with organized directories for source code, tests, and documentation.

MISSING_FILES: Common files that could improve the project:
- .gitignore (if not present)
- Contributing guidelines (CONTRIBUTING.md)
- Code of Conduct (CODE_OF_CONDUCT.md)
- ${!hasLicense ? 'License file (LICENSE)' : ''}
- Changelog (CHANGELOG.md)

SECURITY: Review dependencies for vulnerabilities, use security scanning tools. Implement authentication and authorization if handling user data. Keep dependencies updated regularly. Consider adding security policy documentation.

CODE_QUALITY: Implement automated testing with CI/CD pipelines. Use code linting and formatting tools (ESLint, Prettier for JS). Maintain consistent code style. Add pre-commit hooks for code quality checks.

AI_SUGGESTIONS: 
1. Add automated testing and CI/CD pipeline integration
2. Implement comprehensive documentation with examples
3. Set up security scanning and dependency updates
4. Create clear issue templates and pull request guidelines
5. Add badges for build status, coverage, and version info

HEALTH_SCORE: ${score}
REPO_STATUS: ${status}`;
    
    return analysis;
}

// API endpoint for AI analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { prompt, repoData } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        console.log('Analyzing repository...');
        
        // Try OpenRouter first, with fallback to mock analysis
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                timeout: 10000,
                headers: {
                    'Authorization': '',
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'GitHub Analyzer'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-r1-0528:free',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.choices && data.choices[0] && data.choices[0].message) {
                const analysisText = data.choices[0].message.content;
                console.log('✓ OpenRouter API successful');
                return res.json({ success: true, analysis: analysisText, source: 'openrouter' });
            }
        } catch (apiError) {
            console.warn('⚠ OpenRouter API failed, using fallback analysis:', apiError.message);
        }
        
        // Fallback: Generate intelligent mock analysis
        if (repoData) {
            const analysis = generateMockAnalysis(repoData);
            console.log('✓ Using fallback intelligent analysis');
            return res.json({ success: true, analysis, source: 'fallback', warning: 'Using intelligent fallback analysis' });
        }
        
        // Generic fallback if no repo data
        const genericAnalysis = `README_ANALYSIS: Repository documentation appears standard. Consider adding more examples and setup instructions.
PROJECT_STRUCTURE: Code organization looks appropriate. Ensure consistent patterns throughout.
MISSING_FILES: Consider adding CONTRIBUTING.md, CODE_OF_CONDUCT.md, and comprehensive documentation.
SECURITY: Regular security audits recommended. Keep dependencies updated.
CODE_QUALITY: Implement automated testing and linting tools for consistent code quality.
AI_SUGGESTIONS:
1. Add comprehensive documentation
2. Implement automated testing
3. Set up CI/CD pipelines
4. Add security scanning
5. Create contribution guidelines
HEALTH_SCORE: 65
REPO_STATUS: Good`;

        res.json({ success: true, analysis: genericAnalysis, source: 'generic', warning: 'Using generic fallback analysis' });
        
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            error: 'Server error during analysis',
            message: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`GitHub Analyzer server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/dashboard.html in your browser`);
    console.log(`\nServer features:`);
    console.log(`  - Primary: OpenRouter AI API`);
    console.log(`  - Fallback: Intelligent mock analysis based on repo data`);
});
