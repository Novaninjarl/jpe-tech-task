## My approach

I treated this as a Junior Platform Engineering task rather than a frontend feature task. The application already ran locally, so I focused on small improvements that make it safer and easier to build, test, deploy, and support.

The main areas I prioritised were CI/CD validation, Docker readiness, basic endpoint test coverage, safer configuration behaviour, and documenting infrastructure observations.

## How I tested the application

I ran the application locally with:

```bash
npm ci
npm test
npm start
```

I verified the following endpoints in the browser:

```text
http://localhost:3000
http://localhost:3000/health
http://localhost:3000/api/releases
http://localhost:3000/api/config
```

I also built and ran the Docker image with:

```bash
docker build -t release-status-dashboard .
docker run -p 3000:3000 release-status-dashboard
```

## Changes made

### 1. CI/CD workflow improvements

I updated the GitHub Actions workflow so that it now runs tests before deployment, uses `npm ci` for repeatable dependency installation, and builds the Docker image before the deploy step.

I also fixed the deploy script path. The original workflow referenced `./deploy.sh`, but the deploy script is located at `.github/workflows/deploy.sh`.

**Reasoning:**  
A deployment pipeline should validate the application before attempting to deploy. Running tests and building the Docker image earlier helps catch issues before they affect delivery.

### 2. Docker improvements

I updated the Dockerfile to use `node:20-alpine`, install only production dependencies, and copy only the application source needed to run the service.

I also added a `.dockerignore` file to keep unnecessary files such as `node_modules`, `.git`, tests, GitHub workflow files, and Terraform files out of the Docker build context.

**Reasoning:**  
This makes the Docker image smaller, cleaner, and closer to a production-style container.

### 3. Test coverage improvements

I added test coverage for `/api/releases` and `/api/config`.

**Reasoning:**  
The original test only checked `/health`, which proves the service is alive but does not check the main release data endpoint. Adding endpoint tests gives the CI pipeline more useful validation.

### 4. Safer config behaviour

I changed the `/api/config` endpoint so that `debug` is not always true. It now depends on the environment:

```js
debug: environment !== "production"
```

**Reasoning:**  
Debug behaviour should not be enabled by default in production-like environments. In a real system, I would also be careful about what configuration data is exposed through an endpoint.

## Infrastructure observations

I did not deploy the Terraform because the task states that AWS credentials are not required.

Observations from the `infra` folder:

- SSH on port 22 is open to `0.0.0.0/0`, which is risky. I would restrict it to trusted IPs or use AWS Systems Manager Session Manager instead.
- The app is exposed directly on port 3000. In production, I would prefer to place it behind a load balancer or reverse proxy.
- The AMI ID appears to be a placeholder and would need to be replaced with a valid AMI for the target AWS region.
- The EC2 instance type `t3.xlarge` seems oversized for a small release dashboard unless there are known performance requirements.
- The EBS volume is created but does not appear to be attached to the EC2 instance.
- The S3 bucket name is hardcoded, and S3 bucket names must be globally unique, so this could cause conflicts.
- I would add remote Terraform state, state locking, stronger variable validation, and environment-specific configuration with more time.

## Basic support/runbook notes

If the application is not responding, I would check:

1. Whether the process or container is running.
2. Whether `/health` is returning successfully.
3. Recent deployment logs.
4. Whether port 3000 is available and mapped correctly.
5. Environment variables such as `NODE_ENV`, `PORT`, and `APP_NAME`.
6. Whether the latest change caused the issue and whether a rollback is needed.

## AI usage note

I used AI assistance to help think through possible CI/CD, Docker, testing, and infrastructure improvements. I manually reviewed the suggested changes, ran the tests, built the Docker image, and verified the application locally.

For production engineering work, I would avoid sharing secrets, customer data, credentials, or proprietary information with unapproved AI tools. AI-generated changes should still go through normal review, testing, and security checks.

## Improvements I would make with more time

- Add linting and formatting checks.
- Add dependency and security scanning, such as `npm audit` or Dependabot.
- Add structured logging.
- Add a Docker health check.
- Add deployment environments with approval gates for production.
- Improve error handling if release data cannot be loaded.
- Harden the Terraform security group rules.
- Add remote Terraform state and state locking.