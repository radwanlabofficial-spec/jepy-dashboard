/**
 * Captures — Chrome extension connection.
 *
 * The extension is the only capture path: it reads the page Radwan is looking
 * at, extracts the structured lead fields, and pushes them into the ingest
 * queue through the device-pairing handshake.
 */

import { useState, useEffect } from 'react';
import { Camera, CheckCircle2, Download, KeyRound, MousePointerClick } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { api } from '../../lib/api';

const STEPS = [
  {
    icon: <Download size={16} aria-hidden="true" />,
    title: 'Install the extension',
    text: 'Load the Jepy extension in Chrome and pin it to the toolbar.',
  },
  {
    icon: <KeyRound size={16} aria-hidden="true" />,
    title: 'Get your pairing code',
    text: 'Open the extension and request a pairing code for this device.',
  },
  {
    icon: <MousePointerClick size={16} aria-hidden="true" />,
    title: 'Enter it in the extension',
    text: 'Type the code below into the extension to link this device.',
  },
  {
    icon: <CheckCircle2 size={16} aria-hidden="true" />,
    title: 'Start capturing',
    text: 'Click "capture" on any page — leads land in the ingest queue.',
  },
];

export default function CapturesPage() {
  const toast = useToast();
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number>(0);
  const [generating, setGenerating] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (expiresIn <= 0) {
      if (pairingCode) setPairingCode(null);
      return;
    }
    const t = setTimeout(() => setExpiresIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [expiresIn, pairingCode]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await api.device.pairingCode();
      setPairingCode(res.code);
      setExpiresIn(res.expires_in_sec);
      toast.push('Pairing code generated — enter it in the extension');
    } catch (e) {
      toast.push('Failed to generate code: ' + (e instanceof Error ? e.message : 'unknown'));
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div data-component="captures-page" className="space-y-3">
      <PageHeader
        title="Extension Connection"
        description="Connect your Chrome extension to capture leads directly from any webpage."
      />

      <Card
        title="Device pairing"
        subtitle="Generate a code here, enter it in the extension to link this device."
        action={
          <Button
            variant="secondary"
            icon={<KeyRound size={13} aria-hidden="true" />}
            onClick={generateCode}
            loading={generating}
          >
            Generate code
          </Button>
        }
      >
        <div className="mb-5 flex items-center gap-4">
          <div
            className={`rounded-md border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-3 font-mono text-2xl tracking-[0.5em] ${
              pairingCode ? 'text-[var(--text)]' : 'text-[var(--text-3)]'
            }`}
            aria-label="Pairing code"
          >
            {pairingCode ?? '------'}
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-[var(--text-3)]">
            {pairingCode
              ? `Expires in ${formatTime(expiresIn)} — enter this in the extension's options page.`
              : 'Click "Generate code" to get a 6-digit pairing code. It expires after 5 minutes.'}
          </p>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-400/10 text-green-400">
                {step.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-[var(--text)]">
                  <span className="mr-1.5 text-[var(--text-3)]">{index + 1}.</span>
                  {step.title}
                </span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-[var(--text-3)]">
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card
        title="How capture works"
        subtitle="What happens after you pair."
      >
        <div className="flex items-start gap-3 text-[13px] leading-relaxed text-[var(--text-3)]">
          <Camera size={16} className="mt-0.5 shrink-0 text-[var(--text-3)]" aria-hidden="true" />
          <p>
            The extension reads the visible page, extracts name, email, phone, company and
            website, then pushes the structured lead into the dashboard queue. The overview
            updates only when a new lead arrives — nothing polls while you wait.
          </p>
        </div>
      </Card>
    </div>
  );
}
