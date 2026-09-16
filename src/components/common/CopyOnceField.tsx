/**
 * Copy-once field — device registration tokens only.
 *
 * This is the exact opposite of the provider-credential field, and that is why it
 * is a separate component with a different name: a device token IS shown once
 * (otherwise the extension can never be set up), while a provider key is never
 * shown at all. Collapsing both into one generic "secret field" is how a reveal
 * affordance gets smuggled into a Vault that must not have one.
 *
 * The value is dropped from state on unmount, so reopening the dialog cannot
 * redisplay it.
 */

import { useEffect, useState } from 'react';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import Button from './Button';

export interface CopyOnceFieldProps {
  value: string;
  onDismiss: () => void;
  label?: string;
}

export default function CopyOnceField({ value, onDismiss, label = 'Registration token' }: CopyOnceFieldProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    return () => setVisible(false);
  }, [value]);

  if (!visible) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div data-component="copy-once-field" className="space-y-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="flex items-stretch gap-2">
        <code className="flex-1 select-all break-all rounded-md bg-zinc-800 p-3 font-mono text-[13px] text-zinc-100">
          {value}
        </code>
        <Button
          variant="secondary"
          icon={copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
          onClick={copy}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="flex items-start gap-1.5 text-[13px] text-amber-400">
        <ShieldAlert size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        This is the only time you will ever see it — copy it now.
      </p>
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onDismiss}>
          Done
        </Button>
      </div>
    </div>
  );
}
