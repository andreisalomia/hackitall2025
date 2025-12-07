import speech_recognition as sr
import tempfile
import os

class SpeechService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True

    def transcribe_audio(self, audio_file):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            audio_file.save(tmp.name)
            wav_path = tmp.name

        try:
            with sr.AudioFile(wav_path) as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = self.recognizer.record(source)

            text = self.recognizer.recognize_google(audio_data, language="ro-RO")
            return text

        except sr.UnknownValueError:
            raise Exception("Nu s-a putut intelege audio-ul.")
        except Exception as e:
            raise Exception(f"Eroare la procesarea audio-ului: {e}")
        finally:
            if os.path.exists(wav_path):
                os.remove(wav_path)
