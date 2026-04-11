# Azitis Automation

End-to-end testing framework for Azitis platform using Playwright with TypeScript and Page Object Model pattern.

## Tech Stack

- **Playwright** - Browser automation
- **TypeScript** - Type-safe test development
- **Allure** - Test reporting
- **Faker.js** - Test data generation

## Project Structure

```
├── pages/              # Page Object Model classes
│   ├── admin/         # Admin panel pages
│   └── client/        # Client-facing pages
├── tests/             # Test suites
│   ├── admin/         # Admin tests
│   ├── client/        # Client tests
│   └── e2e/           # End-to-end tests
├── fixtures/          # Test fixtures
├── utils/             # Helper utilities
└── config/            # Configuration files
```

## Installation

```bash
npm install
npx playwright install
```

## Running Tests

```bash
# Client tests (desktop)
npm run client:desktop

# Client tests (mobile)
npm run client:mobile

# Admin tests
npm run admin:desktop

# All tests
npx playwright test

# Specific test file
npx playwright test tests/client/login.client.test.ts
```

## Test Reports

```bash
# Generate and open Allure report
npm run allure:report

# View Playwright HTML report
npx playwright show-report
```

## Configuration

Test environments are configured in `.env.staging1` file with credentials and base URLs for admin and client platforms.