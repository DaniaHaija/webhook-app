import { db } from "../index";
import {  eq } from "drizzle-orm";
import { jobs, Jobs } from "../schema";

export async function createjob(Job:Jobs) {
    const[result]=await db.insert(jobs).values(Job).returning();
    return result;
    
}
export async function updateJobStatus (data:{id:string} & Partial<typeof jobs.$inferInsert>){

   const[result]= await db
    .update(jobs)
    .set(data)
    .where(eq(jobs.id, data.id))
    .returning();
    return result;
};

export async function getJobWithPipeline(jobId: string) {
  return await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
    with: {
      pipeline: true,
    },
  });
}
