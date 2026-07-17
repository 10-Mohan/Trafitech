const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ANALYTICS_DIR = path.join(__dirname, '..', 'analytics', 'data');
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, 'analytics_results.json');
const BENCHMARK_FILE = path.join(ANALYTICS_DIR, 'benchmark_results.json');

// Helper to run python script as a promise
const runPythonPipeline = (args = '') => {
    return new Promise((resolve, reject) => {
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const scriptPath = path.join(__dirname, '..', 'analytics', 'pipeline.py');
        const cmd = `${pythonCmd} "${scriptPath}" ${args}`;
        
        console.log(`Executing pipeline: ${cmd}`);
        exec(cmd, { cwd: path.join(__dirname, '..', '..') }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Pipeline execution error: ${error.message}`);
                console.error(`Pipeline stderr: ${stderr}`);
                return reject(error);
            }
            resolve(stdout);
        });
    });
};

// GET /api/rapids-analytics/data
router.get('/data', (req, res) => {
    try {
        if (!fs.existsSync(ANALYTICS_FILE) || !fs.existsSync(BENCHMARK_FILE)) {
            return res.status(404).json({ message: 'Analytics data files not generated yet. Trigger a run first.' });
        }
        
        const analyticsData = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
        const benchmarkData = JSON.parse(fs.readFileSync(BENCHMARK_FILE, 'utf8'));
        
        res.json({
            analytics: analyticsData,
            benchmarks: benchmarkData
        });
    } catch (error) {
        console.error('Error fetching analytics cache:', error);
        res.status(500).json({ message: 'Internal server error reading analytics cache' });
    }
});

// POST /api/rapids-analytics/run-benchmark
router.post('/run-benchmark', async (req, res) => {
    try {
        console.log('Starting live CPU vs GPU benchmark regeneration...');
        await runPythonPipeline('--generate --size 100000');
        
        // Read new files
        const analyticsData = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
        const benchmarkData = JSON.parse(fs.readFileSync(BENCHMARK_FILE, 'utf8'));
        
        res.json({
            message: 'Benchmark pipeline ran successfully',
            analytics: analyticsData,
            benchmarks: benchmarkData
        });
    } catch (error) {
        console.error('Error running benchmark:', error);
        res.status(500).json({ message: 'Failed to run python benchmark script' });
    }
});

// POST /api/rapids-analytics/query
router.post('/query', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ message: 'Query string is required' });
    }
    
    try {
        // Run python with query argument
        // Clean query to avoid injection
        const cleanQuery = query.replace(/"/g, '\\"');
        const output = await runPythonPipeline(`--query "${cleanQuery}"`);
        
        // Find JSON block in stdout
        const jsonStart = output.indexOf('[');
        const jsonEnd = output.lastIndexOf(']') + 1;
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const results = JSON.parse(output.substring(jsonStart, jsonEnd));
            res.json({ results });
        } else {
            res.status(500).json({ message: 'Failed to parse SQL query outputs from pipeline', rawOutput: output });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ message: 'Error executing query on traffic telemetry' });
    }
});

// POST /api/rapids-analytics/gemini
router.post('/gemini', async (req, res) => {
    const { prompt, dataContext } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.warn('⚠️ GEMINI_API_KEY environment variable is not defined. Using high-fidelity mock AI Traffic Advisor fallback.');
        
        // Construct a highly detailed simulated response based on the actual data context
        let corridorsText = '';
        if (dataContext && dataContext.corridors) {
            corridorsText = dataContext.corridors.map(c => 
                `- **${c.name}**: Avg Speed = ${c.avgSpeed} mph, Avg Vol = ${c.avgVolume} veh/min, Congestion Risk = ${c.congestionRisk}%, Recommended Tuning Offset = +${c.recommendedTuning}s.`
            ).join('\n');
        }
        
        let bottlenecksText = '';
        if (dataContext && dataContext.bottlenecks) {
            bottlenecksText = dataContext.bottlenecks.map(b => 
                `- **${b.intersectionId}** (${b.corridor}): Avg Speed = ${b.avgSpeed} mph, Risk = ${b.congestionRisk}%, recommended light offset = +${b.recommendedTuning}s.`
            ).join('\n');
        }
        
        const mockResponse = `### 🚦 Gemini Enterprise Traffic Intelligence Report (Simulation Mode)

Thank you for consulting the Gemini Enterprise Traffic Agent. I have analyzed the active telemetry dataset containing **100,000 traffic logs** processed via **NVIDIA RAPIDS (cuDF)**. 

Below is a detailed analysis of the active corridors and intersections:

#### 1. Corridor Telemetry Analysis
${corridorsText || '- No active corridor data found.'}

#### 2. Key Congestion Bottlenecks Identified
${bottlenecksText || '- No severe bottleneck intersections detected.'}

#### 3. AI Diagnostics & Recommendations
- **Corridor B (Westside Arterial):** Exhibits the highest gridlock risk. Average speed has dropped significantly. The primary causes are high vehicle density and weather variables. I recommend extending the green light phase duration by **at least 18-20 seconds** during the next 4 signal cycles to clear the backlog.
- **Corridor A (Downtown Express):** Moderate congestion detected. An incremental adjustment of **+8 seconds** of green phase time will optimize the throughput.
- **Environmental & Carbon Impact:** By implementing these signal overrides, wait times will drop by approximately **18%**, reducing idle-state carbon emissions by an estimated **150 kg of CO2 per hour** across the major junctions.
- **Action Plan:** The Adaptive Signal Control autopilot is authorized to deploy the green-phase adjustments immediately. 

*Note: This report was compiled using local analytics. Configure your GEMINI_API_KEY in the backend .env to connect to live Gemini Enterprise Agent endpoints.*`;
        
        // Add a slight artificial delay to feel like a real network AI response
        await new Promise(r => setTimeout(r, 1200));
        return res.json({ response: mockResponse });
    }
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const systemInstruction = "You are TraffiTech's Gemini Enterprise Traffic Advisor. You analyze urban traffic telemetry data (corridors, bottlenecks, speeds, risks, signal tuning) and provide detailed, structured diagnostic reports and actionable signal-timing adjustment recommendations for city traffic engineers. Format your response in clean, professional markdown.";
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemInstruction}\n\nUser Question/Prompt: ${prompt}\n\nHere is the active traffic telemetry data context:\n${JSON.stringify(dataContext, null, 2)}`
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Gemini API returned status ${response.status}: ${errBody}`);
        }
        
        const data = await response.json();
        const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from Gemini API.';
        res.json({ response: geminiText });
        
    } catch (error) {
        console.error('Error invoking Gemini API:', error);
        res.status(500).json({ message: 'Error processing AI insights with Gemini API', details: error.message });
    }
});

module.exports = router;
