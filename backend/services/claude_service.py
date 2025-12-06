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
        
        self.categories = {
            'medicatie': ['medicament', 'pastila' , 'tratament', 'doctori', 'spital', 'clinica', 'farmacie', 'reteta'],
            'intalnire': ['intalnire', 'programare', 'apel', 'sedinta', 'discutie', 'vizita'],
            'cumparaturi': ['cumpar', 'magazin', 'supermarket', 'lista', 'comanda', 'produse', 'alimente'],
            'munca': ['proiect', 'task', 'sarcina', 'deadline', 'raport', 'email', 'coleg', 'birou', 'lucru', 'job'],
            'casa': ['curatenie', 'repara', 'menaj', 'spalat', 'gatit', 'aranjat', 'gradina', 'gunoi'],
            'financiar': ['plata', 'factura', 'banca', 'bani', 'transfer', 'credit', 'cont', 'taxa', 'chirie'],
            'personal': ['aniversare', 'cadou', 'sarbatoare', 'vacanta', 'hobby', 'citit', 'film', 'exercitii'],
            'transport': ['masina', 'autobuz', 'tren', 'avion', 'revizie', 'asigurare', 'benzina', 'bilet'],
            'social': ['prieten', 'familie', 'rude', 'petrecere', 'eveniment', 'aniversare', 'botez', 'nunta'],
            'educatie': ['curs', 'lectie', 'studiu', 'scoala']
        }
        
        self.high_priority_keywords = [
            'urgent', 'important', 'neaparat', 'obligatoriu', 'critic',
            'nu uita', 'musai', 'esential', 'vital', 'imperativ'
        ]
        
        self.immediate_time_indicators = [
            'astazi', 'azi', 'acum', 'imediat', 'degraba', 'repede'
        ]
    
    def _detect_category(self, text):
        text_lower = text.lower()
        
        scores = {}
        for category, keywords in self.categories.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                scores[category] = score
        
        if scores:
            return max(scores, key=scores.get)
        
        return 'altele'
    
    def _detect_priority(self, text):
        text_lower = text.lower()
        
        if any(keyword in text_lower for keyword in self.high_priority_keywords):
            return 'ridicata'
        
        if self._detect_category(text) == 'medicatie':
            return 'ridicata'
        
        if any(indicator in text_lower for indicator in self.immediate_time_indicators):
            return 'ridicata'
        
        if self._detect_category(text) == 'financiar':
            return 'medie'
        
        return 'medie'
    
    def _parse_relative_date(self, text):
        text_lower = text.lower()
        now = datetime.now()
        
        due_time = None
        
        time_patterns = [
            (r'la (\d+):(\d+)', lambda h, m: f"{int(h):02d}:{int(m):02d}"),
            (r'la (\d+) si (\d+)', lambda h, m: f"{int(h):02d}:{int(m):02d}"),
            (r'la (\d+) si jumatate', lambda h: f"{int(h):02d}:30"),
            
            (r'la (\d+) dimineata|dimineata la (\d+)|dimineata la (\d+)', lambda h: f"{int(h):02d}:00" if int(h) < 12 else f"{int(h):02d}:00"),
            (r'la (\d+) dupa-amiaza|dupa-amiaza la (\d+)|dupa-amiaza la (\d+)', lambda h: f"{int(h) + 12 if int(h) < 12 else int(h):02d}:00"),
            (r'la (\d+) seara|seara la (\d+)|sara la (\d+)', lambda h: f"{int(h) + 12 if int(h) < 12 else int(h):02d}:00"),
            (r'la (\d+) noaptea|noaptea la (\d+)', lambda h: f"{int(h) + 12 if int(h) < 12 else int(h):02d}:00"),
            
            # Ore fara "la"
            (r'(\d+) dimineata|dimineata (\d+)', lambda h: f"{int(h):02d}:00"),
            (r'(\d+) dupa-amiaza|dupa-amiaza (\d+)', lambda h: f"{int(h) + 12 if int(h) < 12 else int(h):02d}:00"),
        ]
        
        for pattern, formatter in time_patterns:
            match = re.search(pattern, text_lower)
            if match:
                try:
                    groups = [g for g in match.groups() if g is not None]
                    due_time = formatter(*groups)
                    break
                except Exception as e:
                    print(f"Error parsing time: {e}")
                    pass
        
        if not due_time:
            if 'dimineata' in text_lower or 'dimineata' in text_lower:
                due_time = "09:00"
            elif 'pranz' in text_lower or 'amiaza' in text_lower or 'amiaza' in text_lower:
                due_time = "12:00"
            elif 'dupa-amiaza' in text_lower or 'dupa-amiaza' in text_lower or 'dupa-masa' in text_lower:
                due_time = "15:00"
            elif 'seara' in text_lower or 'sara' in text_lower:
                due_time = "19:00"
            elif 'noapte' in text_lower or 'noaptea' in text_lower:
                due_time = "21:00"
        
        due_date = None
        
        if 'astazi' in text_lower or 'azi' in text_lower:
            due_date = now.strftime("%Y-%m-%d")
        elif 'maine' in text_lower or 'maine' in text_lower:
            due_date = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        elif 'poimaine' in text_lower or 'poimaine' in text_lower:
            due_date = (now + timedelta(days=2)).strftime("%Y-%m-%d")
        elif 'saptamana viitoare' in text_lower or 'saptamana viitoare' in text_lower:
            days_until_monday = (7 - now.weekday()) % 7
            if days_until_monday == 0:
                days_until_monday = 7
            due_date = (now + timedelta(days=days_until_monday)).strftime("%Y-%m-%d")
        elif 'luna viitoare' in text_lower:
            if now.month == 12:
                next_month = now.replace(year=now.year + 1, month=1, day=1)
            else:
                next_month = now.replace(month=now.month + 1, day=1)
            due_date = next_month.strftime("%Y-%m-%d")
        else:
            days_map = {
                'luni': 0,
                'marti': 1,
                'miercuri': 2,
                'joi': 3,
                'vineri': 4,
                'sambata': 5,
                'duminica': 6
            }
            
            for day_name, day_num in days_map.items():
                if day_name in text_lower:
                    current_day = now.weekday()
                    days_ahead = (day_num - current_day) % 7

                    if 'viitoare' in text_lower or 'urmatoare' in text_lower or 'urmatoare' in text_lower:
                        days_ahead += 7
                    elif days_ahead == 0:
                        days_ahead = 7
                    
                    due_date = (now + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
                    break
        
        return due_date, due_time
    
    def _calculate_reminder_time(self, category, priority):
        reminder_map = {
            'medicatie': 30,
            'intalnire': 15,
            'transport': 60,
            'financiar': 1440,
        }
        
        base_reminder = reminder_map.get(category, 15)
        
        if priority == 'ridicata':
            return base_reminder
        elif priority == 'medie':
            return max(15, base_reminder // 2)
        else:
            return 15
    
    def classify_and_extract(self, text):
        """
        Trimite textul catre Claude pentru a determina tipul (JURNAL sau TODO)
        si a extrage informatiile relevante.
        
        Returns:
            dict: {
                "type": "JURNAL" | "TODO",
                "data": {...}  # structura depinde de tip
            }
        """
        
        detected_category = self._detect_category(text)
        detected_priority = self._detect_priority(text)
        
        now = datetime.now()
        current_date = now.strftime("%Y-%m-%d")
        current_time = now.strftime("%H:%M")
        current_day = now.strftime("%A")
        
        days_ro = {
            "Monday": "Luni",
            "Tuesday": "Marti", 
            "Wednesday": "Miercuri",
            "Thursday": "Joi",
            "Friday": "Vineri",
            "Saturday": "Sambata",
            "Sunday": "Duminica"
        }
        current_day_ro = days_ro.get(current_day, current_day)
        
        categories_list = ", ".join([f'"{cat}"' for cat in self.categories.keys()] + ['"altele"'])
        
        prompt = f"""Esti un asistent pentru persoane cu probleme de memorie. Primesti text transcris din voce si trebuie sa determini daca este:
1. JURNAL - o nota personala, gand, amintire sau relatare despre ziua curenta sau trecuta
2. TODO - o sarcina, reminder, alarma sau ceva ce trebuie facut in viitor

CONTEXT TEMPORAL ACTUAL:
- Data de azi: {current_date} ({current_day_ro})
- Ora curenta: {current_time}

Analizeaza urmatorul text si returneaza DOAR un JSON valid (fara explicatii, fara markdown):

Text: "{text}"

Pentru JURNAL returneaza:
{{
  "type": "JURNAL",
  "data": {{
    "content": "textul complet al jurnalului",
    "sentiment": "pozitiv" | "neutru" | "negativ",
    "summary": "rezumat scurt in 1-2 propozitii",
    "keywords": ["cuvinte", "cheie", "extrase"],
    "mood": "fericit" | "trist" | "anxios" | "calm" | "entuziast" | "obosit" | "neutru",
    "energy_level": "ridicat" | "mediu" | "scazut"
  }}
}}

Pentru TODO returneaza:
{{
  "type": "TODO",
  "data": {{
    "task": "descrierea clara si concisa a sarcinii",
    "priority": "scazuta" | "medie" | "ridicata",
    "due_date": "YYYY-MM-DD" sau null,
    "due_time": "HH:MM" sau null,
    "reminder_minutes_before": numar (15, 30, 60, etc),
    "category": {categories_list},
    "estimated_duration": numar de minute (optional),
    "recurrent": {{
      "is_recurrent": true/false,
      "frequency": "zilnic" | "saptamanal" | "lunar" | null,
      "days_of_week": [0-6] sau null (0=luni, 6=duminica)
    }},
    "subtasks": ["sub-sarcina 1", "sub-sarcina 2"] sau []
  }}
}}

REGULI PENTRU INTERPRETARE DATE/ORE:
- "astazi" = {current_date}
- "maine" = {(now + timedelta(days=1)).strftime("%Y-%m-%d")}
- "poimaine" = {(now + timedelta(days=2)).strftime("%Y-%m-%d")}
- "luni/marti/etc" = urmatoarea zi specificata (calculeaza corect!)
- "luni viitoare" = luni din saptamana viitoare
- "saptamana viitoare" = luni urmatoare
- "luna viitoare" = prima zi a lunii viitoare
- "la 3" sau "la 15" = 15:00 (format 24h)
- "la 3 dimineata" = 03:00
- "la 3 dupa-amiaza" = 15:00
- "dimineata" (fara ora) = 09:00
- "pranz" = 12:00
- "dupa-amiaza" (fara ora) = 15:00
- "seara" (fara ora) = 19:00
- "noaptea" (fara ora) = 21:00
- Daca nu e mentionata o data/ora = null

REGULI PENTRU CATEGORII:
- Medicatie: pastile, tratamente, doctori, farmacii
- Intalnire: meetings, programari, apeluri
- Cumparaturi: magazin, produse, lista
- Munca: proiecte, taskuri, deadline-uri
- Casa: curatenie, reparatii, menaj
- Financiar: plati, facturi, bani
- Personal: hobby, sport, citit
- Transport: masina, revizie, calatorie
- Social: prieteni, familie, evenimente
- Educatie: cursuri, studiu, lectii

REGULI PENTRU PRIORITATE:
- RIDICATA: medicatie, "urgent", "important", "nu uita", financiar critic, deadline astazi
- MEDIE: intalniri, cumparaturi importante, taskuri de munca
- SCAZUTA: taskuri generale, lucruri fara deadline

REGULI PENTRU RECURRENTA:
- "in fiecare zi/zi" → is_recurrent: true, frequency: "zilnic"
- "in fiecare saptamana" → is_recurrent: true, frequency: "saptamanal"
- "in fiecare luni" → is_recurrent: true, frequency: "saptamanal", days_of_week: [0]
- "in fiecare luna" → is_recurrent: true, frequency: "lunar"
- Daca nu e mentionata recurrenta → is_recurrent: false

REGULI IMPORTANTE:
- Daca textul vorbeste despre trecut sau prezent fara actiune viitoare → JURNAL
- Daca textul mentioneaza ceva de facut in viitor → TODO
- Pentru TODO-uri recurente, asigura-te ca populezi corect campurile recurrent
- Estimeaza duration doar daca e evident din context
- Extrage subtasks daca sunt enumerate in text
- RETURNEAZA DOAR JSON, FARA ```json sau alte markdownuri!"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = message.content[0].text.strip()
            
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            result = json.loads(response_text)
            
            if result.get('type') == 'TODO':
                data = result.get('data', {})
                
                if not data.get('category') or data.get('category') == 'altele':
                    data['category'] = detected_category
                
                if not data.get('priority'):
                    data['priority'] = detected_priority
                
                if not data.get('due_date') or not data.get('due_time'):
                    manual_date, manual_time = self._parse_relative_date(text)
                    
                    if manual_date and not data.get('due_date'):
                        data['due_date'] = manual_date
                        print(f"Manual parsed due_date: {manual_date}")
                    
                    if manual_time and not data.get('due_time'):
                        data['due_time'] = manual_time
                        print(f"Manual parsed due_time: {manual_time}")
                
                if not data.get('reminder_minutes_before'):
                    data['reminder_minutes_before'] = self._calculate_reminder_time(
                        data.get('category', 'altele'),
                        data.get('priority', 'medie')
                    )
                
                if 'recurrent' not in data:
                    data['recurrent'] = {
                        'is_recurrent': False,
                        'frequency': None,
                        'days_of_week': None
                    }
                
                if 'subtasks' not in data:
                    data['subtasks'] = []
                
                result['data'] = data
            
            elif result.get('type') == 'JURNAL':
                data = result.get('data', {})
                
                if 'mood' not in data:
                    data['mood'] = 'neutru'
                
                if 'energy_level' not in data:
                    data['energy_level'] = 'mediu'
                
                result['data'] = data
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"Error parsing Claude response: {e}")
            print(f"Response was: {response_text}")
            return {
                "type": "JURNAL",
                "data": {
                    "content": text,
                    "sentiment": "neutru",
                    "summary": text[:100],
                    "keywords": [],
                    "mood": "neutru",
                    "energy_level": "mediu"
                }
            }
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            raise

    def generate_daily_summary(self, journal_entries):
        """
        Genereaza un rezumat al zilei pe baza intrarilor din jurnal.
        
        Args:
            journal_entries: lista de dictionare cu intrari de jurnal
            
        Returns:
            str: rezumat al zilei
        """
        
        if not journal_entries:
            return "Nu exista intrari in jurnal pentru aceasta zi."
        
        combined_text = "\n\n".join([
            f"Ora {entry.get('timestamp', 'necunoscuta')}: {entry.get('content', '')}\n"
            f"Sentiment: {entry.get('sentiment', 'necunoscut')}, "
            f"Mood: {entry.get('mood', 'necunoscut')}, "
            f"Energie: {entry.get('energy_level', 'necunoscut')}"
            for entry in journal_entries
        ])
        
        prompt = f"""Esti un asistent empatic care ajuta persoane cu probleme de memorie. 
Creeaza un rezumat cald, personalizat si incurajator al zilei pe baza acestor note din jurnal.

Rezumatul trebuie sa:
- Fie scris la persoana a 2-a (tu/dumneavoastra)
- Fie pozitiv, suportiv si empatic
- Fie structurat in 3 paragrafe:
  1. Rezumat activitati principale
  2. Incurajare si recunoastere a eforturilor
- Aiba maxim 100 de cuvinte
- Evidentieze momentele importante si realizarile
- Foloseasca un ton familiar si calduros

Intrari jurnal de astazi:
{combined_text}

Rezumat al zilei:"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            print(f"Error generating summary: {e}")
            return "Nu s-a putut genera rezumatul zilei."
    
    def generate_weekly_insights(self, journal_entries):
        if not journal_entries:
            return "Nu exista suficiente intrari pentru a genera insights saptamanale."
        
        combined_text = "\n".join([
            f"{entry.get('date', 'N/A')}: {entry.get('summary', entry.get('content', '')[:100])}"
            for entry in journal_entries
        ])
        
        prompt = f"""Pe baza acestor intrari din jurnal din ultima saptamana, genereaza un raport de insights.

Intrari:
{combined_text}

Creeaza un raport scurt (150 cuvinte) care include:
1. Teme recurente
2. Schimbari in starea emotionala
3. Realizari notabile
4. Sugestii pentru saptamana viitoare

Raport:"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=400,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            print(f"Error generating insights: {e}")
            return "Nu s-au putut genera insights-uri."