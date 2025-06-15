import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

type Props = {
    currentPage: number;
    totalPages: number;
    basePath: string;
    onPageChange?: (page: number) => void;
};

export function PaginationControls({ currentPage, totalPages, basePath, onPageChange }: Props) {
    const generatePageUrl = (page: number) => {
        return `${basePath}/page/${page}`;
    };

    const handlePageClick = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    const getVisiblePages = () => {
        const pages = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious
                            href={onPageChange ? undefined : generatePageUrl(currentPage - 1)}
                            onClick={onPageChange ? () => handlePageClick(currentPage - 1) : undefined}
                        />
                    </PaginationItem>
                )}

                {getVisiblePages().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href={onPageChange ? undefined : generatePageUrl(page as number)}
                                isActive={page === currentPage}
                                onClick={onPageChange ? () => handlePageClick(page as number) : undefined}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext
                            href={onPageChange ? undefined : generatePageUrl(currentPage + 1)}
                            onClick={onPageChange ? () => handlePageClick(currentPage + 1) : undefined}
                        />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}
