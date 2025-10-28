import type { RouterOutput } from "@packages/api/client";
import type { ReactNode } from "react";
import React, {
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react";

// import { useTRPC } from "@/integrations/clients";
// import { useSubscription } from "@trpc/tanstack-react-query";

interface IdeasListContextType {
   // Pagination state
   page: number;
   totalPages: number;
   setPage: (page: number) => void;
   handlePageChange: (newPage: number) => void;

   // Selection state
   selectedItems: Set<string>;
   handleSelectionChange: (id: string, selected: boolean) => void;
   allSelected: boolean;
   handleSelectAll: () => void;
   clearSelection: () => void;
   selectedItemsCount: number;

   // Data state
   data?: RouterOutput["ideas"]["listAllIdeas"];
   selectableItems: RouterOutput["ideas"]["listAllIdeas"]["items"];

   // Filtering state
   agentId?: string;

   // Constants
   limit: number;
   total: number;
}

const IdeasListContext = createContext<IdeasListContextType | null>(null);

export const useIdeasList = () => {
   const context = useContext(IdeasListContext);
   if (!context) {
      throw new Error("useIdeasList must be used within an IdeasListProvider");
   }
   return context;
};

interface IdeasListProviderProps {
   children: ReactNode;
   data?: RouterOutput["ideas"]["listAllIdeas"];
   agentId?: string;
}

export function IdeasListProvider({
   children,
   data,
   agentId,
}: IdeasListProviderProps) {
   const [page, setPage] = useState(1);
   const [limit] = useState(8);
   const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
   // const trpc = useTRPC();

   const totalPages = useMemo(() => {
      return Math.ceil((data?.total || 0) / limit);
   }, [data?.total, limit]);

   const handlePageChange = useCallback((newPage: number) => {
      setPage(newPage);
   }, []);

   const handleSelectionChange = useCallback(
      (id: string, selected: boolean) => {
         setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (selected) {
               newSet.add(id);
            } else {
               newSet.delete(id);
            }
            return newSet;
         });
      },
      [],
   );

   const selectableItems = useMemo(() => {
      return data?.items.filter((item) => item.status === "pending") || [];
   }, [data?.items]);

   // Real-time updates

   const allSelected = useMemo(() => {
      const selectableIds = selectableItems.map(
         (item: RouterOutput["ideas"]["listAllIdeas"]["items"][0]) => item.id,
      );
      return (
         selectableIds.length > 0 &&
         selectableIds.every((id: string) => selectedItems.has(id))
      );
   }, [selectableItems, selectedItems]);

   const handleSelectAll = useCallback(() => {
      const selectableIds = selectableItems.map(
         (item: RouterOutput["ideas"]["listAllIdeas"]["items"][0]) => item.id,
      );

      setSelectedItems(() => {
         if (allSelected) {
            // If all items are selected, deselect all
            return new Set();
         } else {
            // Select all selectable items (replace any existing selection)
            return new Set(selectableIds);
         }
      });
   }, [selectableItems, allSelected]);

   const clearSelection = useCallback(() => {
      setSelectedItems(new Set());
   }, []);

   const value: IdeasListContextType = {
      // Real-time updates

      // Filtering
      agentId,
      allSelected,
      clearSelection,

      // Data
      data,
      handlePageChange,
      handleSelectAll,
      handleSelectionChange,

      // Constants
      limit,
      // Pagination
      page,
      selectableItems,

      // Selection
      selectedItems,
      selectedItemsCount: selectedItems.size,
      setPage,
      total: data?.total ?? 0,
      totalPages,
   };

   return React.createElement(IdeasListContext.Provider, { value }, children);
}
