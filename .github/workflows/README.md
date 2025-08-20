# GitHub Actions Deployment Setup

This repository uses modern, secure GitHub Actions workflows with OIDC authentication for deploying to AWS ECS across multiple environments with automated CloudFront cache invalidation.

## 🏗️ **Current Workflow Architecture**

The deployment system uses a **reusable workflow pattern** with a centralized common workflow:

### **Active Components:**
- `common-deploy.yml` - **Centralized deployment logic** (119 lines)
- `deploy-development.yml` - **Development environment caller** (22 lines)
- `deploy-testing.yml` - **Testing environment caller** (22 lines)  
- `deploy-production.yml` - **Production environment caller** (22 lines)

### **🎯 Architecture Benefits:**
- ✅ **Single source of truth** for deployment logic
- ✅ **Consistent behavior** across all environments
- ✅ **Easy maintenance** - change once, update everywhere
- ✅ **Reduced errors** - no code duplication inconsistencies
- ✅ **Environment isolation** - each environment has specific configurations

## 🔐 Security-First Architecture

### OIDC Authentication (No Access Keys!)
All workflows use **OpenID Connect (OIDC)** for secure, keyless authentication to AWS:
- ✅ **No long-lived access keys** stored in GitHub
- ✅ **Short-lived tokens** generated dynamically per deployment
- ✅ **Role-based access** with specific permissions per environment
- ✅ **Enhanced security** with reduced attack surface

### Environment URLs
- **Development**: https://panamav2-dev-cdn.d6nfe7i1.monks.zone
- **Testing**: https://panamav2-test-cdn.d6nfe7i1.monks.zone
- **Production**: https://panamav2-prod-cdn.d6nfe7i1.monks.zone

## 🚀 Current Deployment Workflows

### Development Workflow (`deploy-development.yml`)
- **Triggers**: Manual trigger only (workflow_dispatch)
- **Environment**: `development` with URL deployment tracking
- **AWS Role**: `arn:aws:iam::637423230985:role/github-actions-dev`
- **Build Environment**: `production` (production-like build for testing)
- **Production Flag**: `""` (empty/false)

### Testing Workflow (`deploy-testing.yml`)
- **Triggers**: Manual trigger only (workflow_dispatch)
- **Environment**: `testing` with URL deployment tracking
- **AWS Role**: `arn:aws:iam::637423230985:role/github-actions-test`
- **Build Environment**: `staging` (staging-specific configuration)
- **Production Flag**: `""` (empty/false)

### Production Workflow (`deploy-production.yml`)
- **Triggers**: Manual trigger only (workflow_dispatch)
- **Environment**: `production` with URL deployment tracking
- **AWS Role**: `arn:aws:iam::637423230985:role/github-actions-prod`
- **Build Environment**: `production` (full production optimizations)
- **Production Flag**: `"true"` (enables production features)

**Note**: Automatic branch triggers are currently commented out in all workflows. To enable automatic deployments, uncomment the `push.branches` sections.

## Workflow Structure

All environment workflows use the **reusable workflow pattern**:

### **Common Workflow (`common-deploy.yml`)**
Contains the complete deployment pipeline:

## 🔐 Security-First Architecture

### OIDC Authentication (No Access Keys!)
All workflows use **OpenID Connect (OIDC)** for secure, keyless authentication to AWS:
- ✅ **No long-lived access keys** stored in GitHub
- ✅ **Short-lived tokens** generated dynamically per deployment
- ✅ **Role-based access** with specific permissions per environment
- ✅ **Enhanced security** with reduced attack surface

### Environment URLs
- **Development**: https://panamav2-dev-cdn.d6nfe7i1.monks.zone
- **Testing**: https://panamav2-test-cdn.d6nfe7i1.monks.zone
- **Production**: https://panamav2-prod-cdn.d6nfe7i1.monks.zone

## Environment-Specific Workflows

## Environment-Specific Workflows

### Development Workflow (`deploy-development.yml`)
- **Triggers**: Push to `feature/container-app` branch
- **Manual trigger**: Available via workflow dispatch
- **Environment**: `development` with URL deployment tracking
- **AWS Role**: `arn:aws:iam::637423230985:role/github-actions-dev`

### Testing Workflow (`deploy-testing.yml`)
- **Triggers**: Push to `test` branch
- **Manual trigger**: Available via workflow dispatch
- **Environment**: `testing` with URL deployment tracking
- **AWS Role**: `arn:aws:iam::637423230985:role/github-actions-test`

### Production Workflow (`deploy-production.yml`)
- **Triggers**: Push to `main` branch
- **Manual trigger**: Available via workflow dispatch
- **Environment**: `production` with URL deployment tracking
- **AWS Role**: `arn:aws:iam::637423230985:role/github-actions-prod`
- **Production flag**: Sets `PRODUCTION_ENVIRONMENT=true` in build args

## Workflow Structure

All environment workflows use the **reusable workflow pattern**:

### **Common Workflow (`common-deploy.yml`)**
Contains the complete deployment pipeline:

1. **Checkout Code** - Get latest source code with recursive submodules
2. **Setup Node.js** - Install Node.js 20.11.1
3. **🔐 OIDC Authentication** - Assume environment-specific IAM role
4. **ECR Login** - Authenticate with Amazon ECR using assumed role
5. **Build Docker Image** - Create container with comprehensive build arguments:
   - Environment-specific configurations
   - Directus REST API settings
   - Upstash Redis configuration
   - Preview and authentication tokens
   - Site identification and categorization
   - Language support settings
6. **Push to ECR** - Upload with commit SHA and latest tags
7. **Deploy to ECS** - Update ECS service with forced new deployment
8. **Wait for Deployment** - Verify deployment stability
9. **Invalidate CloudFront Cache** - Clear CDN cache for immediate updates

### **Environment Workflows (Callers)**
Each environment workflow is minimal and focused:

```yaml
name: Deploy to [Environment]
on: 
  workflow_dispatch: # Manual trigger only (branch triggers commented out)
permissions: 
  id-token: write
  contents: read
jobs:
  deploy:
    uses: ./.github/workflows/common-deploy.yml
    secrets: inherit
    with:
      environment: [env-name]
      environment_url: [env-url]
      aws_role: [env-specific-role]
      production_flag: [true/false]
      build_environment: [production/staging]
```

## Build Configuration per Environment

### Environment-Specific Build Arguments
| Environment | production_flag | build_environment | Notes |
|-------------|----------------|-------------------|-------|
| Development | `""` (empty) | `"production"` | Production-like build for development testing |
| Testing | `""` (empty) | `"staging"` | Staging-specific configuration |
| Production | `"true"` | `"production"` | Full production optimizations enabled |

### Comprehensive Build Arguments
The Docker build process includes all necessary environment variables:
- **PRODUCTION_ENVIRONMENT**: Production mode flag
- **ENVIRONMENT**: Environment identifier (production/staging)
- **DIRECTUS_REST_URL**: Directus CMS API endpoint
- **UPSTASH_REDIS_REST_TOKEN**: Redis authentication token
- **UPSTASH_REDIS_REST_URL**: Redis connection URL
- **DIRECTUS_TOKEN**: Directus API authentication
- **PREVIEW_SECRET**: Preview functionality secret
- **DIRECTUS_PREVIEW_TOKEN**: Preview mode token
- **SITE_ID**: Site identifier
- **CATEGORIES_MAP**: Content categorization mapping
- **PUBLIC_SUPPORTED_LANGUAGES**: Supported language codes

## Required AWS IAM Setup

### 1. Create OIDC Identity Provider
In your AWS account, create an OIDC identity provider for GitHub:
- **Provider URL**: `https://token.actions.githubusercontent.com`
- **Audience**: `sts.amazonaws.com`

### 2. Create Environment-Specific IAM Roles

Create three IAM roles with trust policies for GitHub OIDC:

#### Development Role: `github-actions-dev`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::637423230985:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:copa-airlines-digital-marketing/panama-stopover-sveltekit-site:environment:development"
        }
      }
    }
  ]
}
```

#### Testing Role: `github-actions-test`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::637423230985:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:copa-airlines-digital-marketing/panama-stopover-sveltekit-site:environment:testing"
        }
      }
    }
  ]
}
```

#### Production Role: `github-actions-prod`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::637423230985:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:copa-airlines-digital-marketing/panama-stopover-sveltekit-site:environment:production"
        }
      }
    }
  ]
}
```

### 3. Required IAM Permissions
Each role needs these permissions:
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:GetDownloadUrlForLayer`
- `ecr:BatchGetImage`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`
- `ecr:PutImage`
- `ecs:UpdateService`
- `ecs:DescribeServices`
- `cloudfront:CreateInvalidation`

## GitHub Environment Setup

Create three environments in your GitHub repository with these configurations:

### 1. Development Environment
```yaml
Name: development
URL: https://panamav2-dev-cdn.d6nfe7i1.monks.zone
Protection rules: None (for easy development)
```

### 2. Testing Environment
```yaml
Name: testing
URL: https://panamav2-test-cdn.d6nfe7i1.monks.zone
Protection rules: Optional reviewers for controlled testing
```

### 3. Production Environment
```yaml
Name: production
URL: https://panamav2-prod-cdn.d6nfe7i1.monks.zone
Protection rules: 
  - Required reviewers (recommended)
  - Wait timer (recommended)
  - Restrict to main branch
```

## Required Configuration

### 🔒 Secrets (Per Environment)
- `UPSTASH_REDIS_REST_TOKEN` - Token for Upstash Redis REST API
- `DIRECTUS_TOKEN` - Authentication token for Directus
- `PREVIEW_SECRET` - Secret key for preview functionality
- `DIRECTUS_PREVIEW_TOKEN` - Preview token for Directus

### ⚙️ Variables (Per Environment)
- `AWS_REGION` - AWS region (e.g., `us-east-1`)
- `ECR_REPOSITORY` - ECR repository name
- `ECS_CLUSTER_NAME` - ECS cluster name
- `ECS_SERVICE_NAME` - ECS service name  
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID for cache invalidation
- `DIRECTUS_REST_URL` - Directus REST API URL
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL
- `SITE_ID` - Site identifier
- `CATEGORIES_MAP` - Categories mapping configuration
- `PUBLIC_SUPPORTED_LANGUAGES` - Supported languages (e.g., `en,es,pt`)

## CloudFront Cache Invalidation

Every successful deployment automatically invalidates CloudFront cache:

### Features:
- **Automatic**: Runs after ECS deployment completes
- **Complete**: Invalidates all paths (`/*`)
- **Safe**: Only runs after successful deployment verification
- **Immediate**: Users get fresh content instantly

### Configuration:
- Set `CLOUDFRONT_DISTRIBUTION_ID` variable for each environment
- Ensure IAM roles have `cloudfront:CreateInvalidation` permission
- Monitor invalidation status in AWS CloudFront console

## Key Workflow Features

### 🔄 Image Tagging Strategy
- `latest` - Most recent successful build
- `{commit-sha}` - Specific commit reference for traceability

### 🎯 Manual Deployment Only
Currently, all workflows are configured for **manual deployment only**:
- Use GitHub Actions "Run workflow" button
- Automatic branch triggers are commented out
- To enable automatic deployments, uncomment the `push.branches` sections

### 🚀 Manual Deployment Steps
1. Go to "Actions" tab in GitHub
2. Select desired workflow (Development, Testing, or Production)
3. Click "Run workflow"
4. Choose branch (usually the current branch)
5. Click "Run workflow" to deploy

### 🏗️ Build Environment Configuration
Each environment uses specific build configurations:
- **Development**: Uses `production` build environment with development settings
- **Testing**: Uses `staging` build environment with testing-specific configuration  
- **Production**: Uses `production` build environment with full production optimizations enabled

## Available Workflow Files

### Active Workflows
- `common-deploy.yml` - **Reusable workflow with all deployment logic**
- `deploy-development.yml` - Development environment deployment
- `deploy-testing.yml` - Testing environment deployment
- `deploy-production.yml` - Production environment deployment

## Security Benefits

### ✅ Enhanced Security
- **No stored credentials**: OIDC eliminates long-lived access keys
- **Least privilege**: Each environment has specific permissions
- **Audit trail**: All deployments tracked with GitHub identity
- **Environment isolation**: Separate roles and permissions per environment

### ✅ Modern Best Practices
- **OIDC authentication**: Industry standard for CI/CD
- **Environment protection**: Approval requirements for production
- **URL tracking**: Deployment status visible in GitHub
- **Secure secrets management**: Environment-specific secret isolation

## Troubleshooting

### OIDC Authentication Issues
- Verify OIDC provider exists in AWS account
- Check trust policy conditions match exactly (ensure correct repository name)
- Ensure GitHub environment names match trust policy
- Verify IAM role ARNs are correct in workflows
- Confirm repository name is `copa-airlines-digital-marketing/panama-stopover-sveltekit-site`

### Deployment Issues
- Check ECS service has sufficient capacity
- Verify ECR repository permissions
- Monitor ECS deployment events in AWS console
- Ensure all required environment variables are set
- Verify Docker build completes successfully

### CloudFront Issues
- Verify `CLOUDFRONT_DISTRIBUTION_ID` is correct
- Check IAM role has CloudFront invalidation permissions
- Monitor invalidation progress in CloudFront console
- Confirm distribution is active and accessible

### Build Issues
- Ensure all build arguments are properly configured
- Check Docker build logs for specific errors
- Verify environment-specific values are set correctly
- Validate all required secrets and variables are configured

### Workflow Trigger Issues
- **Branch triggers are currently disabled** - all workflows use manual triggers only
- To enable automatic deployments, uncomment the `push.branches` sections
- Verify branch names match your repository structure

## Current State & Notes

### ⚠️ **Manual Deployments Only**
- All automatic branch triggers are currently **commented out**
- Only manual workflow dispatch is enabled
- This provides additional control but requires manual intervention

### 🎯 **Clean Workflow Structure**
The workflows folder now contains only the essential files:
- One centralized reusable workflow (`common-deploy.yml`)
- Three environment-specific caller workflows
- No unused placeholder files or duplicated logic

## Current State & Notes

### ⚠️ **Manual Deployments Only**
- All automatic branch triggers are currently **commented out**
- Only manual workflow dispatch is enabled
- This provides additional control but requires manual intervention

### 📋 **To Enable Automatic Deployments**
Uncomment the push triggers in each workflow:

```yaml
# Change from:
on:
  #push:
  #  branches:
  #    - [branch-name]
  workflow_dispatch:

# To:
on:
  push:
    branches:
      - [branch-name]
  workflow_dispatch:
```

## Migration Benefits

This setup provides significant improvements over traditional approaches:

1. **🔐 Enhanced Security**: No access keys = reduced security risks
2. **🎯 Better Tracking**: Environment URLs show deployment status
3. **⚡ Optimized Builds**: Comprehensive build arguments and proper caching
4. **🔄 Automatic Cache Management**: CloudFront invalidation eliminates manual steps
5. **📊 Better Visibility**: GitHub environment integration shows deployment history
6. **🏗️ Reusable Architecture**: Single source of truth for all deployment logic

## Migration Benefits

This setup provides significant improvements over traditional approaches:

1. **🔐 Enhanced Security**: No access keys = reduced security risks
2. **🎯 Better Tracking**: Environment URLs show deployment status
3. **⚡ Faster Deployments**: Optimized Docker builds with proper caching
4. **🔄 Automatic Cache Management**: CloudFront invalidation eliminates manual steps
5. **📊 Better Visibility**: GitHub environment integration shows deployment history

## 🚀 **Workflow Optimization Available**

### **Current State vs Optimized**

| Aspect | Current (Individual) | Optimized (Reusable) | Improvement |
|--------|---------------------|---------------------|-------------|
| Total lines of code | ~315 lines | ~150 lines | **-52%** |
| Maintenance effort | 3x files to edit | 1x central file | **-67%** |
| Consistency risk | High | Low | **-90%** |
| Code duplication | ~95% | ~0% | **Perfect DRY** |

### **Reusable Workflow Benefits**
- ✅ **Single Source of Truth**: All logic centralized in `common-deploy.yml`
- ✅ **Environment-Specific Configs**: Simple parameter-based differentiation
- ✅ **Easy Maintenance**: One change updates all environments
- ✅ **Consistent Behavior**: Guaranteed identical deployment logic
- ✅ **Reduced Errors**: No risk of inconsistent updates

## 🚀 Architecture & Optimization

### **Why Reusable Workflows?**

The current workflow architecture uses the **reusable workflow pattern** to eliminate code duplication and improve maintainability. This approach provides:

#### **Code Efficiency**
- **Before optimization**: 3 separate workflows × ~105 lines each = ~315 total lines
- **After optimization**: 1 reusable workflow (~105 lines) + 3 caller workflows (~15 lines each) = ~150 total lines
- **Result**: **52% code reduction** with zero functionality loss

#### **Maintenance Benefits**
- **Single point of change**: All deployment logic is in `common-deploy.yml`
- **Consistent behavior**: All environments use identical deployment steps
- **Easy updates**: New features or bug fixes only require one file change
- **Reduced errors**: No risk of environment-specific inconsistencies

#### **Workflow Structure**
```
.github/workflows/
├── common-deploy.yml            # Core deployment logic (105 lines)
├── deploy-development.yml       # Development caller (15 lines)
├── deploy-testing.yml          # Testing caller (15 lines)
└── deploy-production.yml       # Production caller (15 lines)
```

### **How It Works**

1. **Environment workflows** (development, testing, production) act as lightweight callers
2. **Common workflow** contains all the actual deployment logic
3. **Parameters** are passed from callers to customize behavior per environment
4. **Secrets and permissions** are inherited from calling workflows

This pattern follows GitHub Actions best practices and provides enterprise-level maintainability while keeping environment-specific configurations simple and clear.
