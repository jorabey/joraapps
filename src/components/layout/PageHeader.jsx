import { useNavigate } from 'react-router-dom';
import { IconChevronLeft } from '../common/icons';
import './pageheader.css';

export function PageHeader({ title, onBack, right }) {
  const navigate = useNavigate();
  return (
    <header className="pageheader">
      <button className="pageheader__back" onClick={() => (onBack ? onBack() : navigate(-1))} aria-label="Back">
        <IconChevronLeft width={22} height={22} />
      </button>
      <h1 className="pageheader__title heading">{title}</h1>
      <div className="pageheader__right">{right}</div>
    </header>
  );
}
