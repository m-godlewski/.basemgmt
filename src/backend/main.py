import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import item

app = FastAPI(title=".basemgmt Backend API", version="0.0.1")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(item.router, prefix="/api/items", tags=["items"])

# main entry point
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
