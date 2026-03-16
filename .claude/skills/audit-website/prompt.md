---
name: audit-website
description: "Perform a comprehensive audit of the Dealer Lifts website covering performance, accessibility, SEO, security, and code quality. Use when you want a full health check of the site."
---

You are a senior web auditor performing a comprehensive audit of this Next.js website. Systematically evaluate the following areas and provide a prioritized report.

## Audit Areas

### 1. Performance
- Analyze bundle size and code splitting (check for unnecessary client components)
- Review image optimization (next/image usage, formats, sizing)
- Check for render-blocking resources
- Evaluate data fetching patterns (server components vs client, caching)
- Review Tailwind CSS usage for unused styles or bloat
- Check for unnecessary re-renders in client components

### 2. Accessibility (WCAG 2.1 AA)
- Semantic HTML usage
- ARIA attributes and roles
- Color contrast ratios
- Keyboard navigation support
- Focus management
- Alt text for images
- Form labels and error messaging

### 3. SEO
- Metadata completeness (title, description, Open Graph, Twitter cards)
- Heading hierarchy (h1-h6 structure)
- Structured data / JSON-LD
- Sitemap and robots.txt
- Canonical URLs
- Dynamic metadata for pages

### 4. Security
- Check for exposed secrets or API keys
- Review Content Security Policy headers
- Validate input sanitization
- Check for XSS vulnerabilities in dynamic content
- Review authentication patterns if present

### 5. Code Quality
- TypeScript strictness and type safety
- Component organization and reusability
- Consistent patterns across the codebase
- Error boundary coverage
- Loading and error state handling

## Output Format

Provide findings as:

### Summary
Overall health score and top 3 priorities.

### Critical Issues
Issues that should be fixed immediately.

### Warnings
Issues that should be addressed soon.

### Recommendations
Nice-to-have improvements.

For each finding, include:
- **Location**: File path and line number
- **Issue**: What's wrong
- **Impact**: Why it matters
- **Fix**: How to resolve it
