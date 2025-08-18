# GitHub Actions Deployment Setup

This repository includes separate GitHub Actions workflows for each environment, providing clear separation and easier management:

- `deploy-development.yml` - Deploys to development environment
- `deploy-staging.yml` - Deploys to staging environment  
- `deploy-production.yml` - Deploys to production environment

## Environment-Specific Workflows

Each workflow file is dedicated to a single environment, making them easier to understand and maintain:

### Development Workflow (`deploy-development.yml`)
- **Triggers**: Push to `develop`, `feature/container-app`, or any `feature/**` branches
- **Manual trigger**: Available via workflow dispatch
- **Environment**: Uses `development` GitHub environment

### Staging Workflow (`deploy-staging.yml`)
- **Triggers**: Push to `staging` branch
- **Manual trigger**: Available via workflow dispatch
- **Environment**: Uses `staging` GitHub environment

### Production Workflow (`deploy-production.yml`)
- **Triggers**: Push to `main` or `production` branches
- **Manual trigger**: Available via workflow dispatch
- **Environment**: Uses `production` GitHub environment
- **Production flag**: Sets `PRODUCTION_ENVIRONMENT=true` in build argsions Deployment Setup

This repository includes a GitHub Actions workflow (`deploy.yml`) that supports multiple environments (development, staging, production) with environment-specific secrets and variables for automated deployment to AWS ECS.

## Environment Configuration

The workflow automatically determines the target environment based on the branch:

- `develop` or `feature/*` branches → **development** environment
- `staging` branch → **staging** environment  
- `main` branch → **production** environment
- Manual trigger → Choose environment from dropdown

## Benefits of Separate Workflow Files

### ✅ **Advantages**
- **Clarity**: Each workflow is focused on a single environment
- **Easier Maintenance**: No complex branching logic or environment detection
- **Independent Changes**: Modify one environment without affecting others
- **Better Debugging**: Isolate issues to specific environments
- **Simpler Configuration**: Each workflow has straightforward triggers and settings
- **Environment Protection**: Each can have different protection rules
- **Faster Execution**: No overhead from environment detection logic

### ⚠️ **Considerations**  
- **Multiple Files**: Three separate files to maintain instead of one
- **Code Duplication**: Similar steps repeated across workflows
- **Synchronization**: Changes to common steps need to be applied to all files

## Workflow Structure

All three workflows follow the same pattern:

1. **Checkout Code** - Get latest source code
2. **Setup Node.js** - Install Node.js 20.11.1
3. **AWS Authentication** - Configure AWS credentials using environment secrets
4. **ECR Login** - Authenticate with Amazon ECR
5. **Build Docker Image** - Create container with environment-specific build args
6. **Push to ECR** - Upload with environment-specific tags
7. **Deploy to ECS** - Update ECS service using environment-specific cluster/service
8. **Wait for Deployment** - Verify deployment completion

## GitHub Environment Setup

You need to create three environments in your GitHub repository:

### 1. Go to Repository Settings
- Navigate to your GitHub repository
- Click "Settings" tab
- In left sidebar, click "Environments"

### 2. Create Environments
Create these three environments:
- `development`
- `staging` 
- `production`

### 3. Configure Environment Protection Rules (Recommended)
For **production** environment, consider adding:
- Required reviewers (e.g., senior developers, team leads)
- Wait timer (e.g., 5 minutes to allow for last-minute cancellations)
- Restrict to specific branches (e.g., only `main` and `production`)

For **staging** environment, you might want:
- Required reviewers (optional, for controlled testing)
- Restrict to `staging` branch

## Required Secrets and Variables by Environment

Configure these for **each environment** (development, staging, production):

### Secrets (Sensitive Data)
Add these in the "Environment secrets" section:

- `AWS_ACCESS_KEY_ID` - AWS access key ID for authentication
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key for authentication
- `UPSTASH_REDIS_REST_TOKEN` - Token for Upstash Redis REST API
- `DIRECTUS_TOKEN` - Authentication token for Directus
- `PREVIEW_SECRET` - Secret key for preview functionality
- `DIRECTUS_PREVIEW_TOKEN` - Preview token for Directus

### Variables (Non-sensitive Configuration)
Add these in the "Environment variables" section:

- `AWS_REGION` - AWS region where your resources are located
- `ECR_REPOSITORY` - Name of your ECR repository
- `ECS_CLUSTER_NAME` - Name of your ECS cluster
- `ECS_SERVICE_NAME` - Name of your ECS service
- `DIRECTUS_REST_URL` - URL for the Directus REST API
- `UPSTASH_REDIS_REST_URL` - URL for Upstash Redis REST API
- `SITE_ID` - Site identifier
- `CATEGORIES_MAP` - Categories mapping configuration
- `PUBLIC_SUPPORTED_LANGUAGES` - Supported languages configuration

## Example Environment Configuration

### Development Environment
```
Variables:
- AWS_REGION: us-east-1
- ECR_REPOSITORY: myapp-dev
- ECS_CLUSTER_NAME: myapp-cluster-dev
- ECS_SERVICE_NAME: myapp-service-dev
- DIRECTUS_REST_URL: https://dev-api.example.com
- UPSTASH_REDIS_REST_URL: https://dev-redis.upstash.io
- SITE_ID: dev-site
- PUBLIC_SUPPORTED_LANGUAGES: en,es

Secrets:
- AWS_ACCESS_KEY_ID: (dev AWS key)
- AWS_SECRET_ACCESS_KEY: (dev AWS secret)
- DIRECTUS_TOKEN: (dev token)
- UPSTASH_REDIS_REST_TOKEN: (dev token)
- PREVIEW_SECRET: (dev secret)
- DIRECTUS_PREVIEW_TOKEN: (dev preview token)
```

### Production Environment
```
Variables:
- AWS_REGION: us-east-1
- ECR_REPOSITORY: myapp-prod
- ECS_CLUSTER_NAME: myapp-cluster-prod
- ECS_SERVICE_NAME: myapp-service-prod
- DIRECTUS_REST_URL: https://api.example.com
- UPSTASH_REDIS_REST_URL: https://prod-redis.upstash.io
- SITE_ID: prod-site
- PUBLIC_SUPPORTED_LANGUAGES: en,es,pt

Secrets:
- AWS_ACCESS_KEY_ID: (prod AWS key)
- AWS_SECRET_ACCESS_KEY: (prod AWS secret)
- DIRECTUS_TOKEN: (prod token)
- UPSTASH_REDIS_REST_TOKEN: (prod token)
- PREVIEW_SECRET: (prod secret)
- DIRECTUS_PREVIEW_TOKEN: (prod preview token)
```

## Workflow Behavior

The GitHub Action workflow will:

1. **Environment Detection**: Automatically determines target environment from branch name
2. **Setup**: Configures Node.js and AWS credentials using environment-specific secrets
3. **Build**: Creates Docker image with environment-specific build arguments
4. **Tagging**: Tags images with environment prefix (e.g., `production-latest`, `development-abc123`)
5. **Push**: Uploads images to environment-specific ECR repository
6. **Deploy**: Updates environment-specific ECS service
7. **Verification**: Waits for deployment completion

## Image Tagging Strategy

Images are tagged with environment-specific prefixes:
- `latest` - Always points to the most recent build
- `{environment}-latest` - Latest build for specific environment
- `{environment}-{commit-sha}` - Specific commit for environment

Examples:
- `production-latest`
- `production-abc1234`
- `development-latest`  
- `development-def5678`

## Manual Deployment

Each workflow can be triggered manually:

1. Go to "Actions" tab in your repository
2. Select the desired workflow:
   - "Deploy to Development"
   - "Deploy to Staging" 
   - "Deploy to Production"
3. Click "Run workflow"
4. Choose the branch you want to deploy from
5. Click "Run workflow"

## File Overview

| File | Purpose | Triggers | Environment |
|------|---------|----------|-------------|
| `deploy-development.yml` | Development deployments | `develop`, `feature/**` branches | `development` |
| `deploy-staging.yml` | Staging deployments | `staging` branch | `staging` |
| `deploy-production.yml` | Production deployments | `main`, `production` branches | `production` |

## Key Differences Between Workflows

### Development
- `PRODUCTION_ENVIRONMENT=""` (empty/false)
- `ENVIRONMENT="development"`
- Tags: `development-latest`, `development-{sha}`

### Staging  
- `PRODUCTION_ENVIRONMENT=""` (empty/false)
- `ENVIRONMENT="staging"`
- Tags: `staging-latest`, `staging-{sha}`

### Production
- `PRODUCTION_ENVIRONMENT="true"` ⚠️ **Important difference**
- `ENVIRONMENT="production"`
- Tags: `production-latest`, `production-{sha}`

## Key Benefits

- **Environment Isolation**: Each environment has its own secrets and configuration
- **Flexible Deployment**: Support for branch-based and manual deployments
- **Better Tracking**: Environment-specific image tags for easier rollbacks
- **Security**: Sensitive data properly segregated by environment
- **Protection Rules**: Production deployments can require approval

## Migration from CodeBuild

If you're migrating from AWS CodeBuild:

1. **Create GitHub Environments**: Set up development, staging, and production environments
2. **Configure Secrets & Variables**: Add environment-specific configuration as listed above
3. **Test with Development**: Start by testing the workflow with the development environment
4. **Update Infrastructure**: Update any infrastructure-as-code that references the CodeBuild project
5. **Optional**: Keep `buildspec.yaml` for reference but it won't be used by GitHub Actions

## Troubleshooting

- **Authentication Issues**: 
  - Verify AWS credentials are correctly set for the target environment
  - Check ECR repository permissions for the AWS user
- **Build Failures**: 
  - Ensure all secrets and variables are properly configured for the environment
  - Check Docker build logs for specific error details
- **Deployment Issues**: 
  - Verify ECS cluster and service names are correct for the environment
  - Check if the ECS service has sufficient capacity for deployment
- **Environment Issues**:
  - Ensure the GitHub environment exists and is properly configured
  - Check if environment protection rules are blocking deployment
- **Docker Issues**: 
  - Verify that the Dockerfile builds successfully locally with the same arguments
  - Check if all build arguments are being passed correctly

## Security Best Practices

- **Use Environment Secrets**: Store sensitive data in environment secrets, not repository secrets
- **Separate AWS Accounts**: Consider using different AWS accounts for different environments
- **Least Privilege**: Ensure AWS credentials have minimal required permissions for each environment
- **Protection Rules**: Use GitHub environment protection rules for production deployments
- **Review Process**: Require manual approval for production deployments
- **Audit Trail**: Monitor deployment logs and maintain audit trails for compliance
