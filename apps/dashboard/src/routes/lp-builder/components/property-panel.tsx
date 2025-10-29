import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { Textarea } from "@packages/ui/components/textarea";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface ArrayItemSchema {
   key: string;
   label: string;
   type: "text" | "textarea" | "url" | "number" | "select";
   options?: string[];
}

interface PropertyInputConfig {
   key: string;
   label: string;
   type: "text" | "textarea" | "url" | "number" | "array";
   placeholder?: string;
   group?: string;
   arrayItemSchema?: ArrayItemSchema[];
}

interface PropertyPanelProps {
   blockName: string;
   properties: PropertyInputConfig[];
   values: Record<string, any>;
   onChange: (key: string, value: any) => void;
}

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: Record<string, any>, path: string): any {
   const keys = path.split(".");
   let value = obj;
   for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return "";
   }
   return value || "";
}

function ArrayEditor({
   propKey,
   schema,
   values,
   onChange,
}: {
   propKey: string;
   schema: ArrayItemSchema[];
   values: Record<string, any>;
   onChange: (key: string, value: any) => void;
}) {
   const arrayValue = getNestedValue(values, propKey);
   const items = Array.isArray(arrayValue) ? arrayValue : [];
   const [expandedItems, setExpandedItems] = useState<Set<number>>(
      new Set([0]),
   );

   const handleAddItem = () => {
      const newItem: Record<string, any> = {};
      schema.forEach((field) => {
         newItem[field.key] = "";
      });
      onChange(propKey, [...items, newItem]);
      // Auto-expand newly added item
      setExpandedItems((prev) => new Set(prev).add(items.length));
   };

   const handleRemoveItem = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      onChange(propKey, newItems);
      // Remove from expanded set
      setExpandedItems((prev) => {
         const newSet = new Set(prev);
         newSet.delete(index);
         return newSet;
      });
   };

   const handleUpdateItem = (index: number, fieldKey: string, value: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [fieldKey]: value };
      onChange(propKey, newItems);
   };

   const toggleExpanded = (index: number) => {
      setExpandedItems((prev) => {
         const newSet = new Set(prev);
         if (newSet.has(index)) {
            newSet.delete(index);
         } else {
            newSet.add(index);
         }
         return newSet;
      });
   };

   // Get a preview of the item for collapsed state
   const getItemPreview = (item: any): string => {
      const firstField = schema[0];
      if (!firstField) return "";
      const value = item[firstField.key];
      return value ? String(value).slice(0, 30) : "Empty";
   };

   return (
      <div className="space-y-2">
         {items.map((item, index) => {
            const isExpanded = expandedItems.has(index);
            return (
               <div
                  className="border border-border rounded-md bg-muted/30 overflow-hidden"
                  key={index}
               >
                  <div className="flex items-center justify-between p-2 bg-muted/50">
                     <button
                        className="flex items-center gap-2 flex-1 text-left hover:opacity-70 transition-opacity"
                        onClick={() => toggleExpanded(index)}
                        type="button"
                     >
                        {isExpanded ? (
                           <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                           <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium">
                           Item {index + 1}
                        </span>
                        {!isExpanded && (
                           <span className="text-xs text-muted-foreground truncate">
                              - {getItemPreview(item)}
                           </span>
                        )}
                     </button>
                     <Button
                        className="h-7 w-7 p-0"
                        onClick={() => handleRemoveItem(index)}
                        size="sm"
                        type="button"
                        variant="ghost"
                     >
                        <Trash2 className="h-3 w-3 text-destructive" />
                     </Button>
                  </div>
                  {isExpanded && (
                     <div className="p-3 space-y-3">
                        {schema.map((field) => (
                           <div className="space-y-1" key={field.key}>
                              <Label
                                 className="text-xs"
                                 htmlFor={`${propKey}-${index}-${field.key}`}
                              >
                                 {field.label}
                              </Label>
                              {field.type === "select" && field.options ? (
                                 <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    id={`${propKey}-${index}-${field.key}`}
                                    onChange={(e) =>
                                       handleUpdateItem(
                                          index,
                                          field.key,
                                          e.target.value,
                                       )
                                    }
                                    value={item[field.key] || ""}
                                 >
                                    <option value="">Select...</option>
                                    {field.options.map((option) => (
                                       <option key={option} value={option}>
                                          {option}
                                       </option>
                                    ))}
                                 </select>
                              ) : field.type === "textarea" ? (
                                 <Textarea
                                    className="min-h-20 text-xs"
                                    id={`${propKey}-${index}-${field.key}`}
                                    onChange={(e) =>
                                       handleUpdateItem(
                                          index,
                                          field.key,
                                          e.target.value,
                                       )
                                    }
                                    value={item[field.key] || ""}
                                 />
                              ) : (
                                 <Input
                                    className="text-xs h-8"
                                    id={`${propKey}-${index}-${field.key}`}
                                    onChange={(e) =>
                                       handleUpdateItem(
                                          index,
                                          field.key,
                                          e.target.value,
                                       )
                                    }
                                    type={field.type}
                                    value={item[field.key] || ""}
                                 />
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            );
         })}
         <Button
            className="w-full"
            onClick={handleAddItem}
            size="sm"
            type="button"
            variant="outline"
         >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
         </Button>
      </div>
   );
}

export function PropertyPanel({
   blockName,
   properties,
   values,
   onChange,
}: PropertyPanelProps) {
   const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
      new Set(["General", "Content"]),
   );

   // Group properties by their group field
   const groupedProperties = properties.reduce(
      (acc, prop) => {
         const group = prop.group || "General";
         if (!acc[group]) acc[group] = [];
         acc[group].push(prop);
         return acc;
      },
      {} as Record<string, PropertyInputConfig[]>,
   );

   const toggleGroup = (groupName: string) => {
      setExpandedGroups((prev) => {
         const newSet = new Set(prev);
         if (newSet.has(groupName)) {
            newSet.delete(groupName);
         } else {
            newSet.add(groupName);
         }
         return newSet;
      });
   };

   return (
      <div className="w-80 bg-card border-l border-border flex flex-col h-screen overflow-hidden">
         <div className="border-b border-border p-4 sticky top-0 bg-card z-10">
            <h2 className="font-semibold text-lg">{blockName}</h2>
            <p className="text-xs text-muted-foreground">
               Edit block properties
            </p>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Object.entries(groupedProperties).map(([groupName, props]) => {
               const isExpanded = expandedGroups.has(groupName);
               return (
                  <div
                     className="border border-border rounded-lg overflow-hidden"
                     key={groupName}
                  >
                     <button
                        className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                        onClick={() => toggleGroup(groupName)}
                        type="button"
                     >
                        <h3 className="text-sm font-semibold uppercase tracking-wide">
                           {groupName}
                        </h3>
                        {isExpanded ? (
                           <ChevronDown className="h-4 w-4" />
                        ) : (
                           <ChevronRight className="h-4 w-4" />
                        )}
                     </button>
                     {isExpanded && (
                        <div className="p-3 space-y-4 bg-card">
                           {props.map((prop) => (
                              <div className="space-y-2" key={prop.key}>
                                 <Label
                                    className="text-sm font-medium"
                                    htmlFor={prop.key}
                                 >
                                    {prop.label}
                                 </Label>
                                 {prop.type === "array" &&
                                 prop.arrayItemSchema ? (
                                    <ArrayEditor
                                       onChange={onChange}
                                       propKey={prop.key}
                                       schema={prop.arrayItemSchema}
                                       values={values}
                                    />
                                 ) : prop.type === "textarea" ? (
                                    <Textarea
                                       className="min-h-24 text-sm"
                                       id={prop.key}
                                       onChange={(e) =>
                                          onChange(prop.key, e.target.value)
                                       }
                                       placeholder={prop.placeholder}
                                       value={getNestedValue(values, prop.key)}
                                    />
                                 ) : (
                                    <Input
                                       className="text-sm"
                                       id={prop.key}
                                       onChange={(e) =>
                                          onChange(prop.key, e.target.value)
                                       }
                                       placeholder={prop.placeholder}
                                       type={prop.type}
                                       value={getNestedValue(values, prop.key)}
                                    />
                                 )}
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      </div>
   );
}
