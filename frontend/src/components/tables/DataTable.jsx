import { useState, useMemo } from 'react';
import { exportTableToExcel } from '../../utils/exportTable';

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export default function DataTable({ columns, data, actions }) {
  const [search, setSearch]       = useState('');
  const [sortKey, setSortKey]     = useState(null);
  const [sortDir, setSortDir]     = useState('asc');
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(10);
  const [filters, setFilters]     = useState({});

  // ── Filter columns that support filtering ───────────────────
  const filterableCols = columns.filter((c) => c.filterable && c.filterOptions);

  // ── Search + filter ─────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...data];

    // global search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => {
          const val = col.accessor ? row[col.accessor] : '';
          return String(val ?? '').toLowerCase().includes(q);
        })
      );
    }

    // column filters
    Object.entries(filters).forEach(([key, val]) => {
      if (val) rows = rows.filter((row) => String(row[key]) === val);
    });

    return rows;
  }, [data, search, filters, columns]);

  // ── Sort ─────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Pagination ───────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleFilter = (key, val) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1); };

  const sortIcon = (key) => {
    if (sortKey !== key) return <span style={s.sortNeutral}>↕</span>;
    return <span style={s.sortActive}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div style={s.wrapper}>
      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>
            <SearchIcon />
          </span>
          <input
            style={s.searchInput}
            placeholder="Search..."
            value={search}
            onChange={handleSearch}
          />
          {search && (
            <button style={s.clearBtn} onClick={() => { setSearch(''); setPage(1); }}>✕</button>
          )}
        </div>

        <div style={s.toolbarRight}>
          <div style={s.exportRow}>
            <button style={s.exportBtn} onClick={() => exportTableToExcel(columns, sorted, 'table-export')}>Excel</button>
          </div>

          <div style={s.filterRow}>
          {filterableCols.map((col) => (
            <select
              key={col.accessor}
              style={s.filterSelect}
              value={filters[col.accessor] ?? ''}
              onChange={(e) => handleFilter(col.accessor, e.target.value)}
            >
              <option value="">All {col.header}</option>
              {col.filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={s.resultsMeta}>
        Showing <strong style={{ color: '#818cf8' }}>{paginated.length}</strong> of{' '}
        <strong style={{ color: '#f1f5f9' }}>{sorted.length}</strong> results
        {(search || Object.values(filters).some(Boolean)) && (
          <button
            style={s.clearAllBtn}
            onClick={() => { setSearch(''); setFilters({}); setPage(1); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor ?? col.header}
                  style={{ ...s.th, ...(col.sortable ? s.thSortable : {}) }}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                >
                  <span style={s.thInner}>
                    {col.header}
                    {col.sortable && sortIcon(col.accessor)}
                  </span>
                </th>
              ))}
              {actions && <th style={s.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={s.emptyCell}>
                  <div style={s.emptyState}>
                    <span style={s.emptyIcon}>🔍</span>
                    <span>No results found</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  style={{ ...s.tr, ...(i % 2 === 0 ? s.trEven : {}) }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e3a5f22')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#ffffff08' : 'transparent')}
                >
                  {columns.map((col) => (
                    <td key={col.accessor ?? col.header} style={s.td}>
                      {col.render ? col.render(row[col.accessor], row) : (row[col.accessor] ?? '—')}
                    </td>
                  ))}
                  {actions && (
                    <td style={s.td}>
                      <div style={s.actionCell}>
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={s.pagination}>
        <div style={s.pageSizeWrap}>
          <span style={s.pageSizeLabel}>Rows per page:</span>
          <select
            style={s.pageSizeSelect}
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div style={s.pageInfo}>
          Page <strong style={{ color: '#f1f5f9' }}>{page}</strong> of{' '}
          <strong style={{ color: '#f1f5f9' }}>{totalPages}</strong>
        </div>

        <div style={s.pageButtons}>
          <PageBtn onClick={() => setPage(1)}          disabled={page === 1}>«</PageBtn>
          <PageBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</PageBtn>
          {getPageRange(page, totalPages).map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} style={s.ellipsis}>…</span>
            ) : (
              <PageBtn key={p} onClick={() => setPage(p)} active={p === page}>{p}</PageBtn>
            )
          )}
          <PageBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</PageBtn>
          <PageBtn onClick={() => setPage(totalPages)}   disabled={page === totalPages}>»</PageBtn>
        </div>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s.pageBtn,
        ...(active ? s.pageBtnActive : {}),
        ...(disabled ? s.pageBtnDisabled : {}),
      }}
    >
      {children}
    </button>
  );
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const s = {
  wrapper: {
    display: 'flex', flexDirection: 'column', gap: '0',
    backgroundColor: '#1e293b', borderRadius: '16px',
    border: '1px solid #334155', overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px 20px', borderBottom: '1px solid #334155',
    flexWrap: 'wrap',
  },
  toolbarRight: {
    display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', flexWrap: 'wrap',
  },
  searchWrap: {
    position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 220px',
  },
  searchIcon: {
    position: 'absolute', left: '12px', display: 'flex', alignItems: 'center', pointerEvents: 'none',
  },
  searchInput: {
    width: '100%', padding: '9px 36px 9px 36px',
    backgroundColor: '#0f172a', border: '1px solid #334155',
    borderRadius: '9px', fontSize: '13px', color: '#f1f5f9',
    outline: 'none', boxSizing: 'border-box',
  },
  clearBtn: {
    position: 'absolute', right: '10px', background: 'none', border: 'none',
    color: '#475569', cursor: 'pointer', fontSize: '12px', padding: '2px 4px',
  },
  filterRow: {
    display: 'flex', gap: '8px', flexWrap: 'wrap',
  },
  exportRow: {
    display: 'flex', gap: '8px', flexWrap: 'wrap',
  },
  exportBtn: {
    padding: '9px 12px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '9px',
    fontSize: '12px', color: '#cbd5e1', outline: 'none', cursor: 'pointer', fontWeight: '600',
  },
  filterSelect: {
    padding: '9px 12px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '9px',
    fontSize: '13px', color: '#94a3b8', outline: 'none', cursor: 'pointer',
  },
  resultsMeta: {
    padding: '10px 20px', fontSize: '12px', color: '#475569',
    borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px',
  },
  clearAllBtn: {
    background: 'none', border: 'none', color: '#f87171',
    fontSize: '12px', cursor: 'pointer', fontWeight: '500',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%', borderCollapse: 'collapse', minWidth: '700px',
  },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '600', color: '#475569',
    letterSpacing: '0.8px', textTransform: 'uppercase',
    backgroundColor: '#0f172a', borderBottom: '1px solid #334155',
    whiteSpace: 'nowrap',
  },
  thSortable: {
    cursor: 'pointer', userSelect: 'none',
  },
  thInner: {
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  sortNeutral: { color: '#334155', fontSize: '13px' },
  sortActive:  { color: '#818cf8', fontSize: '13px' },
  tr: {
    borderBottom: '1px solid #1e293b', transition: 'background 0.12s',
  },
  trEven: {
    backgroundColor: '#ffffff08',
  },
  td: {
    padding: '13px 16px', fontSize: '13px', color: '#cbd5e1',
    verticalAlign: 'middle', whiteSpace: 'nowrap',
  },
  emptyCell: {
    padding: '48px 16px', textAlign: 'center',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    color: '#475569', fontSize: '14px',
  },
  emptyIcon: { fontSize: '28px' },
  actionCell: {
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', borderTop: '1px solid #334155', flexWrap: 'wrap', gap: '12px',
  },
  pageSizeWrap: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  pageSizeLabel: {
    fontSize: '12px', color: '#475569',
  },
  pageSizeSelect: {
    padding: '5px 8px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '7px',
    fontSize: '12px', color: '#94a3b8', outline: 'none',
  },
  pageInfo: {
    fontSize: '12px', color: '#475569',
  },
  pageButtons: {
    display: 'flex', gap: '4px', alignItems: 'center',
  },
  pageBtn: {
    minWidth: '32px', height: '32px', padding: '0 8px',
    backgroundColor: '#0f172a', border: '1px solid #334155',
    borderRadius: '7px', fontSize: '13px', color: '#94a3b8',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },
  pageBtnActive: {
    backgroundColor: '#6366f1', borderColor: '#6366f1', color: '#fff', fontWeight: '600',
  },
  pageBtnDisabled: {
    opacity: 0.35, cursor: 'not-allowed',
  },
  ellipsis: {
    color: '#334155', fontSize: '13px', padding: '0 4px',
  },
};
