# Lion Rocket E2E Tests

Comprehensive end-to-end testing suite for Lion Rocket AI Chat Service using Playwright.

## 📋 Overview

This test suite covers all critical user flows and functionality:
- Authentication (login, registration, logout)
- Character management (CRUD operations)
- Chat conversations (messaging, streaming, SSE)
- Admin panel functionality
- API integration testing
- Visual regression testing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Lion Rocket backend running on http://localhost:8000
- Lion Rocket frontend running on http://localhost:3000

### Installation
```bash
cd tests
npm install
npx playwright install
```

### Running Tests

#### Run all tests
```bash
npm run test
# or
./run-tests.sh --all
```

#### Run specific test suites
```bash
# Authentication tests
npm run test:auth

# Chat tests
npm run test:chat

# Character tests
npm run test character/

# Admin tests
npm run test:admin

# API tests
npm run test:api

# Visual tests
npm run test visual/
```

#### Run tests in different modes
```bash
# Headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# UI mode (interactive)
npm run test:ui
```

## 📁 Test Structure

```
tests/
├── e2e/
│   ├── auth/                 # Authentication flows
│   │   └── auth.spec.ts
│   ├── characters/           # Character management
│   │   └── character-management.spec.ts
│   ├── chat/                 # Chat functionality
│   │   └── chat-conversation.spec.ts
│   ├── admin/                # Admin panel
│   │   └── admin-panel.spec.ts
│   ├── api/                  # API integration
│   │   └── api-integration.spec.ts
│   ├── visual/               # Visual regression
│   │   └── visual-regression.spec.ts
│   ├── fixtures/             # Test data
│   │   └── test-data.ts
│   └── helpers/              # Test utilities
│       └── auth.helper.ts
├── playwright.config.ts      # Playwright configuration
├── package.json             # Dependencies
├── run-tests.sh            # Test runner script
└── README.md               # This file
```

## 🧪 Test Categories

### Authentication Tests
- User registration with validation
- Login/logout flows
- Session persistence
- Token refresh
- Protected route access
- Admin vs regular user permissions

### Character Management Tests
- Create public/private characters
- Character listing and search
- Edit character details
- Delete characters
- Avatar upload
- Access control

### Chat Conversation Tests
- Create new chats
- Send/receive messages
- Real-time streaming via SSE
- Message history
- Chat deletion
- Error handling
- Keyboard shortcuts

### Admin Panel Tests
- Dashboard statistics
- User management
- Character moderation
- System settings
- Activity logs
- Content moderation

### API Integration Tests
- REST endpoint testing
- Authentication flow
- CRUD operations
- SSE streaming
- Error responses
- Rate limiting

### Visual Regression Tests
- Component screenshots
- Page layouts
- Responsive design
- Dark mode
- Different viewport sizes

## 🛠️ Configuration

### Environment Variables
Create a `.env` file in the tests directory:
```env
PLAYWRIGHT_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000
```

### Test Data
Test users and data are defined in `fixtures/test-data.ts`. Modify as needed for your environment.

### Playwright Config
Configuration options in `playwright.config.ts`:
- Browser selection
- Viewport sizes
- Timeouts
- Screenshots/videos
- Parallel execution

## 📊 Test Reports

### HTML Report
```bash
# Generate and open HTML report
npm run report
```

### Coverage Report
```bash
./run-tests.sh --coverage
```

Reports are generated in:
- `playwright-report/` - HTML report
- `test-results/` - JSON and JUnit reports

## 🏃 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E tests
  run: |
    cd tests
    npm ci
    npx playwright install --with-deps
    npm run test
  env:
    CI: true
```

### Docker Support
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal
WORKDIR /tests
COPY . .
RUN npm ci
CMD ["npm", "run", "test"]
```

## 🐛 Debugging

### Debug single test
```bash
# Debug specific test
npx playwright test auth.spec.ts --debug

# Use UI mode for interactive debugging
npm run test:ui
```

### View trace files
```bash
# After test failure, view trace
npx playwright show-trace trace.zip
```

### Common Issues

1. **Tests timing out**
   - Increase timeout in `playwright.config.ts`
   - Check if services are running

2. **Visual tests failing**
   - Update screenshots: `npm run test visual/ -- --update-snapshots`
   - Check for OS/browser differences

3. **Authentication failures**
   - Verify test user exists
   - Check API endpoints

## 🔧 Extending Tests

### Add new test file
```typescript
import { test, expect } from '@playwright/test'
import { AuthHelper } from '../helpers/auth.helper'

test.describe('New Feature Tests', () => {
  test('should test new feature', async ({ page }) => {
    // Your test code
  })
})
```

### Add new fixture
```typescript
// fixtures/new-fixture.ts
export const newTestData = {
  // Your test data
}
```

### Add new helper
```typescript
// helpers/new.helper.ts
export class NewHelper {
  // Helper methods
}
```

## 📝 Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for network idle** before taking screenshots
3. **Use fixtures** for consistent test data
4. **Clean up** after tests (delete created resources)
5. **Isolate tests** - each test should be independent
6. **Mock external services** when appropriate
7. **Use page objects** for complex UI interactions

## 📞 Support

For issues or questions:
1. Check test output and traces
2. Review logs in `test-results/`
3. Run in debug mode for step-by-step execution
4. Open an issue with reproduction steps