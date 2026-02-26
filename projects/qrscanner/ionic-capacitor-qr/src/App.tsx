import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import {
  IonApp,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  copyOutline,
  flashOutline,
  linkOutline,
  refreshOutline,
  scanOutline,
} from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import './App.css';

type StatusType = 'ok' | 'warn';

function App() {
  const platform = Capacitor.getPlatform();
  const isWeb = platform === 'web';
  const isNative = Capacitor.isNativePlatform();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const barcodeListenerRef = useRef<PluginListenerHandle | null>(null);
  const handlingResultRef = useRef(false);

  const [status, setStatus] = useState('Pronto a scansionare');
  const [statusType, setStatusType] = useState<StatusType>('ok');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState('');
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);

  const hasResult = result.trim().length > 0;
  const canOpenResult = useMemo(() => {
    try {
      const value = new URL(result);
      return value.protocol === 'http:' || value.protocol === 'https:';
    } catch {
      return false;
    }
  }, [result]);

  const updateStatus = useCallback((message: string, type: StatusType = 'ok') => {
    setStatus(message);
    setStatusType(type);
  }, []);

  const cleanupListener = useCallback(async () => {
    if (barcodeListenerRef.current) {
      await barcodeListenerRef.current.remove();
      barcodeListenerRef.current = null;
    }
  }, []);

  const stopScan = useCallback(
    async (keepResult = true) => {
      await cleanupListener();
      try {
        await BarcodeScanner.stopScan();
      } catch {
        // Ignore: stop may fail if scanner is already stopped.
      }
      setIsScanning(false);
      setTorchAvailable(false);
      setTorchEnabled(false);
      handlingResultRef.current = false;
      if (!keepResult) {
        setResult('');
      }
    },
    [cleanupListener],
  );

  const handleDetectedValue = useCallback(
    async (rawValue?: string) => {
      const value = (rawValue || '').trim();
      if (!value || handlingResultRef.current) {
        return;
      }
      handlingResultRef.current = true;

      const isHttp = (() => {
        try {
          const candidate = new URL(value);
          return candidate.protocol === 'http:' || candidate.protocol === 'https:';
        } catch {
          return false;
        }
      })();

      setResult(value);
      updateStatus('QR trovato: camera fermata automaticamente.');
      if (isHttp && navigator.vibrate) {
        navigator.vibrate([70, 40, 100]);
      }
      await stopScan(true);
    },
    [stopScan, updateStatus],
  );

  const startScan = useCallback(async () => {
    if (isScanning) {
      return;
    }

    setResult('');
    updateStatus('Controllo supporto scanner...');

    const support = await BarcodeScanner.isSupported();
    if (!support.supported) {
      updateStatus('Scanner non supportato su questo dispositivo.', 'warn');
      return;
    }

    const permissions = await BarcodeScanner.requestPermissions();
    if (permissions.camera !== 'granted') {
      updateStatus('Permesso camera negato.', 'warn');
      return;
    }

    await cleanupListener();
    handlingResultRef.current = false;

    barcodeListenerRef.current = await BarcodeScanner.addListener(
      'barcodesScanned',
      async (event) => {
        const first = event.barcodes[0];
        await handleDetectedValue(first?.rawValue);
      },
    );

    try {
      const options = {
        formats: [BarcodeFormat.QrCode],
        lensFacing: LensFacing.Back,
        ...(isWeb && videoRef.current ? { videoElement: videoRef.current } : {}),
      };
      await BarcodeScanner.startScan(options);

      const torch = await BarcodeScanner.isTorchAvailable().catch(() => ({ available: false }));
      setTorchAvailable(Boolean(torch.available));
      setTorchEnabled(false);
      setIsScanning(true);
      updateStatus(isNative ? 'Scanner nativo attivo.' : 'Scanner web attivo.');
    } catch {
      await stopScan(false);
      updateStatus('Impossibile avviare la scansione.', 'warn');
    }
  }, [
    cleanupListener,
    handleDetectedValue,
    isNative,
    isScanning,
    isWeb,
    stopScan,
    updateStatus,
  ]);

  const toggleTorch = useCallback(async () => {
    if (!torchAvailable || !isScanning) {
      return;
    }
    try {
      await BarcodeScanner.toggleTorch();
      const state = await BarcodeScanner.isTorchEnabled();
      setTorchEnabled(Boolean(state.enabled));
    } catch {
      updateStatus('Torcia non disponibile su questo dispositivo.', 'warn');
    }
  }, [isScanning, torchAvailable, updateStatus]);

  const handleCopy = useCallback(async () => {
    if (!hasResult) {
      return;
    }
    try {
      await navigator.clipboard.writeText(result);
      updateStatus('Risultato copiato.');
    } catch {
      updateStatus('Copia non riuscita.', 'warn');
    }
  }, [hasResult, result, updateStatus]);

  const handleOpen = useCallback(() => {
    if (!canOpenResult) {
      return;
    }
    window.open(result, '_blank', 'noopener,noreferrer');
  }, [canOpenResult, result]);

  useEffect(() => {
    return () => {
      void stopScan(true);
      void BarcodeScanner.removeAllListeners();
    };
  }, [stopScan]);

  return (
    <IonApp>
      <IonPage>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>QR Scanner Android</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div className="screen">
            <IonCard className="panel">
              <IonCardContent>
                <div className="status-row">
                  <IonBadge color={statusType === 'warn' ? 'danger' : 'success'}>
                    {isScanning ? 'ATTIVO' : 'STOP'}
                  </IonBadge>
                  <IonText color={statusType === 'warn' ? 'danger' : 'medium'}>
                    <p className="status-text">{status}</p>
                  </IonText>
                </div>

                <div className="viewer">
                  <video ref={videoRef} playsInline muted className={isWeb ? 'video-on' : 'video-off'} />
                  <div className="scanner-frame" />
                  {!isWeb && <p className="native-note">Preview nativa gestita da Capacitor (Android).</p>}
                </div>

                <IonButtons className="controls">
                  <IonButton onClick={() => void startScan()} disabled={isScanning}>
                    <IonIcon icon={scanOutline} slot="start" />
                    Avvia scanner
                  </IonButton>
                  <IonButton
                    color="medium"
                    onClick={() => void startScan()}
                    disabled={isScanning}
                  >
                    <IonIcon icon={refreshOutline} slot="start" />
                    Nuova scansione
                  </IonButton>
                  <IonButton
                    color="warning"
                    onClick={() => void toggleTorch()}
                    disabled={!isScanning || !torchAvailable}
                  >
                    <IonIcon icon={flashOutline} slot="start" />
                    {torchEnabled ? 'Torcia ON' : 'Torcia'}
                  </IonButton>
                </IonButtons>
              </IonCardContent>
            </IonCard>

            <IonCard className="panel result-panel">
              <IonCardContent>
                <p className="result-title">Risultato</p>
                <p className="result-value">{hasResult ? result : '-'}</p>
                <IonButtons className="controls">
                  <IonButton color="medium" onClick={() => void handleCopy()} disabled={!hasResult}>
                    <IonIcon icon={copyOutline} slot="start" />
                    Copia
                  </IonButton>
                  <IonButton color="primary" onClick={handleOpen} disabled={!canOpenResult}>
                    <IonIcon icon={linkOutline} slot="start" />
                    Apri link
                  </IonButton>
                </IonButtons>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    </IonApp>
  );
}

export default App;
