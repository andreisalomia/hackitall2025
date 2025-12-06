from flask import Blueprint, request, jsonify
from db import db
from services.speech_service import SpeechService
from services.claude_service import ClaudeService
from datetime import datetime, timedelta
from bson import ObjectId

recordings_bp = Blueprint('recordings', __name__)

speech_service = SpeechService()
claude_service = ClaudeService()

@recordings_bp.route('/recordings/upload', methods=['POST'])
def upload_recording():
    """
    Primește un fișier audio, îl transcrie și îl clasifică.
    
    Expected: FormData cu 'audio' file
    Returns: {
        "success": true,
        "transcription": "...",
        "classification": {...},
        "saved_id": "..."
    }
    """
    
    try:
        # Verificăm dacă avem fișier audio
        if 'audio' not in request.files:
            return jsonify({"error": "Nu s-a găsit fișierul audio"}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({"error": "Fișier invalid"}), 400
        
        # STEP 1: Transcrie audio-ul
        try:
            transcription = speech_service.transcribe_audio(audio_file)
            print(f"Transcription: {transcription}")
        except Exception as e:
            return jsonify({"error": f"Eroare la transcriere: {str(e)}"}), 500
        
        # STEP 2: Clasifică și extrage informații cu Claude
        try:
            classification = claude_service.classify_and_extract(transcription)
            print(f"Classification: {classification}")
        except Exception as e:
            return jsonify({"error": f"Eroare la clasificare: {str(e)}"}), 500
        
        # STEP 3: Salvează în MongoDB
        recording_type = classification['type']
        
        if recording_type == 'JURNAL':
            saved_id = _save_journal_entry(transcription, classification['data'])
        elif recording_type == 'TODO':
            saved_id = _save_todo(transcription, classification['data'])
        else:
            return jsonify({"error": "Tip necunoscut de înregistrare"}), 500
        
        return jsonify({
            "success": True,
            "transcription": transcription,
            "classification": classification,
            "saved_id": str(saved_id)
        }), 200
        
    except Exception as e:
        print(f"Error in upload_recording: {e}")
        return jsonify({"error": str(e)}), 500


def _save_journal_entry(transcription, data):
    """Salvează o intrare de jurnal în DB."""
    
    entry = {
        "type": "JURNAL",
        "transcription": transcription,
        "content": data.get('content'),
        "sentiment": data.get('sentiment'),
        "summary": data.get('summary'),
        "keywords": data.get('keywords', []),
        "timestamp": datetime.utcnow(),
        "date": datetime.utcnow().strftime("%Y-%m-%d")
    }
    
    result = db.journal_entries.insert_one(entry)
    return result.inserted_id


def _save_todo(transcription, data):
    """Salvează un TODO în DB."""
    
    # Parsăm datele de timp dacă există
    due_datetime = None
    if data.get('due_date'):
        try:
            date_str = data['due_date']
            time_str = data.get('due_time', '09:00')  # default dimineața
            due_datetime = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        except Exception as e:
            print(f"Error parsing date/time: {e}")
    
    todo = {
        "type": "TODO",
        "transcription": transcription,
        "task": data.get('task'),
        "priority": data.get('priority', 'medie'),
        "due_date": data.get('due_date'),
        "due_time": data.get('due_time'),
        "due_datetime": due_datetime,
        "reminder_minutes_before": data.get('reminder_minutes_before', 15),
        "category": data.get('category', 'altele'),
        "completed": False,
        "created_at": datetime.utcnow()
    }
    
    result = db.todos.insert_one(todo)
    return result.inserted_id


@recordings_bp.route('/journal/today', methods=['GET'])
def get_today_journal():
    """
    Returnează toate intrările de jurnal de astăzi.
    """
    
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        entries = list(db.journal_entries.find(
            {"date": today},
            {"_id": 0}  # excludem _id pentru JSON serialization
        ).sort("timestamp", -1))
        
        # Convertim datetime objects la string
        for entry in entries:
            if 'timestamp' in entry:
                entry['timestamp'] = entry['timestamp'].isoformat()
        
        return jsonify({
            "success": True,
            "date": today,
            "count": len(entries),
            "entries": entries
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@recordings_bp.route('/journal/summary', methods=['GET'])
def get_daily_summary():
    """
    Generează un rezumat al zilei pe baza intrărilor din jurnal.
    Query params: date (YYYY-MM-DD, opțional - default: azi)
    """
    
    try:
        # Get date from query params sau folosim azi
        target_date = request.args.get('date', datetime.utcnow().strftime("%Y-%m-%d"))
        
        # Obținem intrările
        entries = list(db.journal_entries.find(
            {"date": target_date}
        ).sort("timestamp", 1))
        
        if not entries:
            return jsonify({
                "success": True,
                "date": target_date,
                "summary": "Nu există intrări în jurnal pentru această zi."
            }), 200
        
        # Generăm rezumatul cu Claude
        summary = claude_service.generate_daily_summary(entries)
        
        return jsonify({
            "success": True,
            "date": target_date,
            "entries_count": len(entries),
            "summary": summary
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@recordings_bp.route('/todos/active', methods=['GET'])
def get_active_todos():
    """
    Returnează toate TODO-urile active (necompletate).
    """
    
    try:
        todos = list(db.todos.find(
            {"completed": False}
        ).sort("due_datetime", 1))
        
        # Convertim ObjectId și datetime
        for todo in todos:
            todo['_id'] = str(todo['_id'])
            if 'created_at' in todo and todo['created_at']:
                todo['created_at'] = todo['created_at'].isoformat()
            if 'due_datetime' in todo and todo['due_datetime']:
                todo['due_datetime'] = todo['due_datetime'].isoformat()
        
        return jsonify({
            "success": True,
            "count": len(todos),
            "todos": todos
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@recordings_bp.route('/todos/<todo_id>/complete', methods=['PUT'])
def complete_todo(todo_id):
    """
    Marchează un TODO ca fiind completat.
    """
    
    try:
        result = db.todos.update_one(
            {"_id": ObjectId(todo_id)},
            {
                "$set": {
                    "completed": True,
                    "completed_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "TODO-ul nu a fost găsit"}), 404
        
        return jsonify({
            "success": True,
            "message": "TODO completat cu succes"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@recordings_bp.route('/todos/upcoming', methods=['GET'])
def get_upcoming_todos():
    """
    Returnează TODO-urile care trebuie să fie reminder-uite în următoarele ore.
    Util pentru sistem de notificări.
    """
    
    try:
        # TODO-uri în următoarele 24 ore
        now = datetime.utcnow()
        tomorrow = now + timedelta(hours=24)
        
        todos = list(db.todos.find({
            "completed": False,
            "due_datetime": {
                "$gte": now,
                "$lte": tomorrow
            }
        }).sort("due_datetime", 1))
        
        # Convertim pentru JSON
        for todo in todos:
            todo['_id'] = str(todo['_id'])
            if 'created_at' in todo and todo['created_at']:
                todo['created_at'] = todo['created_at'].isoformat()
            if 'due_datetime' in todo and todo['due_datetime']:
                todo['due_datetime'] = todo['due_datetime'].isoformat()
        
        return jsonify({
            "success": True,
            "count": len(todos),
            "todos": todos
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500