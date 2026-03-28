import { db } from "../index";
import {  eq } from "drizzle-orm";
import { subscribers } from "../schema";

export async function getSubscribersByPipeline(pipelineId: string) {
  const result= await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.pipelineId, pipelineId));
    return result;
}