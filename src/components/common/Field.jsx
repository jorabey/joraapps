import { useState, useId } from 'react';
import { IconEye, IconEyeOff } from './icons';
import './field.css';

export function Field({
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  icon,
  as = 'input',
  options,
  ...rest
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && <label htmlFor={id} className="field__label">{label}</label>}
      <div className="field__control">
        {icon && <span className="field__icon">{icon}</span>}
        {as === 'select' ? (
          <select id={id} className="field__input" value={value} onChange={onChange} {...rest}>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : as === 'textarea' ? (
          <textarea id={id} className="field__input field__input--area" value={value} onChange={onChange} {...rest} />
        ) : (
          <input id={id} type={inputType} className="field__input" value={value} onChange={onChange} {...rest} />
        )}
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <IconEyeOff width={18} height={18} /> : <IconEye width={18} height={18} />}
          </button>
        )}
      </div>
      {error ? <span className="field__msg field__msg--error">{error}</span> : hint ? (
        <span className="field__msg">{hint}</span>
      ) : null}
    </div>
  );
}
