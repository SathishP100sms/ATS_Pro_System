# Use an official Python runtime as a parent image
FROM python:3.11-slim
# Set the working directory in the container
WORKDIR /api
# Install any needed packages specified in requirements.txt
COPY requirements.txt .
# Install PyTorch with CPU support
RUN pip install --no-cache-dir \
    torch --index-url https://download.pytorch.org/whl/cpu
    
# Install other dependencies
RUN pip install --no-cache-dir -r requirements.txt
COPY . /api
# Make port 8000 available to the world outside this container
EXPOSE 8000
# Run the application when the container launches
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]