import { db } from '../index';
import {pipelines ,subscribers } from '../schema';
import{eq} from "drizzle-orm";


export async function createPipelineWithSubscribers(
  pipelineData: typeof pipelines.$inferInsert, 
  targetUrls: string[] 
) {
  return await db.transaction(async (tx) => {
    
    const [newPipeline] = await tx
      .insert(pipelines)
      .values(pipelineData)
      .returning();
      if (!newPipeline) {
  throw new Error("Failed to create pipeline");
}

    if (targetUrls.length > 0) {
      const subRecords = targetUrls.map((url) => ({
        pipelineId: newPipeline.id,
        targetUrl: url,
      }));
      await tx.insert(subscribers).values(subRecords);
    }

    return newPipeline;
  });
}
export async function deletePipline(id:string) {
const [result]=  await db.delete(pipelines).where(eq(pipelines.id, id)).returning();
return result
  
}

export async function updatePipeline(
  id: string,
  updateData: Partial<typeof pipelines.$inferInsert>,
  targetUrls?: string[] 
) {
  return await db.transaction(async (tx) => {
    const [updatedPipeline] = await tx
      .update(pipelines)
      .set(updateData)
      .where(eq(pipelines.id, id))
      .returning();

    if (!updatedPipeline) {
      throw new Error("Pipeline not found");
    }

    if (targetUrls) {

      await tx.delete(subscribers).where(eq(subscribers.pipelineId, id));

      if (targetUrls.length > 0) {
        const subRecords = targetUrls.map((url) => ({
          pipelineId: id,
          targetUrl: url,
        }));
        await tx.insert(subscribers).values(subRecords);
      }
    }

    return updatedPipeline;
  });
}


 export async function getAllPipelines() {
  return await db.query.pipelines.findMany({
    with: {
      subscribers: true, 
    },
  });
}

export async function getPipelineById(id: string) {
  return await db.query.pipelines.findFirst({
    where: eq(pipelines.id, id),
    with: {
      subscribers: true, 
    },
  });
}