import React, { useMemo, useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function DataTable({
    data = [],
    columns = [],
    searchPlaceholder = 'Cari data...',
    filterColumn = null,
    filterOptions = [],
    emptyText = 'Belum ada data tersedia.',
    onRowClick = null,
}) {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
            columnFilters,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10 },
        },
    });

    const selectedFilterValue = useMemo(() => {
        if (!filterColumn) return '';
        return table.getColumn(filterColumn)?.getFilterValue() ?? '';
    }, [filterColumn, columnFilters, table]);

    return (
        <div className="space-y-3">
            {/* Bootstrap-style Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-[#6c757d] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="bs-form-control pl-9"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {filterColumn && filterOptions.length > 0 && (
                        <select
                            className="bs-form-select w-auto min-w-[170px]"
                            value={selectedFilterValue}
                            onChange={(e) =>
                                table.getColumn(filterColumn)?.setFilterValue(e.target.value || undefined)
                            }
                        >
                            <option value="">Semua Status</option>
                            {filterOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    )}

                    <select
                        className="bs-form-select w-auto"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                    >
                        {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                                {size} / hal
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bootstrap-style Responsive Table */}
            <div className="bs-table-responsive">
                <table className="bs-table">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort();
                                    return (
                                        <th
                                            key={header.id}
                                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                            className={canSort ? 'cursor-pointer hover:bg-[#e9ecef]' : ''}
                                        >
                                            <div className="inline-flex items-center gap-1">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                                {canSort && <ArrowUpDown className="w-3.5 h-3.5 text-[#6c757d]" />}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-8 text-[#6c757d]">
                                    {emptyText}
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={
                                        onRowClick
                                            ? (e) => {
                                                  if (e.target.closest('button, a, input, select, textarea')) {
                                                      return;
                                                  }
                                                  onRowClick(row.original);
                                              }
                                            : undefined
                                    }
                                    className={onRowClick ? 'cursor-pointer' : ''}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bootstrap-style Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6c757d]">
                <div>
                    Menampilkan{' '}
                    <span className="font-semibold text-[#212529]">
                        {table.getRowModel().rows.length}
                    </span>{' '}
                    dari{' '}
                    <span className="font-semibold text-[#212529]">
                        {table.getFilteredRowModel().rows.length}
                    </span>{' '}
                    data
                </div>

                <div className="inline-flex items-center gap-1">
                    <button
                        type="button"
                        className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Sebelumnya
                    </button>
                    <span className="px-2.5 py-1 text-xs font-medium text-[#212529] bg-[#f8f9fa] border border-[#dee2e6] rounded">
                        Hal {table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
                    </span>
                    <button
                        type="button"
                        className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Berikutnya
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
