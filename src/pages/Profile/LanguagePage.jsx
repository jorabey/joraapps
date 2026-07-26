import { PageHeader } from '../../components/layout/PageHeader';
import { IconCheck } from '../../components/common/icons';
import { useLang } from '../../context/LangContext';
import { LANGUAGES } from '../../utils/i18n';
import { useToast } from '../../context/ToastContext';
import './sub-page.css';
import './language.css';

export default function LanguagePage() {
  const { lang, setLang, t } = useLang();
  const { showToast } = useToast();

  const select = (code) => {
    setLang(code);
    showToast(t('saved'), 'success');
  };

  return (
    <div className="sub-page">
      <PageHeader title={t('profile_language')} />
      <div className="sub-page__body">
        <div className="sub-section">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={`lang-row ${lang === l.code ? 'lang-row--active' : ''}`}
              onClick={() => select(l.code)}
            >
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-name">{l.label}</span>
              {lang === l.code && (
                <IconCheck width={18} height={18} style={{ color: 'var(--accent)', marginLeft: 'auto' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
