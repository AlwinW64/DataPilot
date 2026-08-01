
from fastapi import UploadFile

async def upload(file: UploadFile):

    validate_file(file)
    dataset_id = generate_dataset_id()
    filepath = build_upload_path(dataset_id, file.filename)

    await save_file(file, filepath)

    df = load_dataframe(filepath)

    metadata = extract_metadata(df)

    return build_response(
        dataset_id,
        file.filename,
        metadata
    )

def validate_file(file: UploadFile):
    pass


def generate_dataset_id():
    pass

def build_upload_path(dataset_id, filename):
    pass

def save_file():
    pass

def load_dataframe():
    pass

def extract_metadata(df):
    pass

def build_response():
    pass
