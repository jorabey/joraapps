import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Field } from '../../components/common/Field';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import { userApi } from '../../api/user';
import { ApiError } from '../../api/client';
import './sub-page.css';

export default function ProfileEditPage() {
  const { user, refreshMe } = useAuth();
  const { showToast } = useToast();
  const { t } = useLang();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSave = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      await userApi.updateMe({ firstName: firstName.trim(), lastName: lastName.trim() });
      await refreshMe();
      showToast(t('saved'), 'success');
      navigate(-1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sub-page">
      <PageHeader
        title={t('profile_edit')}
        right={
          <Button variant="text" onClick={onSave} loading={loading}>
            {t('edit_save')}
          </Button>
        }
      />
      <div className="sub-page__body">
        {error && <div className="sub-error">{error}</div>}
        <Field
          label={t('edit_first_name')}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
        />
        <Field
          label={t('edit_last_name')}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
        />

        <div className="sub-info-row">
          <span className="sub-info-label">Username</span>
          <span className="sub-info-val">@{user?.username}</span>
        </div>
        <div className="sub-info-row">
          <span className="sub-info-label">Email</span>
          <span className="sub-info-val">{user?.email}</span>
        </div>
        {user?.phone && (
          <div className="sub-info-row">
            <span className="sub-info-label">Phone</span>
            <span className="sub-info-val">{user.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
