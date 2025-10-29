import { Card } from "../components/card";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "../components/table";

export function Features() {
   return (
      <section>
         <div className="bg-muted/50 py-24">
            <div className="mx-auto w-full max-w-5xl px-6">
               <div>
                  <h2 className="text-foreground text-4xl font-semibold">
                     Effortless Task Management
                  </h2>
                  <p className="text-muted-foreground mb-12 mt-4 text-balance text-lg">
                     Automate your tasks and workflows by connecting your
                     favorite tools like Notion, Todoist, and more. AI-powered
                     scheduling helps you stay on track and adapt to changing
                     priorities.
                  </p>
                  <div className="bg-foreground/5 rounded-3xl p-6">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Revenue</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           <TableRow>
                              <TableCell>1</TableCell>
                              <TableCell>10/31/2023</TableCell>
                              <TableCell>
                                 <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    Paid
                                 </span>
                              </TableCell>
                              <TableCell>Bernard Ng</TableCell>
                              <TableCell>$43.99</TableCell>
                           </TableRow>
                           <TableRow>
                              <TableCell>2</TableCell>
                              <TableCell>10/21/2023</TableCell>
                              <TableCell>
                                 <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                    Ref
                                 </span>
                              </TableCell>
                              <TableCell>Méschac Irung</TableCell>
                              <TableCell>$19.99</TableCell>
                           </TableRow>
                           <TableRow>
                              <TableCell>3</TableCell>
                              <TableCell>10/15/2023</TableCell>
                              <TableCell>
                                 <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    Paid
                                 </span>
                              </TableCell>
                              <TableCell>Glodie Ng</TableCell>
                              <TableCell>$99.99</TableCell>
                           </TableRow>
                           <TableRow>
                              <TableCell>4</TableCell>
                              <TableCell>10/12/2023</TableCell>
                              <TableCell>
                                 <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                    Cancelled
                                 </span>
                              </TableCell>
                              <TableCell>Theo Ng</TableCell>
                              <TableCell>$19.99</TableCell>
                           </TableRow>
                        </TableBody>
                     </Table>
                  </div>
               </div>

               <div className="border-foreground/10 relative mt-16 grid gap-12 border-b pb-12 [--radius:1rem] md:grid-cols-2">
                  <div>
                     <h3 className="text-foreground text-xl font-semibold">
                        Marketing Campaigns
                     </h3>
                     <p className="text-muted-foreground my-4 text-lg">
                        Effortlessly plan and execute your marketing campaigns
                        organized.
                     </p>
                     <Card className="aspect-video overflow-hidden px-6">
                        <Card className="h-full translate-y-6" />
                     </Card>
                  </div>
                  <div>
                     <h3 className="text-foreground text-xl font-semibold">
                        AI Meeting Scheduler
                     </h3>
                     <p className="text-muted-foreground my-4 text-lg">
                        Effortlessly book and manage your meetings. Stay on top
                        of your schedule.
                     </p>
                     <Card className="aspect-video overflow-hidden">
                        <Card className="translate-6 h-full" />
                     </Card>
                  </div>
               </div>

               <blockquote className="before:bg-primary relative mt-12 max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full">
                  <p className="text-foreground text-lg">
                     Wow, auto-generated pages are the kind of thing that you
                     don't even know you need until you see it. It's like an
                     AI-native CRM.
                  </p>
                  <footer className="mt-4 flex items-center gap-2">
                     <cite>Méschac Irung</cite>
                     <span
                        aria-hidden
                        className="bg-foreground/15 size-1 rounded-full"
                     ></span>
                     <span className="text-muted-foreground">Creator</span>
                  </footer>
               </blockquote>
            </div>
         </div>
      </section>
   );
}
