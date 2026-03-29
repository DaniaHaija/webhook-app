import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { 
  updateJobStatus, 
  getJobWithPipeline 
} from './db/queries/job';
import { getSubscribersByPipeline } from './db/queries/subscriber';

const worker = new Worker('process-webhook', async (job: Job) => {
  const { jobId, payload } = job.data;

  if (!jobId) return;

  try {
    console.log(`⏳ Processing Job: ${jobId}`);

    
    await updateJobStatus({ 
      id: jobId, 
      status: 'processing',

    } );

    const jobData = await getJobWithPipeline(jobId);
    if (!jobData || !jobData.pipeline) {
      throw new Error("Pipeline configuration missing");
    }

    
    let processedData = { ...payload };
    const { actionType, id: pipelineId } = jobData.pipeline;

    switch (actionType) {
      case 'TRANSFORM_UPPERCASE':
        processedData = JSON.parse(JSON.stringify(payload).toUpperCase());
        break;
      case 'ADD_TIMESTAMP':
        processedData = { ...payload, processedAt: new Date().toISOString() };
        break;
      case 'FILTER_SENSITIVE':
        delete (processedData as any).password;
        delete (processedData as any).token;
        break;
      default:
        console.log(`ℹ️ No transformation for action: ${actionType}`);
    }

    
    const pipelineSubscribers = await getSubscribersByPipeline(pipelineId);
    
    let deliveryResults: any[] = [];

    
    if (pipelineSubscribers && pipelineSubscribers.length > 0) {
 const deliveryPromises = pipelineSubscribers.map(async (sub) => {
  try {
    const response = await axios.post(sub.targetUrl, processedData, { timeout: 5000 });

    return {
      url: sub.targetUrl,
      status: response.status,
      success: true
    };

  } catch (error: any) {
    return {
      url: sub.targetUrl,
      status: error.response?.status || 500,
      success: false,
      error: error.message
    };
  }
});





      deliveryResults = await Promise.all(deliveryPromises);
    } else {
      console.log(`⚠️ No subscribers found for pipeline: ${pipelineId}`);
    }

  
    await updateJobStatus({ 
      id: jobId, 
      status: 'completed', 
      result: { 
        output: processedData, 
        deliveryLog: deliveryResults ,
        history: {
      receivedAt: job.timestamp, 
      startedAt: new Date(job.processedOn!).toISOString(), 
      completedAt: new Date().toISOString(), 
      totalDurationMs: Date.now() - job.timestamp 
    },
    metadata: {
      attempt: job.attemptsMade + 1,
      workerNode: process.env.HOSTNAME || 'main-worker'
    }
      } 
    } );

    console.log(`✅ Job ${jobId} completed successfully.`);
    return {
      output: processedData, 
      deliveryLog: deliveryResults,
    summary  : `Delivered to ${deliveryResults.filter(r => r.success).length} subscribers`
    };

  } catch (error: any) {
    console.error(`❌ Worker Error [Job ${jobId}]:`, error.message);

    
    await updateJobStatus({ 
      id: jobId, 
      status: 'failed', 
      result: { 
      error: error.message,
      history: {
        receivedAt: job.timestamp,
        failedAt: new Date().toISOString(),
        attemptNumber: job.attemptsMade + 1, 
        errorType: error.name || 'UnknownError'
      },

      failedPayload: payload 
    } });

    throw error; 
  }
}, { 
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  concurrency: 5
});



export default worker;