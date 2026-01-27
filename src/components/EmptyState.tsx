export function EmptyState() {
  return (
    <div className="card-brutal p-8 bg-white text-center">
      <div className="w-24 h-24 mx-auto mb-4 bg-cream-dark brutal-border brutal-shadow flex items-center justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-muted"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M12 18v-6" />
          <path d="M9 15l3-3 3 3" />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-navy mb-2">
        NO FILES YET
      </h3>
      <p className="text-sm text-text-muted mb-4 font-mono">
        Drop files above or click to browse
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <div className="flex items-center gap-2 p-2 bg-cream-dark brutal-border-2">
          <div className="w-8 h-8 bg-purple brutal-border-2 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <span className="text-xs font-mono text-navy">HEIC, PNG, JPG</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-cream-dark brutal-border-2">
          <div className="w-8 h-8 bg-coral brutal-border-2 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <span className="text-xs font-mono text-navy">PDF, WEBP, GIF</span>
        </div>
      </div>

      <div className="mt-6 p-3 bg-yellow/20 brutal-border-2 border-yellow">
        <p className="text-xs font-bold text-navy flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          100% OFFLINE - Your files never leave your computer
        </p>
      </div>
    </div>
  );
}
