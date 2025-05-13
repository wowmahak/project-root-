#  Server-Side Prototype Pollution Scanner

![Security Scanner](https://img.shields.io/badge/security-scanner-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-14%2B-green)
![Python](https://img.shields.io/badge/Python-3.6%2B-blue)
![Bash](https://img.shields.io/badge/Bash-5%2B-yellow)

##  Features
- **Multi-interface support**: JavaScript, Python, and Bash implementations
- **Comprehensive testing**: 25+ test cases included
- **CI/CD ready**: Pre-configured GitHub Actions workflow

##  Quick Start

### Installation
```bash
git clone https://github.com/your/prototype-pollution-scanner.git
cd prototype-pollution-scanner
npm install  # For JavaScript version
```

###  Usage

#### Bash Script
```bash
# Basic scan
./scan.sh -u https://api.example.com

# Full options
./scan.sh \
  -u https://api.example.com/api \
  -m POST \
  -H "Content-Type: application/json" \
  -o scan_results.json
```

#### JavaScript
```javascript
const { scan } = require('./scanner');

async function runScan() {
  const results = await scan('https://api.example.com', {
    methods: ['GET', 'POST'],
    verbose: true
  });
  console.log(results);
}
runScan();
```

#### Python
```bash
python scanner.py --url https://api.example.com --timeout 5000
```

###  Output Format
Example JSON output:
```json
{
  "target": "https://api.example.com",
  "vulnerable": true,
  "payloads": [
    {
      "vector": "__proto__",
      "status": "success"
    }
  ]
}
```

##  Project Structure
```
.
├── bin/            # Bash scripts
│   ├── scan.sh     # Main scanner
│   └── utils.sh    # Helper functions
├── src/            # Core implementations
│   ├── scanner.js
│   └── scanner.py
└── test/           # Test cases
    ├── bash/
    └── unit/
```

##  Development
```bash
# Run all tests
npm test

# Lint code
npm run lint

# Build package
npm run build
```



---

 **Note**: All test payloads are non-destructive by default.  
🐛 **Report issues**: [https://github.com/wowmahak/repo/issues](https://github.com/wowmahak/repo/issues)  
 **Last updated**: 2025-05-13

