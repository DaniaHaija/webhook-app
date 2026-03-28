
🚀 Webhook Pipeline System
An enterprise-grade Webhook management system built with Node.js, BullMQ, and PostgreSQL. This system allows users to create data pipelines that ingest webhooks, process them using background workers, and deliver the results to multiple subscribers with built-in retry logic.

🏗 System Architecture
The project follows a microservices-oriented architecture:

API Server (App): Handles CRUD for pipelines and ingests incoming webhooks.

Redis: Acts as a high-performance message broker using BullMQ.

Worker: Dedicated background process that performs data transformations and deliveries.

PostgreSQL: Persistent storage for pipelines, subscribers, and job history.

🛠 Tech Stack
Backend: Node.js (TypeScript) & Express

Queue Management: BullMQ (Redis-backed)

Database & ORM: PostgreSQL & Drizzle ORM

Monitoring: BullBoard (Visual Dashboard)

Containerization: Docker & Docker Compose

✨ Features
[x] Webhook Ingestion: Fast entry point that offloads tasks to the background.

[x] Background Processing: Decoupled worker to handle heavy lifting.

[x] Transformation Actions:

TRANSFORM_UPPERCASE: Converts payload strings to uppercase.

ADD_TIMESTAMP: Injects a processedAt ISO string into the payload.

FILTER_SENSITIVE: Automatically strips password and token fields for security.

[x] Reliable Delivery: Multi-casting to several URLs with exponential backoff retries (3 attempts).

[x] Observability: Built-in dashboard to monitor queues and job statuses.

[x] Security: Rate limiting on webhooks and API Key protection for pipeline management.

🚦 Getting Started
Prerequisites
Docker & Docker Compose installed.

Installation & Setup
Clone the repository:

Bash
git clone <your-repo-url>
cd webhook-app
Configure Environment:
Create a .env file (or use defaults in docker-compose):

Code snippet
ADMIN_API_KEY=your_secret_key_here
Run the entire stack:

Bash
docker compose up -d --build
Initialize Database:

Bash
docker compose exec app npx drizzle-kit push
🔌 API Endpoints
Method	Endpoint	Description	Auth
POST	/pipelines	Create a new pipeline & subscribers	API Key
GET	/pipelines	List all active pipelines	None
POST	/webhooks/:id	Trigger a webhook job	Rate Limited
GET	/jobs/:id	Get status and history of a job	None
GET	/admin/queues	Access BullBoard Dashboard	Browser
📊 Monitoring
You can monitor the health of your queues and retry failed jobs via the BullBoard Dashboard at:
👉 http://localhost:3000/admin/queues

🛡 CI/CD
This project includes a GitHub Actions pipeline (defined in .github/workflows) that automatically builds and verifies the Docker images on every push.