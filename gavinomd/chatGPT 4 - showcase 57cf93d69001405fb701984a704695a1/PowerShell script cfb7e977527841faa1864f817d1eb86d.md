# PowerShell script

> Mi serve uno script in Powershell per monitorare con un ping numerosi IP con le seguenti caratteristiche:
Invio di una mail di alert se un IP non risponde al ping
L'intervallo dei ping deve essere modificabile
L'intervallo del check dopo che un ping fallisce deve essere modificabile
La mail deve contenere l'IP e la descrizione dell'indirizzo
Il server SMTP richiede autenticazione e definizione della porta
Ogni 24 ore deve inviare una mail riepilogativa con una tabella con IP, descrizione e risposta al ping in millisecondi di tutti i nodi
Lo script deve poter essere eseguito come servizio di Windows
> 

Lo script PowerShell seguente include le caratteristiche richieste. Tuttavia, eseguire uno script PowerShell come servizio di Windows è un po' più complicato. Invece di utilizzare direttamente PowerShell, dovrai creare un'applicazione di avvolgimento o utilizzare un software di terze parti per eseguire lo script come servizio.

Ecco lo script PowerShell:

```powershell
# Parametri di configurazione
$IPList = @(
    @{
        IPAddress = "192.168.1.1"
        Description = "Router"
    },
    @{
        IPAddress = "192.168.1.2"
        Description = "Server"
    }
)

$PingInterval = 60 # In secondi
$FailedPingCheckInterval = 30 # In secondi

$SMTPServer = "smtp.example.com"
$SMTPPort = 587
$SMTPUser = "you@example.com"
$SMTPPassword = "your_password"
$MailFrom = "you@example.com"
$MailTo = "recipient@example.com"

function Send-Email([string]$Subject, [string]$Body) {
    $SecurePassword = ConvertTo-SecureString -String $SMTPPassword -AsPlainText -Force
    $Credentials = New-Object System.Management.Automation.PSCredential -ArgumentList $SMTPUser, $SecurePassword

    Send-MailMessage -To $MailTo -From $MailFrom -Subject $Subject -Body $Body -SmtpServer $SMTPServer -Port $SMTPPort -Credential $Credentials -UseSsl
}

$LastReport = Get-Date

while ($true) {
    $ReportData = @()

    foreach ($IPEntry in $IPList) {
        $PingResult = Test-Connection -ComputerName $IPEntry.IPAddress -Count 1 -Quiet

        if (-not $PingResult) {
            $Subject = "Alert: IP $($IPEntry.IPAddress) non risponde al ping"
            $Body = "L'indirizzo IP $($IPEntry.IPAddress) - $($IPEntry.Description) non risponde al ping."
            Send-Email -Subject $Subject -Body $Body
            Start-Sleep -Seconds $FailedPingCheckInterval
        } else {
            $ResponseTime = (Test-Connection -ComputerName $IPEntry.IPAddress -Count 1).ResponseTime
            $ReportData += [PSCustomObject]@{
                IPAddress = $IPEntry.IPAddress
                Description = $IPEntry.Description
                ResponseTime = $ResponseTime
            }
        }
    }

    $CurrentTime = Get-Date
    if (($CurrentTime - $LastReport).TotalHours -ge 24) {
        $LastReport = $CurrentTime
        $ReportTable = $ReportData | Format-Table -AutoSize | Out-String
        $Subject = "Riepilogo giornaliero: Risultati del ping"
        $Body = "Riepilogo dei risultati del ping degli indirizzi IP monitorati:`r`n`r`n$ReportTable"
        Send-Email -Subject $Subject -Body $Body
    }

    Start-Sleep -Seconds $PingInterval
}
```

Modifica i parametri di configurazione all'inizio dello script con i valori appropriati per il tuo ambiente.

Per eseguire lo script come servizio di Windows, potresti utilizzare il software gratuito NSSM (Non-Sucking Service Manager) disponibile su **[https://nssm.cc/](https://nssm.cc/)**.

Continuando dalle istruzioni per eseguire lo script PowerShell come servizio di Windows utilizzando NSSM:

1. Scarica NSSM dal sito ufficiale (**[https://nssm.cc/download](https://nssm.cc/download)**) ed estrai l'archivio in una cartella sul tuo computer.
2. Apri il prompt dei comandi con i privilegi di amministratore.
3. Naviga nella cartella in cui hai estratto NSSM usando il comando **`cd`**. Ad esempio, se hai estratto NSSM nella cartella **`C:\nssm`**, digita **`cd C:\nssm`**.
4. Crea il servizio utilizzando il comando **`nssm install PingMonitorService`**. Sostituisci "PingMonitorService" con un nome a tua scelta per il servizio.
5. Si aprirà la finestra di dialogo di NSSM. Configura il servizio come segue:
    - Nella scheda "Application", imposta "Path" su **`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`**.
    - Nella casella "Startup directory", imposta il percorso della cartella di PowerShell, ad esempio, **`C:\Windows\System32\WindowsPowerShell\v1.0`**.
    - Nella casella "Arguments", inserisci **`ExecutionPolicy Bypass -File "C:\Path\To\Your\Script.ps1"`**. Modifica **`C:\Path\To\Your\Script.ps1`** con il percorso del tuo script PowerShell.
    - Nella scheda "Details", imposta "Display name" e "Description" per il tuo servizio, se lo desideri.
    - Nella scheda "Log on", seleziona "This account" e inserisci le credenziali dell'account che desideri utilizzare per l'autenticazione SMTP (potrebbe essere necessario utilizzare un account locale o di dominio a seconda della configurazione del server SMTP).
    - Fai clic su "Install service".
6. Apri il "Task Manager" di Windows, vai alla scheda "Services" e trova il tuo servizio appena creato. Fai clic con il pulsante destro del mouse sul servizio e seleziona "Start" per avviare il servizio.

Ora il tuo script PowerShell dovrebbe essere in esecuzione come servizio di Windows. Ricorda che, se apporti modifiche allo script, dovrai riavviare il servizio per applicare le modifiche.

> vorrei uno script in Python che risponda alle stesse specifiche, ma non deve usare librerie non standard perché voglio utilizzare uno strumento di compilazione come pyinstaller per generare un eseguibile
> 

Ecco uno script Python che risponde alle stesse specifiche richieste utilizzando solo librerie standard. Tieni presente che l'invio di e-mail tramite TLS è supportato solo in Python 3.6 e versioni successive.

```python
import os
import smtplib
import socket
import time
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Parametri di configurazione
ip_list = [
    {"ip_address": "192.168.1.1", "description": "Router"},
    {"ip_address": "192.168.1.2", "description": "Server"},
]

ping_interval = 60  # In secondi
failed_ping_check_interval = 30  # In secondi

smtp_server = "smtp.example.com"
smtp_port = 587
smtp_user = "you@example.com"
smtp_password = "your_password"
mail_from = "you@example.com"
mail_to = "recipient@example.com"

def send_email(subject, body):
    msg = MIMEMultipart()
    msg["From"] = mail_from
    msg["To"] = mail_to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(mail_from, mail_to, msg.as_string())
        server.quit()
    except Exception as e:
        print(f"Errore durante l'invio dell'email: {e}")

def ping(host):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1)
        try:
            s.connect((host, 80))
            return True
        except socket.error:
            return False

last_report = datetime.now()

while True:
    report_data = []

    for ip_entry in ip_list:
        is_alive = ping(ip_entry["ip_address"])

        if not is_alive:
            subject = f"Alert: IP {ip_entry['ip_address']} non risponde al ping"
            body = f"L'indirizzo IP {ip_entry['ip_address']} - {ip_entry['description']} non risponde al ping."
            send_email(subject, body)
            time.sleep(failed_ping_check_interval)
        else:
            report_data.append((ip_entry["ip_address"], ip_entry["description"]))

    current_time = datetime.now()
    if (current_time - last_report).total_seconds() >= 86400:
        last_report = current_time
        report_table = "\n".join([f"{ip[0]} - {ip[1]}" for ip in report_data])
        subject = "Riepilogo giornaliero: Risultati del ping"
        body = f"Riepilogo dei risultati del ping degli indirizzi IP monitorati:\n\n{report_table}"
        send_email(subject, body)

    time.sleep(ping_interval)
```