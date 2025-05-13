# Design Decisions

## Architecture
1. **Modular Design**: Separate scanner, test app, and test cases
2. **Dual Implementation**: JavaScript (Node.js) and Python versions
3. **Payload Generation**: Multiple attack vectors included

## Key Components
- **Payload Generator**: Creates various prototype pollution payloads
- **Request Handler**: Manages HTTP communications
- **Vulnerability Verifier**: Confirms pollution success

## Security Considerations
- Timeouts to prevent hanging
- Error handling for malformed responses
- No persistent changes to target systems
