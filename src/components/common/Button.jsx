import './button.css';

export function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${
        loading ? 'btn--loading' : ''
      } ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : (
        icon && <span className="btn__icon">{icon}</span>
      )}
      <span className="btn__label">{children}</span>
    </Tag>
  );
}
