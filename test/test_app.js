const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Vulnerable endpoint - demonstrates prototype pollution
app.post('/vulnerable', (req, res) => {
    try {
        // Unsafe merge function vulnerable to prototype pollution
        const merge = (target, source) => {
            for (const key in source) {
                if (typeof target[key] === 'object' && typeof source[key] === 'object') {
                    merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        };

        const userInput = req.body;
        const config = {
            isAdmin: false,
            userPreferences: {}
        };

        // Vulnerable merge operation
        merge(config, userInput);

        res.json({
            status: 'success',
            config: config,
            prototypeCheck: {}.polluted // Check if prototype was polluted
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fixed endpoint - demonstrates mitigation
app.post('/fixed', (req, res) => {
    try {
        // Safe merge function with prototype pollution protection
        const safeMerge = (target, source) => {
            for (const key in source) {
                // Skip prototype properties
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                    continue;
                }

                if (typeof target[key] === 'object' && typeof source[key] === 'object') {
                    safeMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        };

        const userInput = req.body;
        const config = {
            isAdmin: false,
            userPreferences: {}
        };

        // Safe merge operation
        safeMerge(config, userInput);

        res.json({
            status: 'success',
            config: config,
            prototypeCheck: {}.polluted // Check if prototype was polluted
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Simple GET endpoint to check prototype status
app.get('/check', (req, res) => {
    res.json({
        prototypePolluted: {}.polluted || false,
        toStringModified: {}.toString === 'polluted'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Vulnerable test app running on http://localhost:${PORT}`);
    console.log(`Endpoints:
    - POST /vulnerable   - Prototype pollution vulnerable endpoint
    - POST /fixed       - Protected endpoint
    - GET  /check       - Check prototype pollution status`);
});

module.exports = app;
