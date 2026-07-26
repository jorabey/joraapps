import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../common/Button';
import { IconCheck } from '../common/icons';
import './host-dialog.css';

/**
 * HostDialog
 * Renders the active host-side dialog (alert/confirm/select/prompt)
 * requested by the mini-app through NexaHostBridge. `dialog` is null
 * when nothing is showing.
 */
export function HostDialog({ dialog }) {
  if (!dialog) return null;

  return createPortal(
    <div className="host-dialog-backdrop">
      <div className="host-dialog" role="alertdialog" aria-modal="true">
        {dialog.kind === 'alert' && <AlertBody dialog={dialog} />}
        {dialog.kind === 'confirm' && <ConfirmBody dialog={dialog} />}
        {dialog.kind === 'select' && <SelectBody dialog={dialog} />}
        {dialog.kind === 'prompt' && <PromptBody dialog={dialog} />}
      </div>
    </div>,
    document.body
  );
}

function AlertBody({ dialog }) {
  const { message, okLabel } = dialog.payload || {};
  return (
    <>
      <p className="host-dialog__message">{message}</p>
      <div className="host-dialog__actions">
        <Button fullWidth onClick={() => dialog.resolve({ ok: true })}>
          {okLabel || 'OK'}
        </Button>
      </div>
    </>
  );
}

function ConfirmBody({ dialog }) {
  const { message, okLabel, cancelLabel } = dialog.payload || {};
  return (
    <>
      <p className="host-dialog__message">{message}</p>
      <div className="host-dialog__actions">
        <Button variant="secondary" fullWidth onClick={() => dialog.resolve({ ok: false })}>
          {cancelLabel || 'Cancel'}
        </Button>
        <Button fullWidth onClick={() => dialog.resolve({ ok: true })}>
          {okLabel || 'OK'}
        </Button>
      </div>
    </>
  );
}

function SelectBody({ dialog }) {
  const { message, options = [] } = dialog.payload || {};
  return (
    <>
      {message && <p className="host-dialog__message">{message}</p>}
      <div className="host-dialog__options">
        {options.map((opt) => (
          <button
            key={opt.value}
            className="host-dialog__option"
            onClick={() => dialog.resolve({ ok: true, value: opt.value })}
          >
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
      <div className="host-dialog__actions">
        <Button variant="secondary" fullWidth onClick={() => dialog.resolve({ ok: false })}>
          Cancel
        </Button>
      </div>
    </>
  );
}

function PromptBody({ dialog }) {
  const { message, placeholder, defaultValue } = dialog.payload || {};
  const [value, setValue] = useState(defaultValue || '');
  return (
    <>
      {message && <p className="host-dialog__message">{message}</p>}
      <input
        className="host-dialog__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus
      />
      <div className="host-dialog__actions">
        <Button variant="secondary" fullWidth onClick={() => dialog.resolve({ ok: false })}>
          Cancel
        </Button>
        <Button fullWidth onClick={() => dialog.resolve({ ok: true, value })}>
          OK
        </Button>
      </div>
    </>
  );
}
