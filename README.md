# DataPilot

> AI-powered analytics copilot for exploring, profiling, visualizing, and asking questions about CSV datasets.

DataPilot is a lightweight FastAPI-based analytics service that turns an uploaded CSV into a structured dataset you can inspect programmatically. It provides dataset profiling, data-quality insights, chart generation, and an LLM integration powered by Google Gemini.

## ✨ Features

* **CSV uploads** — upload a CSV file and receive a unique dataset ID.
* **Dataset profiling** — inspect row/column counts, column names, data types, missing values, duplicate rows, descriptive statistics, memory usage, and a five-row preview.
* **Data validation & analysis** — validate columns and numeric fields, filter rows, calculate correlations, and aggregate numeric values by group.
* **Chart generation** — generate **bar**, **line**, **scatter**, and **histogram** charts and receive the resulting Plotly figure as JSON.
* **AI-assisted analysis** — build dataset context and send questions to **Gemini 2.5 Flash** for concise, context-aware answers.
* **Simple API architecture** — FastAPI routers are separated from dataset, profiling, chart, analysis, context, and LLM services.

## 🧱 Tech Stack

| Area                 | Technology                       |
| -------------------- | -------------------------------- |
| API                  | FastAPI                          |
| ASGI server          | Uvicorn                          |
| Data processing      | Pandas, NumPy                    |
| Visualization        | Plotly                           |
| Validation / schemas | Pydantic                         |
| Generative AI        | Google Gemini via `google-genai` |
| Configuration        | `python-dotenv`                  |
| Runtime              | Python                           |

## 📁 Project Structure

```text
DataPilot/
├── app/
│   ├── api/
│   │   ├── chart.py
│   │   ├── chat.py
│   │   ├── dataset.py
│   │   ├── health.py
│   │   ├── ml.py
│   │   ├── report.py
│   │   └── upload.py
│   ├── schemas/
│   │   ├── chart_request.py
│   │   └── profile.py
│   ├── services/
│   │   ├── analysis_service.py
│   │   ├── chart_service.py
│   │   ├── context_service.py
│   │   ├── dataset_service.py
│   │   ├── llm_service.py
│   │   └── profiling_service.py
│   ├── app.py
│   └── config.py
├── uploads/
├── Dockerfile
├── requirements.txt
└── README.md
```

## 🚀 Getting Started

### Prerequisites

* Python 3.10+ recommended
* `pip`
* A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/AlwinW64/DataPilot.git
cd DataPilot
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:

**macOS / Linux**

```bash
source venv/bin/activate
```

**Windows PowerShell**

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Gemini

Create a `.env` file in the project root:

```env
API_KEY=your_gemini_api_key
```

DataPilot currently uses the `gemini-2.5-flash` model through Google's `google-genai` client.

### 5. Start the API

```bash
uvicorn app.app:app --reload
```
        OR
```bash
python main.py
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### 6. Start the React Frontend

Open a terminal in the `frontend` directory:

```bash
cd frontend
npm run dev
```

The conversational analytics workspace will be available at:

```text
http://localhost:5173
```


## 🔌 API Overview

### Health / root

```http
GET /
```

Returns basic application status and version information.

### Upload a dataset

```http
POST /upload/
```

Upload a CSV file as multipart form data.

Example with `curl`:

```bash
curl -X POST "http://127.0.0.1:8000/upload/" \
  -H "accept: application/json" \
  -F "file=@data.csv"
```

A successful upload returns a generated `dataset_id` together with dataset metadata.

### Profile a dataset

```http
GET /{dataset_id}/profile
```

Returns:

* row and column counts
* column names
* numeric and categorical columns
* missing-value counts
* duplicate-row count
* descriptive statistics
* memory usage
* first five rows

### Generate a chart

```http
POST /datasets/{dataset_id}/charts
```

Example request:

```json
{
  "chart_type": "scatter",
  "x": "age",
  "y": "income",
  "color": "department",
  "title": "Age vs Income"
}
```

Supported chart types:

* `bar`
* `line`
* `scatter`
* `histogram`

The endpoint returns a Plotly figure serialized as JSON.

## 🧠 Data Analysis

The analysis service currently includes reusable operations for:

* validating requested columns
* validating numeric columns
* filtering rows using `==`, `!=`, `>`, `>=`, `<`, `<=`, and `contains`
* calculating Pearson correlation between two numeric columns
* grouping and aggregating values with `mean`, `sum`, `count`, `min`, `max`, and `median`

These capabilities form the foundation for higher-level analytical workflows.

## 🤖 AI Analysis

DataPilot integrates with Google Gemini through the `google-genai` SDK.

The current AI service builds a prompt from structured dataset context and the user's question. It is designed to:

* answer using only the supplied dataset context
* avoid inventing values
* stay concise and highlight important insights
* acknowledge when the available context is insufficient

The configured model is:

```text
gemini-2.5-flash
```

> **Note:** The repository currently exposes the LLM service as an internal service module; the chat/ML API surface is still under active development.

## 💾 Dataset Storage

Uploaded datasets are stored locally under:

```text
uploads/<dataset_id>/dataset.csv
uploads/<dataset_id>/metadata.json
```

The generated dataset ID is a UUID.

CSV files are validated before processing, and malformed, empty, or non-UTF-8 files are rejected with an appropriate API error.

## 🐳 Docker

A `Dockerfile` is included in the repository. The containerization workflow is not fully documented in the current project, so the local Python/Uvicorn workflow above is the clearest way to run the application today.

## 📌 Current Status

DataPilot is an early-stage project under active development. The core dataset upload, profiling, analysis, charting, and Gemini service layers are present, while some API modules and higher-level AI workflows are still being expanded.

## 🛣️ Roadmap Ideas

Potential next steps include:

* expose the analysis and AI services through stable public endpoints
* add automated tests and CI
* support more data formats
* add richer chart configuration
* add dataset management endpoints
* add report/export generation
* add a frontend for interactive exploration and AI chat
* improve persistence and production deployment configuration

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Add or update tests where appropriate.
5. Open a pull request with a clear description of the change.

## 📄 License

DataPilot is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the full license text.


## 🔗 Repository

[github.com/AlwinW64/DataPilot](https://github.com/AlwinW64/DataPilot)
