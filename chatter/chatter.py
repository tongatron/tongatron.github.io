import os
import re
import hashlib
import pdfkit
from flask import Flask, request, render_template_string, send_from_directory

app = Flask(__name__)

# Configura il percorso per salvare i file generati
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return '''
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Carica Chat WhatsApp</title>
    </head>
    <body>
        <h1>Carica Chat WhatsApp</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="chatfile" accept=".txt" required>
            <button type="submit">Carica e Genera</button>
        </form>
    </body>
    </html>
    '''

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['chatfile']
    content = file.read().decode('utf-8')

    # Pattern per identificare una nuova riga di messaggio con data e ora
    pattern = re.compile(r'^\[(\d{2}/\d{2}/\d{2}), (\d{2}:\d{2}:\d{2})\] (.+?): (.+)')
    messages = []

    for line in content.split('\n'):
        match = pattern.match(line)
        if match:
            date, time, user, message = match.groups()
            messages.append({'date': date, 'time': time, 'user': user, 'message': message})
        elif messages:
            # Se la linea non corrisponde al pattern, è una continuazione del messaggio precedente
            messages[-1]['message'] += '\n' + line.strip()

    # Funzione per generare un colore unico basato sul nome dell'utente
    def generate_color(user):
        hash_object = hashlib.md5(user.encode())
        hex_dig = has
