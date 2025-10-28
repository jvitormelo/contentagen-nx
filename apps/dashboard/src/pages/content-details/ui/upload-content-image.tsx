import type { ContentSelect } from "@packages/database/schemas/content";
import { translate } from "@packages/localization";
import { Button } from "@packages/ui/components/button";
import {
   Credenza,
   CredenzaBody,
   CredenzaClose,
   CredenzaContent,
   CredenzaDescription,
   CredenzaFooter,
   CredenzaHeader,
   CredenzaTitle,
} from "@packages/ui/components/credenza";
import {
   Dropzone,
   DropzoneContent,
   DropzoneEmptyState,
} from "@packages/ui/components/dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/integrations/clients";

interface UploadContentImageProps {
   content: ContentSelect;
   open?: boolean;
   onOpenChange?: (open: boolean) => void;
}

export function UploadContentImage({
   content,
   open,
   onOpenChange,
}: UploadContentImageProps) {
   const isControlled = open !== undefined && onOpenChange !== undefined;
   const [internalOpen, setInternalOpen] = useState(false);

   const isOpen = isControlled ? open : internalOpen;
   const setIsOpen = isControlled ? onOpenChange : setInternalOpen;
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [filePreview, setFilePreview] = useState<string | undefined>();
   const queryClient = useQueryClient();
   const trpc = useTRPC();

   // Fetch the current content image using the streaming route
   const { data: currentImageData } = useQuery(
      trpc.content.images.getImage.queryOptions({
         id: content.id,
      }),
   );

   // Determine what image to display: new preview, existing image, or nothing
   const displayImage = filePreview || currentImageData?.data;

   const uploadImageMutation = useMutation(
      trpc.content.images.uploadImage.mutationOptions({
         onError: (error) => {
            console.error("Upload error:", error);
            toast.error(translate("pages.content-details.upload.error"));
         },
         onSuccess: async () => {
            toast.success(translate("pages.content-details.upload.success"));
            await queryClient.invalidateQueries({
               queryKey: trpc.content.get.queryKey({ id: content.id }),
            });
            await queryClient.invalidateQueries({
               queryKey: trpc.content.images.getImage.queryKey({
                  id: content.id,
               }),
            });
            setIsOpen(false);
            setSelectedFile(null);
            setFilePreview(undefined);
         },
      }),
   );

   const handleFileSelect = (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
         toast.error(
            translate("pages.content-details.upload.validation.invalid-file"),
         );
         return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
         toast.error(
            translate("pages.content-details.upload.validation.file-too-large"),
         );
         return;
      }

      setSelectedFile(file);

      // Create file preview
      const reader = new FileReader();
      reader.onload = (e) => {
         if (typeof e.target?.result === "string") {
            setFilePreview(e.target.result);
         }
      };
      reader.readAsDataURL(file);
   };

   const handleUpload = async () => {
      if (!selectedFile) return;

      try {
         // Use FileReader for efficient base64 conversion
         const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
               const result = reader.result as string;
               // Remove the data URL prefix to get just the base64
               const base64Data = result.split(",")[1];
               if (!base64Data) {
                  reject(new Error("Failed to extract base64 data"));
                  return;
               }
               resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
         });

         await uploadImageMutation.mutateAsync({
            contentType: selectedFile.type,
            fileBuffer: base64,
            fileName: selectedFile.name,
            id: content.id,
         });
      } catch (error) {
         console.error("Upload failed:", error);
         toast.error(translate("pages.content-details.upload.error"));
      }
   };

   return (
      <Credenza onOpenChange={setIsOpen} open={isOpen}>
         <CredenzaContent className="sm:max-w-md">
            <CredenzaHeader>
               <CredenzaTitle>
                  {translate("pages.content-details.upload.title")}
               </CredenzaTitle>
               <CredenzaDescription>
                  {translate("pages.content-details.upload.description")}
               </CredenzaDescription>
            </CredenzaHeader>
            <CredenzaBody className="space-y-4">
               {/* Dropzone */}
               <Dropzone
                  accept={{
                     "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                  }}
                  disabled={uploadImageMutation.isPending} // 10MB
                  maxFiles={1}
                  maxSize={10 * 1024 * 1024}
                  onDrop={handleFileSelect}
                  src={selectedFile ? [selectedFile] : undefined}
               >
                  <DropzoneEmptyState>
                     {currentImageData?.data && (
                        <img
                           alt="content-photo"
                           className="h-full w-full object-contain"
                           src={currentImageData.data}
                        />
                     )}
                  </DropzoneEmptyState>
                  <DropzoneContent>
                     {displayImage && (
                        <img
                           alt="Preview"
                           className="h-full w-full object-contain rounded-md"
                           src={displayImage}
                        />
                     )}
                  </DropzoneContent>
               </Dropzone>
            </CredenzaBody>
            <CredenzaFooter className="grid grid-cols-2 gap-2">
               <CredenzaClose asChild>
                  <Button variant="outline">
                     {translate("common.actions.cancel")}
                  </Button>
               </CredenzaClose>
               <Button
                  disabled={!selectedFile || uploadImageMutation.isPending}
                  onClick={handleUpload}
               >
                  {uploadImageMutation.isPending
                     ? translate("pages.content-details.upload.uploading")
                     : translate("pages.content-details.upload.upload-button")}
               </Button>
            </CredenzaFooter>
         </CredenzaContent>
      </Credenza>
   );
}
