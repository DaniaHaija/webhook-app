🚀 Webhook Pipeline System (Production-Ready)
An enterprise-grade Webhook management system built with Node.js, BullMQ, and PostgreSQL. Designed for high reliability, this system ingests webhooks asynchronously, processes them via background workers, and ensures delivery to multiple subscribers with advanced observability.

🏗️ System Architecture
The project follows a decoupled microservices-oriented architecture to ensure maximum scalability:

API Server (App): Express.js server for pipeline management and high-speed webhook ingestion.

Redis Broker: High-performance message queuing using BullMQ.

Background Worker: Dedicated process for data transformations and multi-subscriber delivery.

PostgreSQL: Persistent storage for configurations and detailed job execution history.

✨ Key Features & Bonus Implementation
🛠️ Core Functionality
Asynchronous Processing: Immediate 202 Accepted response to clients, offloading tasks to the background queue.

Dynamic Transformations: Built-in support for UPPERCASE, TIMESTAMP, and SENSITIVE_FILTER actions.

Reliable Multi-casting: Efficiently delivers processed data to multiple subscriber URLs per pipeline.

🌟 Advanced Engineering (Bonus Features)
Visual Monitoring Dashboard: Integrated BullBoard at /admin/queues for real-time queue management and manual retries.

System Observability: Enhanced job tracking including:

totalDurationMs: Latency tracking from ingestion to completion.

workerNode: Identification of the specific node processing the task.

deliveryLog: Detailed HTTP status logs for every subscriber attempt.

Resiliency & Retries: Robust error handling with Exponential Backoff (3 attempts) to handle subscriber downtime.

Security Layer: * Rate Limiting: Protects ingestion endpoints from DDoS and Spam.

API Key Protection: Secures administrative pipeline CRUD operations.

Tech Stack
Runtime: Node.js (TypeScript)

Framework: Express.js

Queue: BullMQ (Redis-backed)

Database: PostgreSQL + Drizzle ORM

DevOps: Docker & Docker Compose

CI/CD: GitHub Actions (Automated Build & Lint)

🚦 Getting Started
Prerequisites
Docker & Docker Compose installed on your machine.

Installation & Setup
Clone the repository:

Bash
git clone https://github.com/DaniaHaija/webhook-app.git
cd webhook-app
Environment Configuration:
Create a .env file or use the defaults provided in docker-compose.yml.

Bash
ADMIN_API_KEY=your_secret_key_here
Launch the Stack:

Bash
docker compose up -d --build

Database Migration:

Bash
docker compose exec app npx drizzle-kit push

🔌 API Reference
Method   Endpoint       Description                             Auth/Protection 
POST     /pipelines   Create pipeline & subscribers              X-API-KEY 
GET      /pipelines   List all active pipelines                  Public
PUT	   /pipelines/:id  Update pipeline name, type, or subscribers	X-API-KEY
DELETE	/pipelines/:id	Permanently delete a pipeline           	X-API-KEY
GET  	/pipelines/:id	Get specific pipeline details	            Public

⚡ Webhook Ingestion & Jobs
These endpoints handle the actual data flow and status tracking.
Method Endpoint              Description                              Auth / Protection
POST   /webhooks/:pipelineId   Ingest webhook data into the queue       Rate Limited
GET   /jobs/:id              Get status, results, and execution history  Public
GET  /admin/queuesAccess    BullBoard Monitoring Dashboard              Browser / Session


🔌 API Reference
🛠️ Pipeline Management
These endpoints require an API Key for administrative operations.

Method	Endpoint	Description	Auth / Protection
POST	/pipelines	Create a new pipeline with subscribers	X-API-KEY
GET	/pipelines	List all active pipelines	Public
GET	/pipelines/:id	Get specific pipeline details	Public
PUT	/pipelines/:id	Update pipeline name, type, or subscribers	X-API-KEY
DELETE	/pipelines/:id	Permanently delete a pipeline	X-API-KEY
⚡ Webhook Ingestion & Jobs
These endpoints handle the actual data flow and status tracking.

Method	Endpoint	Description	Auth / Protection
POST	/webhooks/:pipelineId	Ingest webhook data into the queue	Rate Limited
GET	/jobs/:id	Get status, results, and execution history	Public
GET	/admin/queues	Access BullBoard Monitoring Dashboard	Browser / Session

📝 Payload Examples (For your Documentation)
1. Create Pipeline (POST /pipelines):

JSON
{
  "name": "User Sync Pipeline",
  "actionType": "TRANSFORM_UPPERCASE",
  "subscriberUrls": ["https://api.receiver.com/hook", "https://webhook.site/test"]
}
2. Update Pipeline (PUT /pipelines/:id):

JSON
{
  "name": "Updated Name",
  "actionType": "FILTER_SENSITIVE",
  "subscriberUrls": ["https://new-destination.com/webhook"]
}
3. Trigger Webhook (POST /webhooks/:pipelineId):

JSON
{
  "user": "john_doe",
  "email": "john@example.com",
  "token": "secret_123"
}
📊 Monitoring & Observability
You can monitor the health of your queues, view active/failed jobs, and perform manual retries via the BullBoard Dashboard:

👉 http://localhost:3000/admin/queues

🛡️ Reliability & CI/CD
Fault Tolerance: Uses Redis-backed queues to ensure no data loss during application crashes or restarts.

CI Pipeline: Automated GitHub Actions verify code integrity and build stability on every push.
