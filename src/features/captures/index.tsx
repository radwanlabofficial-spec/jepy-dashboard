/**
 * Captures — Chrome extension connection.
 *
 * The extension is the only capture path: it reads the page Radwan is looking
 * at, extracts the structured lead fields, and pushes them into the ingest
 * queue through the device-pairing handshake. There is no API call from this
 * page — pairing codes are generated per device inside the extension itself,
 * so a "generate code" control here would be a promise the server cannot keep.
 */

import { Camera, CheckCircle2, Download, KeyRound, MousePointerClick } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

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

  return (
    <div data-component="captures-page" className="space-y-3">
      <PageHeader
        title="Extension Connection"
        description="Connect your Chrome extension to capture leads directly from any webpage."
      />

      <Card
        title="Device pairing"
        subtitle="Four steps link the extension to this console. Pairing codes are generated per-device inside the extension."
        action={
          <Button
            variant="secondary"
            icon={<KeyRound size={13} aria-hidden="true" />}
            onClick={() => toast.push('Pairing codes are generated per-device')}
          >
            Generate code
          </Button>
        }
      >
        <div className="mb-5 flex items-center gap-4">
          <div
            className="rounded-md border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-3 font-mono text-2xl tracking-[0.5em] text-[var(--text-3)]"
            aria-label="Pairing code placeholder"
          >
            ----
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-[var(--text-3)]">
            Your code appears here once you request it from the extension. It expires after a few minutes.
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
