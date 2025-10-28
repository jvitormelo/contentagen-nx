import type { RouterInput, RouterOutput } from "@packages/api/client";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import React, {
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react";

export type ContentStatuses =
   RouterInput["content"]["listAllContent"]["status"];

interface ContentListContextType {
   // Pagination state
   page: number;
   totalPages: number;
   handlePageChange: (newPage: number) => void;

   // Selection state
   selectedItems: Set<string>;
   handleSelectionChange: (id: string, selected: boolean) => void;
   allSelectableSelected: boolean;
   handleSelectAll: () => void;
   clearSelection: () => void;
   selectedItemsCount: number;

   // Filtering state
   selectedStatuses: ContentStatuses;
   selectedAgents: string[];
   setSelectedStatuses: (statuses: ContentStatuses) => void;
   setSelectedAgents: (agents: string[]) => void;

   // Data state
   data?: RouterOutput["content"]["listAllContent"];
   agents?: RouterOutput["agent"]["list"]["items"];
   hasGeneratingContent: boolean;
   selectableItems: RouterOutput["content"]["listAllContent"]["items"];

   // Constants
   limit: number;
   allStatuses: ContentStatuses;
   filteredStatuses: ContentStatuses;
}

const ContentListContext = createContext<ContentListContextType | null>(null);

export const useContentList = () => {
   const context = useContext(ContentListContext);
   if (!context) {
      throw new Error(
         "useContentList must be used within a ContentListProvider",
      );
   }
   return context;
};

interface ContentListProviderProps {
   children: ReactNode;
   data?: RouterOutput["content"]["listAllContent"];
   agents?: RouterOutput["agent"]["list"]["items"];
}

export function ContentListProvider({
   children,
   data,
   agents,
}: ContentListProviderProps) {
   const navigate = useNavigate();
   const search = useSearch({ from: "/_dashboard/content/" });
   const page = search.page;
   const [limit] = useState(8);
   const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

   const allStatuses: ContentStatuses = ["draft", "approved", "pending"];

   const [selectedStatuses, setSelectedStatuses] = useState<ContentStatuses>(
      [],
   );
   const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

   const filteredStatuses: ContentStatuses =
      selectedStatuses.length > 0 ? selectedStatuses : allStatuses;

   const hasGeneratingContent = useMemo(
      () =>
         data?.items?.some(
            (item) =>
               item.status &&
               [
                  "pending",
                  "planning",
                  "researching",
                  "writing",
                  "editing",
                  "analyzing",
                  "grammar_checking",
               ].includes(item.status),
         ) || false,
      [data],
   );

   const totalPages = useMemo(() => {
      return Math.ceil((data?.total || 0) / limit);
   }, [data?.total, limit]);

   const handlePageChange = useCallback(
      (newPage: number) => {
         navigate({
            replace: true,
            search: (prev) => ({ ...prev, page: newPage }),
            to: "/content",
         });
      },
      [navigate],
   );

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
      return (
         data?.items.filter(
            (item) =>
               ![
                  "pending",
                  "planning",
                  "researching",
                  "writing",
                  "editing",
                  "analyzing",
                  "grammar_checking",
               ].includes(item.status || ""),
         ) || []
      );
   }, [data?.items]);

   const allSelectableSelected = useMemo(() => {
      const selectableIds = selectableItems.map((item) => item.id);
      return (
         selectableIds.length > 0 &&
         selectableIds.every((id) => selectedItems.has(id))
      );
   }, [selectableItems, selectedItems]);

   const handleSelectAll = useCallback(() => {
      const selectableIds = selectableItems.map((item) => item.id);

      setSelectedItems((prev) => {
         if (allSelectableSelected) {
            // If all selectable items are selected, deselect all
            return new Set();
         } else {
            // Select all selectable items
            return new Set([...prev, ...selectableIds]);
         }
      });
   }, [selectableItems, allSelectableSelected]);

   const clearSelection = useCallback(() => {
      setSelectedItems(new Set());
   }, []);

   const value: ContentListContextType = {
      agents,
      allSelectableSelected,
      allStatuses,
      clearSelection,

      // Data
      data,
      filteredStatuses,
      handlePageChange,
      handleSelectAll,
      handleSelectionChange,
      hasGeneratingContent,

      // Constants
      limit,
      // Pagination
      page,
      selectableItems,
      selectedAgents,

      // Selection
      selectedItems,
      selectedItemsCount: selectedItems.size,

      // Filtering
      selectedStatuses,
      setSelectedAgents,
      setSelectedStatuses,
      totalPages,
   };

   return React.createElement(ContentListContext.Provider, { value }, children);
}
