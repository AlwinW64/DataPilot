# DataPilot

> AI-powered data analyst platform for exploring, profiling, visualizing, and interacting with datasets through natural language.

DataPilot is an AI-powered analytics platform that allows users to upload datasets, understand their structure, perform data analysis, generate visualizations, and ask questions about their data using natural language.

The platform combines a FastAPI backend, PostgreSQL persistence, AWS S3 storage, analytical services powered by Pandas, and Google Gemini function calling to provide an interactive data exploration experience.

---

# ✨ Features

## 📂 Dataset Management

- Upload CSV datasets through an API endpoint.
- Validate datasets before processing.
- Automatically generate dataset metadata.
- Store dataset information in PostgreSQL.
- Store raw dataset files securely in AWS S3.

## 🔍 Dataset Profiling

DataPilot automatically analyzes uploaded datasets and provides:

- Row and column information
- Column names and data types
- Missing value detection
- Duplicate row detection
- Descriptive statistics
- Dataset preview information

## 📊 Data Analysis

The analysis engine currently supports:

- Column validation
- Numeric field validation
- Filtering operations
- Correlation analysis
- Group-by aggregations
- Descriptive statistics

These operations are exposed internally as reusable analytical tools.

## 📈 Visualization

DataPilot supports interactive visualization generation using Plotly.

Generated Plotly figures can be rendered directly by the frontend.

Supported chart types include:

- Bar charts
- Line charts
- Scatter plots
- Histograms

## 🤖 AI-Powered Data Analysis

DataPilot integrates Google Gemini with function calling capabilities.

The AI workflow:

1. User sends a question about a dataset.
2. Dataset context and available analysis tools are prepared.
3. The request is sent to Gemini.
4. Gemini decides whether to:
   - Answer directly using available context.
   - Invoke an analytical tool.
5. The final response is returned to the user.

Currently supported AI tools:

- Filtering
- Aggregations
- Correlation analysis

---

# 🏗️ Architecture

DataPilot follows a service-oriented backend architecture.

```
                              User
                               |
                               |
                         React Frontend
                               |
                               |
                        FastAPI Backend
                               |
        +----------------------+-----------------+
        |                      |                 |
        |                      |                 |
 Dataset Service           Chat Service    Analysis Services
        |                      |                 |
        |                      |                 |
        |                      |           Pandas Operations
        |                      |
   +----+----+                 |
   |         |                 |
PostgreSQL   AWS S3            |
(metadata)(dataset files)      |
                               |
                           Gemini API
                               |
                        Function Calling
                               |
                    Analysis Tool Execution
```

---

# 🧠 AI Conversation Flow

Conversations and messages are persisted to maintain context.

A typical request flow:

```
User Message
      |
      v
Conversation Service
      |
      v
Build Dataset Context
      |
      v
Gemini Model
      |
      |
      +---- Direct Response
      |
      |
      +---- Function Call
                |
                v
        Analysis Tool Execution
                |
                v
          Final AI Response
```

---

# 🗄️ Data Storage Architecture

## PostgreSQL

PostgreSQL stores application metadata and relationships using SQLAlchemy ORM.

Main entities:

### Datasets

Stores dataset information such as:

- Dataset ID
- Filename
- Storage path
- Upload timestamp
- Dataset metadata

### Conversations

Stores user conversations.

### Messages

Stores conversation messages including:

- User messages
- AI responses
- Conversation history

### Conversation-Datasets Relationship

A many-to-many association table connects datasets and conversations.

This allows:

- Multiple datasets to be used in conversations.
- A dataset to be referenced across multiple conversations.

---

## AWS S3

Dataset files are stored externally in AWS S3.

Current structure:

```
bucket/
└── datasets/
    └── <dataset_id>/
        ├── dataset.csv
        └── metadata.json
```

S3 interaction is handled through `boto3`.

---

# 📁 Project Structure

```
DataPilot/
│
├── app/
│   │
│   ├── api/
│   │   ├── chart.py
│   │   ├── chat.py
│   │   ├── dataset.py
│   │   ├── health.py
│   │   ├── report.py
│   │   └── upload.py
│   │
│   ├── models/
│   │   ├── associations.py
│   │   ├── conversation.py
│   │   ├── dataset.py
│   │   └── create_tables.py
│   │
│   ├── schemas/
│   │   ├── chart.py
│   │   ├── chat.py
│   │   ├── health.py
│   │   ├── profile.py
│   │   └── upload.py
│   │
│   ├── services/
│   │   ├── ai_tools.py
│   │   ├── analysis_service.py
│   │   ├── chart_service.py
│   │   ├── context_service.py
│   │   ├── conversation_service.py
│   │   ├── database_service.py
│   │   ├── dataset_service.py
│   │   ├── dataset_service_s3.py
│   │   ├── llm_service.py
│   │   └── profiling_service.py
│   │
│   ├── database.py
│   ├── config.py
│   └── app.py
│
├── frontend/
│
├── requirements.txt
├── Dockerfile
└── README.md
```

---

# 🛠️ Tech Stack

| Area | Technology |
|---|---|
| Backend | FastAPI |
| Server | Uvicorn |
| Language | Python |
| Data Processing | Pandas, NumPy |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Storage | AWS S3 |
| Cloud Storage SDK | boto3 |
| Visualization | Plotly |
| AI Model | Google Gemini |
| Frontend | React + TypeScript |

---

# 🚀 Getting Started

## Prerequisites

- Python 3.10+
- pip
- PostgreSQL database
- AWS S3 bucket
- Google Gemini API key

---

## 1. Clone Repository

```bash
git clone https://github.com/AlwinW64/DataPilot.git

cd DataPilot
```

---

## 2. Create Virtual Environment

```bash
python -m venv venv
```

Activate:

### Windows

```powershell
.\venv\Scripts\Activate.ps1
```

### Linux/macOS

```bash
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key

DATABASE_URL=your_postgresql_connection_string

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
```

---

## 5. Run Backend

```bash
uvicorn app.app:app --reload
```

API available at:

```
http://127.0.0.1:8000
```

Interactive documentation:

```
http://127.0.0.1:8000/docs
```

---

# 🔌 API Overview

## Upload Dataset

```
POST /upload/
```

Uploads and validates a CSV dataset.

The endpoint:

- Validates the file.
- Generates a dataset ID.
- Stores metadata in PostgreSQL.
- Stores the dataset file in AWS S3.

---

## Chat

```
POST /chat/
```

Accepts user questions and optional dataset context.

The request is processed through the Gemini-powered analysis workflow.

---

## Dataset Operations

Dataset-related endpoints provide access to:

- Dataset metadata
- Profiles
- Analysis operations

---

# 🌐 Deployment

Current deployment setup:

| Component | Platform |
|---|---|
| Backend API | FastAPI Cloud |
| Database | Supabase PostgreSQL |
| Frontend | Vercel |
| Dataset Storage | AWS S3 |

---

# 📌 Current Status

DataPilot is actively under development.

Currently implemented:

✅ Dataset upload and validation  
✅ PostgreSQL persistence  
✅ AWS S3 dataset storage  
✅ Dataset profiling  
✅ Analytical operations  
✅ Conversation persistence  
✅ Gemini integration  
✅ Function calling based AI analysis  
✅ React + TypeScript frontend foundation  

---

# 🛣️ Roadmap

## Near Term

- Authentication and user management
- Improved AI agent capabilities
- Support for multiple data sources

## Long Term

- Frontend experience improvements
- Automated machine learning workflows
- Report generation
- Collaboration features

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement changes.
4. Test your changes.
5. Submit a pull request.

---

# 📄 License

DataPilot is licensed under the MIT License.

See the `LICENSE` file for details.

---

# 🔗 Repository

https://github.com/AlwinW64/DataPilot