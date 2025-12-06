### Prerequisites
- python, node.js 22 LTS, git desktop


### Setup Instructions
creare fisier .env in backend cu continutul: 
MONGO_URI=mongodb+srv://<user>:<parola>@hackitall2025.bbiflkd.mongodb.net/?appName=hackitall2025


### link util baza de date
https://cloud.mongodb.com/v2/692c29a3a7488b775112aed9#/clusters/detail/hackitall2025


### backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

python app.py


### frontend
cd frontend
npm install
npm install bootstrap axios

npm run dev


### extensii utile
- Python intellisense
- Pylance
- ES7+ React/Redux/React-Native snippets
- Live Server
- Prettier - Code formatter


### rulare
doua terminale: in unul "python app.py", in altul "npm run dev"
