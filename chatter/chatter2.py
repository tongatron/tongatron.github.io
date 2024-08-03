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
        hex_dig = hash_object.hexdigest()
        color = f'#{hex_dig[:6]}'
        return color

    # Generazione dei colori per ogni utente
    user_color = {msg['user']: generate_color(msg['user']) for msg in messages}

    rendered_html = render_template_string('''
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Conversazione WhatsApp</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; }
            .chat { max-width: 600px; margin: auto; }
            .message { margin-bottom: 10px; padding: 10px; border-radius: 8px; white-space: pre-line; }
            .date-time { color: gray; font-size: 0.8em; }
            .user { font-weight: bold; margin-right: 5px; }
            .text { margin-left: 10px; display: inline-block; }
        </style>
    </head>
    <body>
        <h1>Conversazione WhatsApp</h1>
        <div class="chat">
            {% for msg in messages %}
            {% set color = user_color[msg.user] %}
            <div class="message" style="background-color: {{ color }};">
                <div>
                    <span class="user">{{ msg.user }}:</span>
                    <span class="date-time">[{{ msg.date }}, {{ msg.time }}]</span>
                </div>
                <div class="text">{{ msg.message }}</div>
            </div>
            {% endfor %}
        </div>
    </body>
    </html>
    ''', messages=messages, user_color=user_color)

    # Nome del file generato
    html_filename = 'conversazione.html'
    pdf_filename = 'conversazione.pdf'
    html_path = os.path.join(UPLOAD_FOLDER, html_filename)
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    # Salva il file HTML generato
    with open(html_path, 'w') as file:
        file.write(rendered_html)

    # Genera il PDF dalla stringa HTML
    pdfkit.from_string(rendered_html, pdf_path)

    # Fornisce un link per il download del file generato
    return f'''
    File generato con successo. 
    <a href="/download/{html_filename}">Scarica il file HTML</a><br>
    <a href="/download-pdf/{pdf_filename}">Scarica il file PDF</a>
    '''

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/download-pdf/<filename>')
def download_pdf(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
