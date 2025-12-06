import anthropic
import os
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta
import re

load_dotenv()

class ClaudeService:
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )
    
    def _parse_relative_date(self, text):
        """
        Încearcă să parseze expresii de timp relative din text.
        Returns: (due_date, due_time) sau (None, None)
        """
        text_lower = text.lower()
        now = datetime.now()
        
        # Detectare timp
        due_time = None
        
        # Pattern-uri pentru ore
        time_patterns = [
            (r'la (\d+):(\d+)', lambda h, m: f"{int(h):02d}:{int(m):02d}"),
            (r'la (\d+) și (\d+)', lambda h, m: f"{int(h):02d}:{int(m):02d}"),
            (r'la (\d+) dimineața|dimineață la (\d+)', lambda h: f"{int(h):02d}:00"),
            (r'la (\d+) după-amiaza|după-amiaza la (\d+)', lambda h: f"{int(h) + 12 if int(h) < 12 else int(h):02d}:00"),
            (r'la (\d+) seara|seara la (\d+)', lambda h: f"{int(h) + 12 if int(h) < 12 else int(h):02d}:00"),
        ]
        
        for pattern, formatter in time_patterns:
            match = re.search(pattern, text_lower)
            if match:
                try:
                    groups = [g for g in match.groups() if g]
                    due_time = formatter(*groups)
                    break
                except:
                    pass
        
        # Fallback pentru momente generale ale zilei
        if not due_time:
            if 'dimineața' in text_lower or 'dimineata' in text_lower:
                due_time = "09:00"
            elif 'după-amiaza' in text_lower or 'dupa-amiaza' in text_lower or 'după-masa' in text_lower:
                due_time = "15:00"
            elif 'seara' in text_lower or 'sara' in text_lower:
                due_time = "19:00"
            elif 'noapte' in text_lower or 'noaptea' in text_lower:
                due_time = "21:00"
        
        # Detectare dată
        due_date = None
        
        if 'astăzi' in text_lower or 'azi' in text_lower:
            due_date = now.strftime("%Y-%m-%d")
        elif 'mâine' in text_lower or 'maine' in text_lower:
            due_date = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        elif 'poimâine' in text_lower or 'poimaine' in text_lower:
            due_date = (now + timedelta(days=2)).strftime("%Y-%m-%d")
        else:
            # Căutăm zile specifice
            days_map = {
                'luni': 0, 'lune': 0,
                'marți': 1, 'marti': 1, 'marţi': 1,
                'miercuri': 2,
                'joi': 3,
                'vineri': 4,
                'sâmbătă': 5, 'sambata': 5, 'sâmbata': 5,
                'duminică': 6, 'duminica': 6
            }
            
            for day_name, day_num in days_map.items():
                if day_name in text_lower:
                    current_day = now.weekday()
                    days_ahead = (day_num - current_day) % 7
                    
                    # Dacă e "săptămâna viitoare"
                    if 'viitoare' in text_lower or 'urmatoare' in text_lower or 'următoare' in text_lower:
                        days_ahead += 7
                    elif days_ahead == 0:  # Dacă e aceeași zi, presupunem săptămâna viitoare
                        days_ahead = 7
                    
                    due_date = (now + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
                    break
        
        return due_date, due_time
    
    def classify_and_extract(self, text):
        """
        Trimite textul către Claude pentru a determina tipul (JURNAL sau TODO)
        și a extrage informațiile relevante.
        
        Returns:
            dict: {
                "type": "JURNAL" | "TODO",
                "data": {...}  # structura depinde de tip
            }
        """
        
        # Obținem data și ora curentă pentru context
        now = datetime.now()
        current_date = now.strftime("%Y-%m-%d")
        current_time = now.strftime("%H:%M")
        current_day = now.strftime("%A")  # ex: Monday
        
        # Mapare zile în română
        days_ro = {
            "Monday": "Luni",
            "Tuesday": "Marți", 
            "Wednesday": "Miercuri",
            "Thursday": "Joi",
            "Friday": "Vineri",
            "Saturday": "Sâmbătă",
            "Sunday": "Duminică"
        }
        current_day_ro = days_ro.get(current_day, current_day)
        
        prompt = f"""Ești un asistent pentru persoane cu probleme de memorie. Primești text transcris din voce și trebuie să determini dacă este:
1. JURNAL - o notă personală, gând, amintire sau relatare despre ziua curentă
2. TODO - o sarcină, reminder, alarmă sau ceva ce trebuie făcut în viitor

CONTEXT TEMPORAL ACTUAL:
- Data de azi: {current_date} ({current_day_ro})
- Ora curentă: {current_time}

Analizează următorul text și returnează DOAR un JSON valid (fără explicații):

Text: "{text}"

Pentru JURNAL returnează:
{{
  "type": "JURNAL",
  "data": {{
    "content": "textul complet al jurnalului",
    "sentiment": "pozitiv" | "neutru" | "negativ",
    "summary": "rezumat scurt în 1-2 propoziții",
    "keywords": ["cuvinte", "cheie", "extrase"]
  }}
}}

Pentru TODO returnează:
{{
  "type": "TODO",
  "data": {{
    "task": "descrierea sarcinii",
    "priority": "scăzută" | "medie" | "ridicată",
    "due_date": "YYYY-MM-DD" sau null,
    "due_time": "HH:MM" sau null,
    "reminder_minutes_before": 15,
    "category": "medicație" | "întâlnire" | "cumpărături" | "altele"
  }}
}}

REGULI PENTRU INTERPRETARE DATE/ORE:
- "astăzi" = {current_date}
- "mâine" = calculează ziua următoare față de {current_date}
- "poimâine" = calculează 2 zile față de {current_date}
- "luni/marți/etc" = calculează următoarea zi specificată
- "luni viitoare" = calculează luni din săptămâna viitoare
- "la 3" sau "la 15" = 15:00 (format 24h)
- "la 3 dimineața" = 03:00
- "la 3 după-amiaza" = 15:00
- "dimineața" (fără oră specifică) = 09:00
- "după-amiaza" (fără oră specifică) = 15:00
- "seara" (fără oră specifică) = 19:00
- Dacă nu e menționată o dată/oră specifică = null

REGULI IMPORTANTE:
- Pentru medicație, setează priority la "ridicată" automat
- Dacă menționează "nu uita", "trebuie", "important" → priority medie/ridicată
- Dacă nu ești sigur de tip, alege JURNAL
- Returnează DOAR JSON-ul, nimic altceva
- ÎNTOTDEAUNA calculează due_date dacă există vreo referință temporală"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extragem răspunsul
            response_text = message.content[0].text.strip()
            
            # Curățăm răspunsul de eventuale markdown code blocks
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            result = json.loads(response_text)
            
            # POST-PROCESARE: Dacă e TODO și nu are due_date, încearcă să-l extragem manual
            if result.get('type') == 'TODO':
                data = result.get('data', {})
                
                # Dacă Claude nu a găsit date, încercăm noi
                if not data.get('due_date') or not data.get('due_time'):
                    manual_date, manual_time = self._parse_relative_date(text)
                    
                    if manual_date and not data.get('due_date'):
                        data['due_date'] = manual_date
                        print(f"✅ Manual parsed due_date: {manual_date}")
                    
                    if manual_time and not data.get('due_time'):
                        data['due_time'] = manual_time
                        print(f"✅ Manual parsed due_time: {manual_time}")
                    
                    result['data'] = data
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"Error parsing Claude response: {e}")
            print(f"Response was: {response_text}")
            # Fallback: considerăm ca JURNAL
            return {
                "type": "JURNAL",
                "data": {
                    "content": text,
                    "sentiment": "neutru",
                    "summary": text[:100],
                    "keywords": []
                }
            }
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            raise

    def generate_daily_summary(self, journal_entries):
        """
        Generează un rezumat al zilei pe baza intrărilor din jurnal.
        
        Args:
            journal_entries: listă de dicționare cu intrări de jurnal
            
        Returns:
            str: rezumat al zilei
        """
        
        if not journal_entries:
            return "Nu există intrări în jurnal pentru această zi."
        
        # Combinăm toate intrările
        combined_text = "\n\n".join([
            f"Oră {entry.get('timestamp', 'necunoscută')}: {entry.get('content', '')}"
            for entry in journal_entries
        ])
        
        prompt = f"""Ești un asistent care ajută persoane cu probleme de memorie. 
Creează un rezumat cald și încurajator al zilei pe baza acestor note din jurnal.
Rezumatul trebuie să fie:
- Scris la persoana a 2-a (tu/dumneavoastră)
- Pozitiv și suportiv
- Maxim 200 cuvinte
- Să evidențieze momentele importante

Intrări jurnal:
{combined_text}

Rezumat:"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            print(f"Error generating summary: {e}")
            return "Nu s-a putut genera rezumatul zilei."