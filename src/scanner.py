import requests
import json
import time

class PrototypePollutionScanner:
    def __init__(self, target_url, options=None):
        self.target_url = target_url
        self.options = options or {}
        self.options.setdefault('method', 'POST')
        self.options.setdefault('headers', {'Content-Type': 'application/json'})
        self.options.setdefault('timeout', 5)
        self.options.setdefault('verbose', False)
        self.vulnerable = False
        self.test_payloads = self.generate_test_payloads()

    def generate_test_payloads(self):
        return [
            {'__proto__': {'polluted': True}},
            {'constructor': {'prototype': {'polluted': True}}},
            {'constructor': {'prototype': {'toString': 'polluted'}}},
            {'prototype': {'polluted': True}}
        ]

    async def scan(self):
        print(f"[+] Starting prototype pollution scan for {self.target_url}")
        
        for payload in self.test_payloads:
            try:
                if self.options.get('verbose'):
                    print(f"[.] Testing payload: {json.dumps(payload)}")

                response = requests.request(
                    method=self.options['method'],
                    url=self.target_url,
                    json=payload,
                    headers=self.options['headers'],
                    timeout=self.options['timeout']
                )

                # Check if pollution was successful
                check_response = requests.get(self.target_url)
                
                if self.check_for_pollution(check_response.json()):
                    self.vulnerable = True
                    print(f"[!] Prototype pollution vulnerability found with payload: {json.dumps(payload)}")
                    print(f"[!] Affected property: {self.get_polluted_property(check_response.json())}")
                    return True

            except Exception as error:
                if self.options.get('verbose'):
                    print(f"[!] Error testing payload {json.dumps(payload)}: {str(error)}")

        if not self.vulnerable:
            print("[+] No prototype pollution vulnerabilities detected")
        return False

    def check_for_pollution(self, data):
        try:
            test_obj = {}
            return (hasattr(test_obj, 'polluted') and test_obj.polluted is True) or \
                   (hasattr(test_obj, 'toString') and test_obj.toString == 'polluted') or \
                   self.has_polluted_properties(test_obj)
        except:
            return False

    def has_polluted_properties(self, obj):
        for key in obj:
            if not obj.hasOwnProperty(key) and key == 'polluted':
                return True
        return False

    def get_polluted_property(self, data):
        test_obj = {}
        if hasattr(test_obj, 'polluted') and test_obj.polluted is True:
            return 'polluted'
        if hasattr(test_obj, 'toString') and test_obj.toString == 'polluted':
            return 'toString'
        
        for key in test_obj:
            if not test_obj.hasOwnProperty(key):
                return key
        return 'unknown'

# Usage example
if __name__ == "__main__":
    scanner = PrototypePollutionScanner('http://example.com/api', {
        'verbose': True,
        'method': 'POST'
    })
    
    scanner.scan()
