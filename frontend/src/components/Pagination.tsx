interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, total, onChange }: PaginationProps) => {
  const button =
    "rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        {total} {total === 1 ? "receta" : "recetas"}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={button} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ← Anterior
        </button>
        <span className="text-sm text-slate-700">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          className={button}
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Siguiente →
        </button>
      </div>
    </nav>
  );
};
