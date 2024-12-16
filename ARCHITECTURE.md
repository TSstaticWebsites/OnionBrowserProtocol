# Onion Browser Application Architecture

## Components Overview

### 1. Frontend React Application
- Single page application with the following main components:
  - NodeSelectionComponent: Fetches and displays available Tor nodes from DirectoryAuthorityProxy
  - CircuitBuilderComponent: Handles node selection and circuit creation
  - EncryptionService: Manages layered encryption for the circuit
  - OnionRequestComponent: Handles URL input and displays retrieved content

### 2. API Endpoints Required

#### DirectoryAuthorityProxy
- `GET /nodes`: Retrieves list of available Tor nodes
  - Response: Array of nodes with their public keys and roles (entry/middle/exit)

#### EntryProxy
- `POST /relay`: Accepts encrypted onion packages
  - Request Body: Contains the fully encrypted package ready for Tor network
  - Response: Returns the HTML content from the target onion service

### 3. Circuit Building Process
1. Node Selection:
   - Fetch available nodes from DirectoryAuthorityProxy
   - Randomly select entry, middle, and exit nodes following Tor's selection algorithm
   - Validate node selection (ensure different nodes for each position)

2. Circuit Creation:
   - Create layered encryption using nodes' public keys
   - Build circuit in order: exit node -> middle node -> entry node
   - Each layer includes:
     - Next node address
     - Encrypted payload for next hop

3. Package Preparation:
   - Final package structure must be Tor-compatible
   - All encryption done client-side in browser
   - Package must be complete before sending to EntryProxy

4. Request Flow:
   - User enters .onion URL
   - Application builds circuit and encrypts request
   - Encrypted package sent to EntryProxy
   - Response decrypted through layers
   - HTML content displayed in UI

### 4. Security Considerations
- All encryption performed client-side
- No sensitive data stored in browser
- Proper key management for node public keys
- Validation of node authenticity

### 5. Implementation Plan
1. Setup React frontend with TypeScript
2. Implement DirectoryAuthorityProxy integration
3. Create circuit building logic
4. Implement encryption layers
5. Build EntryProxy integration
6. Add UI for URL input and content display
7. Implement error handling and user feedback
