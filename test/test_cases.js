const { PrototypePollutionScanner } = require('../src/scanner');
const assert = require('assert');
const axios = require('axios');
const testApp = require('./test_app');

describe('Prototype Pollution Scanner Test Suite', function() {
    this.timeout(5000); // Set test timeout

    let server;
    const baseUrl = 'http://localhost:3000';

    // Start test server before all tests
    before(async () => {
        server = await testApp.listen(3000);
        console.log('Test server started on port 3000');
    });

    // Close test server after all tests
    after(async () => {
        await server.close();
        console.log('Test server closed');
    });

    // Reset prototype pollution before each test
    beforeEach(async () => {
        await axios.post(`${baseUrl}/reset`);
    });

    describe('Basic Vulnerability Detection', () => {
        it('should detect standard __proto__ pollution', async () => {
            const scanner = new PrototypePollutionScanner(
                `${baseUrl}/vulnerable`,
                { method: 'POST', verbose: true }
            );
            const result = await scanner.scan();
            assert.strictEqual(result, true, 'Should detect __proto__ pollution');
        });

        it('should detect constructor.prototype pollution', async () => {
            const response = await axios.post(`${baseUrl}/vulnerable`, {
                constructor: { prototype: { polluted: true } }
            });
            assert.strictEqual(response.data.prototypeCheck, true);
        });
    });

    describe('Scanner Functionality', () => {
        it('should return false for non-vulnerable endpoints', async () => {
            const scanner = new PrototypePollutionScanner(
                `${baseUrl}/fixed`,
                { method: 'POST' }
            );
            const result = await scanner.scan();
            assert.strictEqual(result, false);
        });

        it('should detect pollution via different HTTP methods', async () => {
            const methods = ['POST', 'PUT', 'PATCH'];
            for (const method of methods) {
                const scanner = new PrototypePollutionScanner(
                    `${baseUrl}/vulnerable`,
                    { method, verbose: false }
                );
                const result = await scanner.scan();
                assert.strictEqual(result, true, `Failed for ${method}`);
            }
        });

        it('should verify pollution through prototype chain', async () => {
            // First pollute the prototype
            await axios.post(`${baseUrl}/vulnerable`, {
                __proto__: { admin: true }
            });

            // Verify through GET check endpoint
            const check = await axios.get(`${baseUrl}/check`);
            assert.strictEqual(check.data.prototypePolluted, true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle malformed JSON responses', async () => {
            const scanner = new PrototypePollutionScanner(
                `${baseUrl}/malformed`,
                { method: 'POST' }
            );
            try {
                await scanner.scan();
                assert.fail('Should have thrown error');
            } catch (err) {
                assert.match(err.message, /JSON/);
            }
        });

        it('should timeout on unresponsive endpoints', async () => {
            const scanner = new PrototypePollutionScanner(
                `${baseUrl}/timeout`,
                { method: 'POST', timeout: 100 }
            );
            try {
                await scanner.scan();
                assert.fail('Should have timed out');
            } catch (err) {
                assert.match(err.message, /timeout/);
            }
        });
    });

    describe('Payload Variations', () => {
        const payloads = [
            { __proto__: { isAdmin: true } },
            { constructor: { prototype: { toString: 'hacked' } } },
            { prototype: { polluted: true } },
            { ['__pro' + 'to__']: { xss: true } } // Obfuscated
        ];

        payloads.forEach((payload, i) => {
            it(`should detect payload variation #${i + 1}`, async () => {
                const scanner = new PrototypePollutionScanner(
                    `${baseUrl}/vulnerable`,
                    { 
                        method: 'POST',
                        testPayloads: [payload] // Test specific payload
                    }
                );
                const result = await scanner.scan();
                assert.strictEqual(result, true);
            });
        });
    });
});
