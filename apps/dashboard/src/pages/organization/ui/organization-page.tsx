import { betterAuthClient } from "@/integrations/clients";
import {
   Card,
   CardHeader,
   CardTitle,
   CardDescription,
   CardContent,
   CardAction,
} from "@packages/ui/components/card";
import {
   Table,
   TableHeader,
   TableBody,
   TableHead,
   TableRow,
   TableCell,
} from "@packages/ui/components/table";
import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";
import { Building2 } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { TalkingMascot } from "@/widgets/talking-mascot/ui/talking-mascot";
import { CreateOrganizationCredenza } from "../features/create-organization-credenza";

export function OrganizationPage() {
   const [open, setOpen] = useState(false);
   const { data } = useSuspenseQuery({
      queryKey: ["organizations"],
      queryFn: async () => {
         const { data, error } = await betterAuthClient.organization.list();
         if (error) throw new Error("Failed to load organizations");
         return data;
      },
   });

   // Only allow one organization per user
   const org = data?.[0];

   // Auto-open credenza if no org exists
   useEffect(() => {
      if (!org) setOpen(true);
   }, [org]);

   return (
      <div className="flex flex-col gap-4">
         <TalkingMascot message="Create and manage your organization here. Invite team members and control access." />
         <Card>
            <CardHeader>
               <CardTitle>Organization</CardTitle>
               <CardDescription>
                  Manage your organization, invite members, and control access.
                  Powered by Better Auth integration.
               </CardDescription>
               <CardAction>
                  {/* Only show create button if no org exists */}
                  {!org && (
                     <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Create Organization"
                        onClick={() => setOpen(true)}
                     >
                        <Building2 className="w-5 h-5" />
                     </Button>
                  )}
               </CardAction>
            </CardHeader>
            <CardContent>
               {/* If org exists, show its info. Otherwise, prompt to create. */}
               {org ? (
                  <>
                     {/* Card 1: Organization Details & Invite */}
                     <Card>
                        <CardHeader>
                           <CardTitle>Organization Details</CardTitle>
                           <CardDescription>
                              View your organization info and invite new
                              members.
                           </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="flex flex-col gap-2 mb-4">
                              <div>
                                 <strong>Name:</strong> {org.name}
                              </div>
                              <div>
                                 <strong>Created At:</strong>{" "}
                                 {org.createdAt
                                    ? new Date(org.createdAt).toLocaleString()
                                    : "—"}
                              </div>
                              <div>
                                 <strong>Members:</strong>{" "}
                                 {"members" in org &&
                                 Array.isArray((org as any).members)
                                    ? (org as any).members.length
                                    : "—"}
                              </div>
                           </div>
                           <div className="flex gap-2 items-center">
                              <Input
                                 placeholder="Invite by email"
                                 style={{ maxWidth: 240 }}
                              />
                              <Button variant="default">Send Invite</Button>
                           </div>
                        </CardContent>
                     </Card>

                     {/* Card 2: Members Table */}
                     <Card>
                        <CardHeader>
                           <CardTitle>Organization Members</CardTitle>
                           <CardDescription>
                              List of all members in your organization.
                           </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {"members" in org &&
                           Array.isArray((org as any).members) &&
                           (org as any).members.length > 0 ? (
                              <Table>
                                 <TableHeader>
                                    <TableRow>
                                       <TableHead>Name</TableHead>
                                       <TableHead>Email</TableHead>
                                       <TableHead>Role</TableHead>
                                    </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                    {(org as any).members.map((member: any) => (
                                       <TableRow
                                          key={member.id || member.email}
                                       >
                                          <TableCell>
                                             {member.name || "—"}
                                          </TableCell>
                                          <TableCell>
                                             {member.email || "—"}
                                          </TableCell>
                                          <TableCell>
                                             {member.role || "—"}
                                          </TableCell>
                                       </TableRow>
                                    ))}
                                 </TableBody>
                              </Table>
                           ) : (
                              <div className="text-muted-foreground">
                                 No members found.
                              </div>
                           )}
                        </CardContent>
                     </Card>
                  </>
               ) : (
                  <div className="text-muted-foreground">
                     No organization found. Please create one to continue.
                  </div>
               )}
            </CardContent>
         </Card>
         <CreateOrganizationCredenza open={open} onOpenChange={setOpen} />
      </div>
   );
}
