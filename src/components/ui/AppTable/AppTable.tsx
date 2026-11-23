import type { CSSProperties, ReactNode, TableHTMLAttributes } from 'react';
import styles from './AppTable.module.css';
import clsx from 'clsx';

export type AppTableColumn<TItem> = {
    key: string;
    header: string;
    render: (item: TItem) => ReactNode;
    width?: CSSProperties['width'];
    align?: 'left' | 'center' | 'right';
    className?: string;
};

export type AppTableProps<TItem> = {
    columns: AppTableColumn<TItem>[];
    items: TItem[];
    getKey: (item: TItem) => string;
    emptyListMessage?: string;
} & TableHTMLAttributes<HTMLTableElement>;

export default function AppTable<TItem>({
    columns,
    items,
    getKey,
    emptyListMessage = 'Aucune donnée à afficher',
    className,
    ...rest
}: AppTableProps<TItem>) {
    return (
        <table className={clsx(styles.table, className)} {...rest}>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th
                            key={column.key}
                            className={column.className}
                            style={{ width: column.width }}
                            data-align={column.align}
                        >
                            {column.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {items.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className={styles.empty}>
                            {emptyListMessage}
                        </td>
                    </tr>
                ) : (
                    items.map((item) => (
                        <tr key={getKey(item)}>
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={column.className}
                                    data-align={column.align}
                                >
                                    {column.render(item)}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}
