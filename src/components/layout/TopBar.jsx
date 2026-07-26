import { useNavigate } from 'react-router-dom';
import { IconSearch, IconClose } from '../common/icons';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import './topbar.css';

export function TopBar({ query, onQueryChange, searchActive, onSearchToggle }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLang();

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '';

  return (
    <header className="topbar">
      <button
        className="topbar__avatar"
        onClick={() => navigate('/profile')}
        aria-label="Profile"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="" />
        ) : (
          <span>{initials || '?'}</span>
        )}
      </button>

      <div className={`topbar__search ${searchActive ? 'is-active' : ''}`}>
        <IconSearch width={18} height={18} className="topbar__search-icon" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => onSearchToggle(true)}
          placeholder={t('search_placeholder')}
          inputMode="search"
          enterKeyHint="search"
        />
        {query && (
          <button
            className="topbar__clear"
            onClick={() => {
              onQueryChange('');
            }}
            aria-label="Clear"
          >
            <IconClose width={14} height={14} />
          </button>
        )}
      </div>

      {searchActive && (
        <button
          className="topbar__cancel"
          onClick={() => {
            onQueryChange('');
            onSearchToggle(false);
          }}
        >
          {t('cancel')}
        </button>
      )}
    </header>
  );
}
