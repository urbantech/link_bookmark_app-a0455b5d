"""
link_bookmark_app — Backend API
Built on AINative Platform. Uses ZeroDB for storage, AINative JWT for auth.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routers.authentication import router as authentication_router
from app.routers.link_saving import router as link_saving_router
from app.routers.tagging import router as tagging_router
from app.routers.link_deletion import router as link_deletion_router
from app.routers.bookmark_listing import router as bookmark_listing_router
from app.routers.filter_by_tag import router as filter_by_tag_router

app = FastAPI(
    title="link_bookmark_app API",
    version="0.1.0",
    description="Backend API for link_bookmark_app, powered by AINative platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.ainative.studio"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication_router, prefix='/api/v1')
app.include_router(link_saving_router, prefix='/api/v1')
app.include_router(tagging_router, prefix='/api/v1')
app.include_router(link_deletion_router, prefix='/api/v1')
app.include_router(bookmark_listing_router, prefix='/api/v1')
app.include_router(filter_by_tag_router, prefix='/api/v1')

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "link_bookmark_app"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
