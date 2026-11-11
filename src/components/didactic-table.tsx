import type { ReactNode } from "react";

type Column = { key: string; label: string };
type Cell = ReactNode;

export function DidacticTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: Column[];
  rows: Record<string, Cell>[];
}) {
  return (
    <figure className="my-6">
      <figcaption className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-info">
        {caption}
      </figcaption>
      <div className="content-table-wrap" tabIndex={0} role="region" aria-label={caption}>
        <table className="content-table">
          <thead className="content-table-head">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="content-table-cell content-table-header">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="content-table-body">
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className="content-table-cell">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
