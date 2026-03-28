import { createjob,getJobWithPipeline } from './db/queries/job';
import express from 'express';
import { db } from './db';
import { jobs } from './db/schema';
import { webhookQueue } from './queue';
import crypto from 'crypto';
import { createPipelineWithSubscribers,deletePipline,updatePipeline,getAllPipelines,getPipelineById } from './db/queries/pipeline'; 

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import {apiKeyAuth} from './middleware/auth'
import './worker'; 
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(webhookQueue)],
  serverAdapter: serverAdapter,
});


const app = express();
app.use(express.json());
app.use('/webhooks', limiter);

app.use('/admin/queues', serverAdapter.getRouter());


app.post('/webhooks/:pipelineId', async (req, res) => {
const PipelineId = req.params.pipelineId as string;


  if (!PipelineId) {
    return res.status(400).json({ error: "Pipeline ID is required" });
  }
  try {
   
    const newJob = await createjob({
     pipelineId: PipelineId,
      payload: req.body,
      status: 'pending'
    });
    if (!newJob) {
  return res.status(500).json({ error: "Failed to create job" });
}  

    await webhookQueue.add('process-webhook', {
      jobId: newJob.id,
      payload: req.body, },
      {
  attempts: 3, 
  backoff: {
    type: 'exponential',
    delay: 1000, 
  }});

    res.status(202).json({ jobId: newJob.id });
  } catch (error) {
    res.status(500).send("Error saving job");
  }
});


app.post('/pipelines', apiKeyAuth,async (req, res) => {
  const { name, actionType, subscriberUrls } = req.body;

  if (!name || !actionType || !Array.isArray(subscriberUrls)) {
    return res.status(400).json({ 
      error: "Missing required fields. 'subscriberUrls' must be an array." 
    });
  }


  try {
    const pipelineData = {
      name,
      actionType,
      sourceUrl: `/webhooks/${crypto.randomUUID()}`,
     
    };

    const newPipeline = await createPipelineWithSubscribers(pipelineData, subscriberUrls);

    res.status(201).json({
      message: "Pipeline created successfully",
      data: newPipeline,
     

    });

  } catch (error: any) {
    console.error(" Error creating pipeline:", error.message);
    
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
});

app.get('/jobs/:id', async (req, res) => {
  const  id  = req.params.id as string;

  if (!id) {
    return res.status(400).json({ error: "jobid is required" });
  }
  try {
 
    const job = await getJobWithPipeline(id);
    
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (e) {
    res.status(500).json({ error: "Internal error" });
  }
});
app.delete('/pipelines/:id',apiKeyAuth, async (req, res) => {
  const id  = req.params.id as string;

  try {

    const deleted = await deletePipline(id);

   if (!deleted) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    res.json({ message: "Pipeline deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put('/pipelines/:id', apiKeyAuth,async (req, res) => {
  const  id  = req.params.id as string;
  const { name, actionType, subscriberUrls } = req.body;

  try {
    const updated = await updatePipeline(id, { name, actionType }, subscriberUrls);
   
    res.json({ message: "Pipeline updated successfully", data: updated });
  } catch (error: any) {
    if (error.message === "Pipeline not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get('/pipelines', async (req, res) => {
  try {
    const allPipelines = await getAllPipelines();
    res.json(allPipelines);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pipelines" });
  }
});

app.get('/pipelines/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pipeline = await getPipelineById(id);
    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});