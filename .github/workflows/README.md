# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated issue creation and management.

## 🚀 Automated Issue Creation Workflows

### 1. `create-todo-issues.yml`
**Purpose:** Scans codebase for TODO, FIXME, HACK, NOTE, and BUG comments and creates issues.

**Triggers:**
- Push to main/master
- Pull request events
- Weekly schedule (Mondays 9 AM UTC)
- Manual trigger

**What it does:**
- Scans `.js`, `.ts`, `.tsx` files for code comments
- Groups comments by type (TODO, FIXME, etc.)
- Creates GitHub issues for each type with detailed information
- Prevents duplicate issues

### 2. `create-dependency-issues.yml`
**Purpose:** Checks for outdated dependencies and security vulnerabilities.

**Triggers:**
- Weekly schedule (Wednesdays 10 AM UTC)
- Manual trigger

**What it does:**
- Runs `npm audit` for security vulnerabilities
- Checks for outdated packages with `npm outdated`
- Creates issues for high-severity security issues
- Creates issues for major version updates

### 3. `create-performance-issues.yml`
**Purpose:** Analyzes performance and accessibility issues.

**Triggers:**
- Bi-weekly schedule (Fridays 11 AM UTC)
- Manual trigger

**What it does:**
- Analyzes bundle size
- Checks for performance anti-patterns
- Scans for accessibility issues (missing alt text, labels, etc.)
- Creates targeted issues for each category

### 4. `create-test-issues.yml`
**Purpose:** Analyzes test coverage and missing test files.

**Triggers:**
- Daily schedule (8 AM UTC)
- Manual trigger

**What it does:**
- Runs test coverage analysis
- Identifies untested files
- Creates issues for low coverage areas
- Suggests test file creation for missing tests

### 5. `create-code-quality-issues.yml`
**Purpose:** Checks code quality, complexity, and formatting.

**Triggers:**
- Weekly schedule (Tuesdays 9 AM UTC)
- Manual trigger

**What it does:**
- Runs linting checks
- Analyzes code complexity
- Detects code duplication
- Checks code formatting consistency

### 6. `create-comprehensive-issues.yml`
**Purpose:** Orchestrates all issue creation workflows.

**Triggers:**
- Weekly schedule (Mondays 6 AM UTC)
- Manual trigger

**What it does:**
- Triggers multiple analysis workflows
- Creates a comprehensive summary issue
- Can run in dry-run mode for testing

## 🛠️ Management Workflows

### 7. `manage-automated-issues.yml`
**Purpose:** Manages and cleans up automated issues.

**Triggers:**
- Monthly schedule (1st of month, 7 AM UTC)
- Manual trigger

**Actions:**
- `cleanup`: Close old issues
- `archive`: Archive old issues with label
- `report`: Generate management reports
- `close-resolved`: Close issues marked as resolved

## 📋 Existing Workflows

### `create-issue-on-failure.yml`
Creates issues when CI workflows fail.

### `create-release-issue.yml`
Creates tracking issues for merged pull requests.

### `manual-issue-creation.yml`
Allows manual creation of issues via workflow dispatch.

### `check.yml`, `typecheck.yml`, etc.
Standard CI/CD workflows.

## 🎯 Usage Examples

### Manual Issue Creation
```yaml
# Trigger comprehensive analysis
workflow_dispatch:
  issue_types: "todo,dependency,performance"
  dry_run: false
```

### Managing Old Issues
```yaml
# Close issues older than 60 days
workflow_dispatch:
  action: "cleanup"
  days_old: "60"
  dry_run: false
```

## 🔧 Configuration

### Labels Used
- `automated`: All automatically created issues
- `todo`, `fixme`, `hack`, `note`: Code comment types
- `security`, `dependencies`: Dependency-related issues
- `performance`, `accessibility`: Performance/accessibility issues
- `test-coverage`, `missing-tests`: Testing issues
- `linting`, `code-complexity`, `code-duplication`, `formatting`: Code quality issues
- `report`, `management`: Management and reporting issues

### Preventing Duplicate Issues
All workflows check for existing open issues with the same labels before creating new ones.

### Customization
- Adjust schedules in workflow files
- Modify thresholds (e.g., test coverage minimums)
- Add/remove issue types
- Customize issue templates

## 📊 Monitoring

### Issue Categories
- **Critical**: Security vulnerabilities, build failures
- **High**: Major updates, low test coverage, linting errors
- **Medium**: Performance issues, missing tests
- **Low**: Code formatting, minor duplication

### Reports
- Comprehensive weekly reports
- Monthly management summaries
- Individual issue tracking

## 🚨 Best Practices

1. **Review Before Action**: Use dry-run mode to preview changes
2. **Gradual Implementation**: Start with one workflow type
3. **Monitor Issue Volume**: Adjust thresholds to avoid issue spam
4. **Regular Cleanup**: Use management workflows to keep issues relevant
5. **Team Communication**: Inform team about automated issue creation

## 🔍 Troubleshooting

### Common Issues
- **Too many issues**: Increase thresholds or reduce check frequency
- **Duplicate issues**: Check existing issue detection logic
- **Missing dependencies**: Ensure required tools are installed
- **Permission errors**: Verify workflow permissions

### Debug Mode
Set `dry_run: true` in workflow dispatch to test without creating issues.