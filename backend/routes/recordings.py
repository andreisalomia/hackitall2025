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
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Nu s-a gasit fisierul audio"}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({"error": "Fisier invalid"}), 400
        
        try:
            transcription = speech_service.transcribe_audio(audio_file)
            print(f"📝 Transcription: {transcription}")
        except Exception as e:
            return jsonify({"error": f"Eroare la transcriere: {str(e)}"}), 500
        
        try:
            classification = claude_service.classify_and_extract(transcription)
            print(f"🤖 Classification: {classification}")
        except Exception as e:
            return jsonify({"error": f"Eroare la clasificare: {str(e)}"}), 500
        
        recording_type = classification['type']
        
        if recording_type == 'JURNAL':
            saved_id = _save_journal_entry(transcription, classification['data'])
            print(f"Saved journal entry: {saved_id}")
        elif recording_type == 'TODO':
            saved_id = _save_todo(transcription, classification['data'])
            print(f"Saved TODO: {saved_id}")
        else:
            return jsonify({"error": "Tip necunoscut de inregistrare"}), 500
        
        return jsonify({
            "success": True,
            "transcription": transcription,
            "classification": classification,
            "saved_id": str(saved_id)
        }), 200
        
    except Exception as e:
        print(f"❌ Error in upload_recording: {e}")
        return jsonify({"error": str(e)}), 500


def _save_journal_entry(transcription, data):
    entry = {
        "type": "JURNAL",
        "transcription": transcription,
        "content": data.get('content'),
        "sentiment": data.get('sentiment', 'neutru'),
        "summary": data.get('summary'),
        "keywords": data.get('keywords', []),

        "mood": data.get('mood', 'neutru'),
        "energy_level": data.get('energy_level', 'mediu'),
        
        "timestamp": datetime.utcnow(),
        "date": datetime.utcnow().strftime("%Y-%m-%d")
    }
    
    result = db.journal_entries.insert_one(entry)
    return result.inserted_id


def _save_todo(transcription, data):
    due_datetime = None
    if data.get('due_date'):
        try:
            date_str = data['due_date']
            time_str = data.get('due_time', '09:00')
            due_datetime = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        except Exception as e:
            print(f"Error parsing date/time: {e}")
    
    recurrent = data.get('recurrent', {})
    if not isinstance(recurrent, dict):
        recurrent = {
            'is_recurrent': False,
            'frequency': None,
            'days_of_week': None
        }
    
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
        
        "estimated_duration": data.get('estimated_duration'),
        "recurrent": recurrent,
        "subtasks": data.get('subtasks', []),
        
        "completed": False,
        "created_at": datetime.utcnow()
    }
    
    result = db.todos.insert_one(todo)
    return result.inserted_id


@recordings_bp.route('/journal/today', methods=['GET'])
def get_today_journal():
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        entries = list(db.journal_entries.find(
            {"date": today},
            {"_id": 0}
        ).sort("timestamp", -1))
        
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
    try:
        target_date = request.args.get('date', datetime.utcnow().strftime("%Y-%m-%d"))
        
        entries = list(db.journal_entries.find(
            {"date": target_date}
        ).sort("timestamp", 1))
        
        if not entries:
            return jsonify({
                "success": True,
                "date": target_date,
                "summary": "Nu exista intrari in jurnal pentru aceasta zi."
            }), 200
        
        summary = claude_service.generate_daily_summary(entries)
        
        return jsonify({
            "success": True,
            "date": target_date,
            "entries_count": len(entries),
            "summary": summary
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@recordings_bp.route('/journal/stats', methods=['GET'])
def get_journal_stats():
    try:
        period = request.args.get('period', 'week')

        now = datetime.utcnow()
        if period == 'week':
            start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
        elif period == 'month':
            start_date = (now - timedelta(days=30)).strftime("%Y-%m-%d")
        elif period == 'year':
            start_date = (now - timedelta(days=365)).strftime("%Y-%m-%d")
        else:
            start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
        
        pipeline = [
            {
                "$match": {
                    "date": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_entries": {"$sum": 1},
                    "sentiments": {
                        "$push": "$sentiment"
                    },
                    "moods": {
                        "$push": "$mood"
                    },
                    "energy_levels": {
                        "$push": "$energy_level"
                    }
                }
            }
        ]
        
        result = list(db.journal_entries.aggregate(pipeline))
        
        if not result:
            return jsonify({
                "success": True,
                "period": period,
                "stats": {
                    "total_entries": 0,
                    "sentiment_breakdown": {},
                    "mood_breakdown": {},
                    "energy_breakdown": {}
                }
            }), 200
        
        stats = result[0]
        
        from collections import Counter
        
        sentiment_counter = Counter(stats['sentiments'])
        mood_counter = Counter(stats['moods'])
        energy_counter = Counter(stats['energy_levels'])
        
        return jsonify({
            "success": True,
            "period": period,
            "start_date": start_date,
            "stats": {
                "total_entries": stats['total_entries'],
                "sentiment_breakdown": dict(sentiment_counter),
                "mood_breakdown": dict(mood_counter),
                "energy_breakdown": dict(energy_counter)
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@recordings_bp.route('/todos/weekly-report', methods=['GET'])
def get_weekly_todo_report():
    try:
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)

        todos = list(db.todos.find({
            "created_at": {"$gte": week_ago}
        }))

        if not todos:
            return jsonify({
                "success": True,
                "report": "Nu există suficiente date pentru raport."
            }), 200

        completed = [t for t in todos if t.get("completed")]
        pending = [t for t in todos if not t.get("completed")]

        from collections import Counter
        category_count = Counter(t.get("category", "necunoscut") for t in todos)
        priority_count = Counter(t.get("priority", "necunoscuta") for t in todos)

        report = {
            "period": f"{week_ago.strftime('%Y-%m-%d')} → {now.strftime('%Y-%m-%d')}",
            "total_tasks": len(todos),
            "completed_tasks": len(completed),
            "pending_tasks": len(pending),
            "completion_rate": round((len(completed) / len(todos)) * 100, 2) if todos else 0,
            "categories": dict(category_count),
            "priorities": dict(priority_count),
            "completed_list": [
                {"task": t.get("task"), "date": t.get("completed_at")}
                for t in completed
            ],
            "pending_list": [
                {"task": t.get("task"), "due": t.get("due_datetime")}
                for t in pending
            ]
        }

        return jsonify({"success": True, "report": report}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@recordings_bp.route('/todos/active', methods=['GET'])
def get_active_todos():
    try:
        query = {"completed": False}
        
        if request.args.get('category'):
            query['category'] = request.args.get('category')
        
        if request.args.get('priority'):
            query['priority'] = request.args.get('priority')
        
        if request.args.get('recurrent'):
            is_recurrent = request.args.get('recurrent').lower() == 'true'
            query['recurrent.is_recurrent'] = is_recurrent
        
        todos = list(db.todos.find(query).sort("due_datetime", 1))
        
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
            return jsonify({"error": "TODO-ul nu a fost gasit"}), 404
        
        return jsonify({
            "success": True,
            "message": "TODO completat cu succes"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@recordings_bp.route('/todos/upcoming', methods=['GET'])
def get_upcoming_todos():
    try:
        hours = int(request.args.get('hours', 24))
        
        now = datetime.utcnow()
        future = now + timedelta(hours=hours)
        
        todos = list(db.todos.find({
            "completed": False,
            "due_datetime": {
                "$gte": now,
                "$lte": future
            }
        }).sort("due_datetime", 1))
        
        for todo in todos:
            todo['_id'] = str(todo['_id'])
            if 'created_at' in todo and todo['created_at']:
                todo['created_at'] = todo['created_at'].isoformat()
            if 'due_datetime' in todo and todo['due_datetime']:
                todo['due_datetime'] = todo['due_datetime'].isoformat()
        
        return jsonify({
            "success": True,
            "time_window": f"{hours} hours",
            "count": len(todos),
            "todos": todos
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@recordings_bp.route('/todos/by-category', methods=['GET'])
def get_todos_by_category():
    try:
        pipeline = [
            {
                "$match": {"completed": False}
            },
            {
                "$group": {
                    "_id": "$category",
                    "count": {"$sum": 1},
                    "tasks": {
                        "$push": {
                            "id": {"$toString": "$_id"},
                            "task": "$task",
                            "priority": "$priority",
                            "due_date": "$due_date",
                            "due_time": "$due_time"
                        }
                    }
                }
            },
            {
                "$sort": {"count": -1}
            }
        ]
        
        result = list(db.todos.aggregate(pipeline))
        
        return jsonify({
            "success": True,
            "categories": result
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@recordings_bp.route('/journal/weekly-insights', methods=['GET'])
def get_weekly_insights():
    try:
        now = datetime.utcnow()
        week_ago = (now - timedelta(days=7)).strftime("%Y-%m-%d")
        
        entries = list(db.journal_entries.find({
            "date": {"$gte": week_ago}
        }).sort("date", 1))
        
        if not entries:
            return jsonify({
                "success": True,
                "insights": "Nu exista suficiente intrari pentru a genera insights."
            }), 200
        
        insights = claude_service.generate_weekly_insights(entries)
        
        return jsonify({
            "success": True,
            "period": f"{week_ago} - {now.strftime('%Y-%m-%d')}",
            "entries_analyzed": len(entries),
            "insights": insights
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500