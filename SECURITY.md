# 🔐 Security Guidelines for StoreZen

## Environment Variables Security

### ✅ What's Safe in Public Repo
- `.env.example` files with placeholder values
- Configuration templates
- Default/demo settings
- Test API endpoints

### ❌ What Must Stay Private
- Actual API keys and secrets
- Database connection strings with credentials
- Production configuration
- Customer data

## API Keys Management

### Razorpay Keys
- **Test Keys**: Safe for development, start with `rzp_test_`
- **Live Keys**: NEVER commit, start with `rzp_live_`
- **Frontend**: Only public keys should be exposed to client

### Twilio Keys
- Account SID: Semi-private (visible in dashboard)
- Auth Token: PRIVATE - never expose
- Phone numbers: Can be public

### Database Credentials
- MongoDB connection strings contain username/password
- Use environment variables always
- Consider using connection string secrets management

## Before Making Repository Public

### 1. Remove Sensitive Data
```bash
# Check for accidentally committed secrets
git log --patch | grep -i "password\|secret\|key\|token"

# Remove from history if found
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch path/to/secret/file' \
--prune-empty --tag-name-filter cat -- --all
```

### 2. Update .gitignore
Ensure these patterns are included:
```
.env
.env.local
.env.*.local
*.env
secrets/
config/local.json
```

### 3. Environment Setup Instructions
- Provide clear setup documentation
- Include `.env.example` files
- Document all required environment variables
- Provide test/demo credentials where safe

## Security Best Practices

### Authentication
- Use JWT tokens with appropriate expiry
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production

### Payment Processing
- Verify payment signatures server-side
- Never trust client-side payment confirmations
- Log all payment attempts
- Use test mode until production ready

### Data Protection
- Sanitize user inputs
- Use parameterized queries
- Implement proper error handling
- Don't expose internal errors to users

## Incident Response

If sensitive data is accidentally committed:

1. **Immediately** rotate all exposed credentials
2. Remove from git history
3. Check access logs for unauthorized usage
4. Update documentation about the incident

## Regular Security Maintenance

- [ ] Review and rotate API keys quarterly
- [ ] Update dependencies regularly
- [ ] Monitor for security vulnerabilities
- [ ] Audit access logs monthly
- [ ] Review environment variable usage

## Contact

For security concerns, please contact: security@yourproject.com
