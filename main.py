from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from models import UserCreate, UserResponse,UserLogin
from passlib.context import CryptContext
from datetime import datetime
from fastapi import UploadFile, File
import base64
import together
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_methods=["*"],
    allow_headers=["*"],
)



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#mongodb client setup
@app.on_event("startup")
def startup_db_client():
    
    app.mongodb_client = MongoClient("mongodb+srv://Aswanth:Aswanth@cluster0.fcjveve.mongodb.net/")
    app.mongodb = app.mongodb_client["mydatabase"]


@app.on_event("shutdown")
def shutdown_db_client():
    app.mongodb_client.close()

@app.get("/")
async def root():
    return {"message": "Hello, World!"}



@app.post("/api/auth/register", response_model=UserResponse)
def create_user(user: UserCreate):
    # Check if user exists
    if app.mongodb["users"].find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    # Hash password
    hashed_password = pwd_context.hash(user.password)
    user_dict = {
        "email": user.email,
        "name": user.name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    result = app.mongodb["users"].insert_one(user_dict)
    return UserResponse(
        id=str(result.inserted_id),
        email=user.email,
        name=user.name,
        created_at=user_dict["created_at"]
    )





@app.post("/api/auth/login")
def login(user: UserLogin):
    db_user = app.mongodb["users"].find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    if not pwd_context.verify(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return {
        "id": str(db_user["_id"]),
        "email": db_user["email"],
        "name": db_user["name"],
        "created_at": db_user["created_at"]
    }

@app.post("/api/images/analyze")
async def analyze_image(file: UploadFile = File(...)):
    print('analyzing image')
    client = together.Together(api_key="tgp_v1_pr51-Ha4T-_6epTaTtTvYZ3QUpuq8dCTPMUIkkH_0nY")
    contents = await file.read()
    base64_image = base64.b64encode(contents).decode('utf-8')
    response = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Explain this image in details"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ],
        model="meta-llama/Llama-Vision-Free",
        stream=True
    )
    # Collect streamed response
    result = ""
    for chunk in response:
        if (
            hasattr(chunk, "choices")
            and chunk.choices
            and hasattr(chunk.choices[0], "delta")
            and hasattr(chunk.choices[0].delta, "content")
            and chunk.choices[0].delta.content
        ):
            result += chunk.choices[0].delta.content
    print('analys completed')
    return {"analysis": result}


class GenerateRequest(BaseModel):
    prompt: str

@app.post("/api/images/generate")
async def generate_image(request: GenerateRequest):
    prompt = request.prompt
    client = together.Together(api_key="tgp_v1_pr51-Ha4T-_6epTaTtTvYZ3QUpuq8dCTPMUIkkH_0nY")
    response = client.images.generate(
        model="black-forest-labs/FLUX.1-schnell-Free",
        prompt=prompt,
        steps=4,
        n=2
    )
    print(response)
    return {"generated_image": response['output_url'] if 'output_url' in response else response}
