from fastapi import FastAPI, UploadFile, WebSocket, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import supabase
import tempfile
from pydub import AudioSegment
import json
import os

app = FastAPI()

# =========================
# ✅ CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ✅ ROOT + HEALTH
# =========================
@app.get("/")
def read_root():
    return {"message": "Backend is running 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}

# =========================
# ✅ TRANSCRIBE + SAVE
# =========================
@app.post("/transcribe")
async def transcribe(file: UploadFile, user_id: str = Form(...)):
    filepath = None

    try:
        # ❌ Validate file
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")

        if not file.content_type.startswith("audio"):
            raise HTTPException(status_code=400, detail="Invalid file type")

        # ✅ Read file ONCE
        contents = await file.read()

        # ❌ Size limit (5MB)
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large")

        # ✅ Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
            temp.write(contents)
            filepath = temp.name

        # 🔥 TODO: Replace with real STT
        transcript_text = "hello user audio"

        # ✅ Safe audio processing
        try:
            audio = AudioSegment.from_file(filepath)
            duration = len(audio) // 1000
        except Exception:
            duration = 0  # fallback

        data = {
            "text": transcript_text,
            "duration_seconds": duration,
            "filename": file.filename,
            "language": "en",
            "user_id": user_id,
        }

        print("💾 Saving to DB:", data)

        response = supabase.table("transcripts").insert(data).execute()

        return {
            "status": "success",
            "text": transcript_text,
            "data": response.data,
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        print("❌ Transcribe error:", e)
        raise HTTPException(status_code=500, detail="Server error")

    finally:
        # 🧹 Cleanup
        if filepath and os.path.exists(filepath):
            os.remove(filepath)

# =========================
# ✅ GET ALL TRANSCRIPTS
# =========================
@app.get("/transcripts")
def get_transcripts():
    try:
        response = (
            supabase.table("transcripts")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return response.data

    except Exception as e:
        print("❌ Fetch all error:", e)
        raise HTTPException(status_code=500, detail="Server error")

# =========================
# ✅ GET TRANSCRIPTS BY USER
# =========================
@app.get("/transcripts/{user_id}")
def get_user_transcripts(user_id: str):
    try:
        print("👤 Fetching for:", user_id)

        response = (
            supabase.table("transcripts")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data

    except Exception as e:
        print("❌ Fetch user error:", e)
        raise HTTPException(status_code=500, detail="Server error")

# =========================
# ✅ WEBSOCKET (REAL-TIME)
# =========================
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket Connected")

    try:
        # 🔥 Get user_id
        init_data = await websocket.receive_text()
        user_id = json.loads(init_data).get("user_id")

        if not user_id:
            await websocket.send_json({"error": "Missing user_id"})
            await websocket.close()
            return

        print("👤 User:", user_id)

        while True:
            filepath = None

            try:
                data = await websocket.receive_bytes()
                print(f"🎤 Audio received: {len(data)} bytes")

                # Save temp file
                with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as f:
                    f.write(data)
                    filepath = f.name

                # Process audio
                try:
                    audio = AudioSegment.from_file(filepath)
                    duration = len(audio) // 1000
                except Exception:
                    duration = 0

                transcript_text = "Live audio received"

                db_data = {
                    "text": transcript_text,
                    "duration_seconds": duration,
                    "filename": "live_recording.webm",
                    "language": "en",
                    "user_id": user_id,
                }

                print("💾 Saving live:", db_data)

                supabase.table("transcripts").insert(db_data).execute()

                await websocket.send_json({
                    "type": "final",
                    "text": transcript_text
                })

            except Exception as e:
                print("❌ WS error:", e)
                await websocket.send_json({
                    "error": "Processing failed"
                })

            finally:
                # 🧹 Cleanup
                if filepath and os.path.exists(filepath):
                    os.remove(filepath)

    except Exception as e:
        print("❌ WebSocket disconnected:", e)