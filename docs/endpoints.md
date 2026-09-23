
# DataPilot Backend API Endpoints

## API Endpoint Index

| Method | Endpoint | Purpose | Frontend Trigger | Status |
|--------|----------|---------|------------------|--------|
| POST | `/conversations` | Create a new empty conversation | New Conversation button | Implemented |
| GET | `/conversations` | Get user's conversations for sidebar | Load/refresh conversation pane | Implemented |
| GET | `/conversations/{conversation_id}/messages` | Get messages belonging to a conversation | Click conversation in sidebar | Implemented |
| POST | `/conversations/{conversation_id}/messages` | Send message and generate AI response | Send button | Implemented |
| DELETE | `/conversations/{conversation_id}` | Delete a conversation | Delete button | Planned |
| PATCH | `/conversations/{conversation_id}` | Rename/update conversation metadata | Rename conversation | Planned |
| POST | `/datasets` | Upload and register a dataset | Upload dataset button | API Pending |
| GET | `/datasets` | Get user's datasets | Dataset selection panel | Future |
| GET | `/datasets/{dataset_id}` | Get dataset metadata and profiling information | Open dataset details | Future |
| POST | `/datasets/{dataset_id}/analysis` | Execute analytical operations on dataset | Ask analysis question | Future |
| POST | `/datasets/{dataset_id}/charts` | Generate visualizations | Request chart | Future |
| POST | `/auth/register` | Create user account | Signup page | Future |
| POST | `/auth/login` | Authenticate user | Login page | Future |

---

# Conversations

Conversation endpoints manage user sessions, chat history, and AI interactions.

---

## Create Conversation

### Endpoint

```
POST /conversations
```

### Purpose

Create a new empty conversation.

### Frontend Trigger

**New Conversation** button.

### Request Body

```json
{}
```

### Response

```json
{
  "conversation_id": "uuid",
  "created_at": "timestamp",
  "title": "New Conversation"
}
```

### Processing Flow

1. Create conversation record.
2. Generate unique conversation ID.
3. Return conversation details.

### Notes

- Creates a conversation without messages.
- The returned `conversation_id` is used for future message requests.

### Status

Implemented

---

# Get User Conversations

## Endpoint

```
GET /conversations
```

## Purpose

Retrieve all conversations belonging to the current user.

## Frontend Trigger

Load or refresh the conversation sidebar.

## Response

```json
[
  {
    "conversation_id": "uuid",
    "title": "Sales Analysis",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

## Notes

Future authentication will filter conversations by user ownership.

## Status

Implemented

---

# Get Conversation Messages

## Endpoint

```
GET /conversations/{conversation_id}/messages
```

## Purpose

Retrieve all messages belonging to a specific conversation.

## Frontend Trigger

User clicks a conversation from the sidebar.

## Path Parameters

| Parameter | Description |
|-----------|-------------|
| conversation_id | Unique conversation identifier |

## Response

```json
[
  {
    "message_id": "uuid",
    "role": "user",
    "content": "Analyze sales trends",
    "created_at": "timestamp"
  },
  {
    "message_id": "uuid",
    "role": "assistant",
    "content": "Here are the identified trends...",
    "created_at": "timestamp"
  }
]
```

## Status

Implemented

---

# Send Message / Generate AI Response

## Endpoint

```
POST /conversations/{conversation_id}/messages
```

## Purpose

Send a user message and generate an AI response.

## Frontend Trigger

**Send** button.

## Request Body

```json
{
  "content": "Analyze the dataset and find trends"
}
```

## Processing Flow

1. Store user message.
2. Retrieve conversation context.
3. Retrieve associated dataset information.
4. Build LLM prompt.
5. Call LLM service.
6. Execute analysis functions if required.
7. Store assistant response.
8. Return generated response.

## Response

```json
{
  "message_id": "uuid",
  "role": "assistant",
  "content": "The analysis shows...",
  "created_at": "timestamp"
}
```

## Status

Implemented

---

# Delete Conversation

## Endpoint

```
DELETE /conversations/{conversation_id}
```

## Purpose

Delete an existing conversation.

## Frontend Trigger

Delete button.

## Notes

Future considerations:

- Soft delete instead of permanent deletion.
- Remove related messages.
- Maintain audit history.

## Status

Planned

---

# Update Conversation Metadata

## Endpoint

```
PATCH /conversations/{conversation_id}
```

## Purpose

Update conversation metadata.

## Frontend Trigger

Rename conversation.

## Request Body

```json
{
  "title": "Updated Analysis"
}
```

## Response

```json
{
  "conversation_id": "uuid",
  "title": "Updated Analysis"
}
```

## Status

Planned

---

# Dataset Endpoints

Dataset endpoints handle dataset ingestion, storage, and management.

---

# Upload Dataset

## Endpoint

```
POST /datasets
```

## Purpose

Upload a dataset for analysis.

## Frontend Trigger

Upload dataset button.

## Request

Multipart form upload:

```
file: dataset.csv
```

## Processing Flow

1. Validate uploaded file.
2. Extract dataset metadata.
3. Store dataset information.
4. Upload file to object storage.
5. Generate profiling information.

## Status

API Pending

---

# Get User Datasets

## Endpoint

```
GET /datasets
```

## Purpose

Retrieve datasets available to the user.

## Frontend Trigger

Dataset selection panel.

## Response

```json
[
  {
    "dataset_id": "uuid",
    "name": "sales.csv",
    "rows": 10000,
    "columns": 12
  }
]
```

## Status

Future

---

# Get Dataset Details

## Endpoint

```
GET /datasets/{dataset_id}
```

## Purpose

Retrieve dataset metadata and profiling information.

## Response

```json
{
  "dataset_id": "uuid",
  "columns": [
    {
      "name": "price",
      "type": "float"
    }
  ],
  "missing_values": {},
  "statistics": {}
}
```

## Status

Future

---

# Analysis Endpoints

Analysis endpoints execute analytical operations over datasets.

---

# Run Dataset Analysis

## Endpoint

```
POST /datasets/{dataset_id}/analysis
```

## Purpose

Execute analytical operations such as:

- Aggregations
- Filtering
- Correlation analysis
- Statistical summaries

## Request Body

```json
{
  "operation": "groupby",
  "parameters": {
    "column": "fuel_type",
    "metric": "average_price"
  }
}
```

## Response

```json
{
  "result": {
    "Diesel": 12960.03,
    "Petrol": 13916.86
  }
}
```

## Status

Future

---

# Visualization Endpoints

Visualization endpoints generate charts from analysis results.

---

# Generate Chart

## Endpoint

```
POST /datasets/{dataset_id}/charts
```

## Purpose

Generate visualizations.

## Request Body

```json
{
  "chart_type": "bar",
  "x_axis": "region",
  "y_axis": "sales"
}
```

## Response

```json
{
  "chart_url": "generated_chart_location",
  "chart_type": "bar"
}
```

## Status

Future

---

# Authentication Endpoints

Authentication endpoints manage user identity and access.

---

# Register User

## Endpoint

```
POST /auth/register
```

## Purpose

Create a new user account.

## Status

Future

---

# Login User

## Endpoint

```
POST /auth/login
```

## Purpose

Authenticate user and issue access credentials.

## Status

Future

---

# API Architecture Overview

```
Frontend
    |
    |
FastAPI Routes
    |
    |
Service Layer
    |
    |---- Dataset Service
    |---- Profiling Service
    |---- Analysis Service
    |---- Chart Service
    |---- LLM Service
    |
    |
PostgreSQL Database
```

---

# Resource Relationships

```
User
 |
 |-- Conversations
 |       |
 |       |-- Messages
 |
 |-- Datasets
         |
         |-- Analysis Results
         |
         |-- Generated Charts
```