import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface AnimatedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  showPreviousNext?: boolean;
  showFirstLast?: boolean;
  className?: string;
}

export function AnimatedPagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  showPreviousNext = true,
  showFirstLast = false,
  className,
}: AnimatedPaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);
    
    if (currentPage <= half + 1) {
      end = Math.min(totalPages, maxVisiblePages);
    }
    
    if (currentPage >= totalPages - half) {
      start = Math.max(1, totalPages - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (start > 2 && maxVisiblePages < totalPages) {
      pages.unshift("...");
    }
    
    if (start > 1) {
      pages.unshift(1);
    }
    
    if (end < totalPages - 1 && maxVisiblePages < totalPages) {
      pages.push("...");
    }
    
    if (end < totalPages) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <motion.div 
      className={cn("flex items-center justify-center gap-1", className)}
      layout
    >
      {showPreviousNext && (
        <motion.div layout>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 w-9 hover:bg-accent/50 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {showFirstLast && currentPage > 3 && totalPages > maxVisiblePages && (
        <motion.div layout>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            className="h-9 min-w-[2rem] hover:bg-accent/50 transition-colors"
          >
            1
          </Button>
        </motion.div>
      )}

      {visiblePages.map((page, index) => {
        if (typeof page === "string") {
          return (
            <motion.div
              key={`ellipsis-${index}`}
              layout
              className="flex h-9 w-8 items-center justify-center text-sm text-muted-foreground"
            >
              {page}
            </motion.div>
          );
        }

        const isActive = page === currentPage;

        return (
          <motion.div key={page} layout>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                "h-9 min-w-[2rem] transition-colors duration-200",
                isActive && "bg-primary text-primary-foreground shadow-sm",
                !isActive && "hover:bg-accent/50"
              )}
            >
              {page}
            </Button>
          </motion.div>
        );
      })}

      {showFirstLast && currentPage < totalPages - 2 && totalPages > maxVisiblePages && (
        <motion.div layout>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="h-9 min-w-[2rem] hover:bg-accent/50 transition-colors"
          >
            {totalPages}
          </Button>
        </motion.div>
      )}

      {showPreviousNext && (
        <motion.div layout>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-9 w-9 hover:bg-accent/50 disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}