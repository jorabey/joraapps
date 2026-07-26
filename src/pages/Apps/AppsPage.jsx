import { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { AppCard } from '../../components/common/AppCard';
import { OrbitLoader } from '../../components/common/OrbitMark';
import { appsApi } from '../../api/apps';
import { connectionsApi } from '../../api/connections';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import '../../components/modals/modals.css';
import './apps.css';

const SORT_OPTIONS = [
  { key: 'rating', label_key: 'filter_top' },
  { key: 'mau',    label_key: 'filter_popular' },
  { key: 'newest', label_key: 'filter_new' },
];

export default function AppsPage() {
  const { user } = useAuth();
  const { t } = useLang();

  const [apps, setApps] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const [query, setQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);

  // Map appId -> connectionStatus for logged-in user
  const [connMap, setConnMap] = useState({});
  const [connsLoading, setConnsLoading] = useState(true);

  const sentinelRef = useRef(null);
  const searchTimerRef = useRef(null);

  /* ---- Load user connections ---- */
  useEffect(() => {
  if (!user) {
    setConnsLoading(false); // Foydalanuvchi bo'lmasa yuklanishni to'xtatamiz
    return;
  }

  setConnsLoading(true); // 🚀 2. So'rov boshlanishidan oldin true qilamiz
  connectionsApi.getMyConnections({ limit: 49 })
    .then(({ docs }) => {
      const map = {};
      (docs || []).forEach((c) => {
        const id = c.app?.id || c.app;
        if (id) map[id] = c.status;
      });
      setConnMap(map);
    })
    .catch((err) => {
      console.error("Error loading links:", err);
    })
    .finally(() => {
      setConnsLoading(false); // 🚀 3. So'rov tugagach (muvaffaqiyatli yoki xato) false qilamiz
    });
}, [user]);
  /* ---- Load apps ---- */
  const loadApps = useCallback(async (pg = 1, sort = sortBy, reset = false) => {
    if (pg === 1) setLoadingInitial(true);
    else setLoadingMore(true);
    try {
      const res = await appsApi.getApps({ page: pg, limit: 20, sortBy: sort });
      const docs = res.data || res.docs || res.results || [];
      setApps((prev) => (reset || pg === 1 ? docs : [...prev, ...docs]));
      setHasMore(docs.length === 20);
      setPage(pg);
    } catch {
      // Silent fail — could show error toast
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadApps(1, sortBy, true);
  }, [sortBy]); // eslint-disable-line

  /* ---- Infinite scroll sentinel ---- */
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !query) {
          setLoadingMore(true);
          loadApps(page + 1);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, page, query, loadApps]);

  /* ---- Search ---- */
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    if (!query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await appsApi.searchApps({ q: query.trim(), page: 1 });
        const docs = res.data || res.docs || res.results || [];
        setSearchResults(docs);
        setSearchPage(1);
        setSearchHasMore(docs.length === 20);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 320);
    return () => clearTimeout(searchTimerRef.current);
  }, [query]);

  const loadMoreSearch = async () => {
    if (!searchHasMore || searchLoading) return;
    setSearchLoading(true);
    try {
      const res = await appsApi.searchApps({ q: query.trim(), page: searchPage + 1 });
      const docs = res.data || res.docs || res.results || [];
      setSearchResults((prev) => [...prev, ...docs]);
      setSearchPage((p) => p + 1);
      setSearchHasMore(docs.length === 20);
    } finally {
      setSearchLoading(false);
    }
  };

  const onStatusChange = (appId, status) => {
    setConnMap((m) => ({ ...m, [appId]: status }));
  };

  const displayApps = query ? searchResults : apps;

  return (
    <div className="apps-page">
      <TopBar
        query={query}
        onQueryChange={setQuery}
        searchActive={searchActive}
        onSearchToggle={setSearchActive}
      />

      {/* Sort filters */}
      {!query && (
        <div className="apps-filters">
          {SORT_OPTIONS.map(({ key, label_key }) => (
            <button
              key={key}
              className={`apps-filter-chip ${sortBy === key ? 'apps-filter-chip--active' : ''}`}
              onClick={() => setSortBy(key)}
            >
              {t(label_key)}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <main className="apps-grid-wrap">
        {connsLoading ? (
          <div className="apps-loader">
            <OrbitLoader size={44} />
          </div>
        ) : displayApps.length === 0 && !searchLoading ? (
          <div className="apps-empty">
            <p>{query ? t('no_results') : 'Applications not loaded'}</p>
          </div>
        ) : (
          <div className="apps-grid">
            {displayApps.map((app) => (
              <AppCard
                key={app._id}
                app={app}
                connectionStatus={connMap[app._id] || null}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel / load more for search */}
        {query ? (
          searchHasMore && (
            <div className="apps-more-sentinel">
              {searchLoading
                ? <OrbitLoader size={30} />
                : <button className="apps-load-more" onClick={loadMoreSearch}>{t('loading')}</button>
              }
            </div>
          )
        ) : (
          <div ref={sentinelRef} className="apps-more-sentinel">
            {loadingMore && <OrbitLoader size={30} />}
            {!hasMore && apps.length > 0 && (
              <p className="apps-end">{t('end_of_list')}</p>
            )}
          </div>
        )}

        {searchLoading && searchResults.length === 0 && query && (
          <div className="apps-loader"><OrbitLoader size={36} /></div>
        )}
      </main>
    </div>
  );
}
