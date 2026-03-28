const crypto = require('crypto');
const { exec } = require('child_process');

const API_KEY = 'dania_super_secret_key_2024';
const BASE_URL = 'http://localhost:3000';

// 1. جلب بيانات الـ Pipeline تلقائياً
exec(`curl -s -H "x-api-key: ${API_KEY}" ${BASE_URL}/pipelines`, (err, stdout) => {
    const pipelines = JSON.parse(stdout);
    
    if (!pipelines || pipelines.length === 0) {
        console.error("No pipelines found! Please create one first.");
        return;
    }

    const target = pipelines[0]; // نأخذ أول واحد
    const secret = target.signingSecret;
    const webhookPath = target.sourceUrl;
    const payload = JSON.stringify({ message: "HELLO FROM DANIA AUTO-TEST" });

    // 2. حساب التوقيع
    const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    console.log('--- Sending Webhook to:', webhookPath, '---');

    // 3. إرسال الطلب
    const sendCmd = `curl -s -X POST ${BASE_URL}${webhookPath} \
        -H "Content-Type: application/json" \
        -H "x-webhook-signature: ${signature}" \
        -d '${payload}'`;

    exec(sendCmd, (err, sendStdout) => {
        console.log('Server Response:', sendStdout);
        console.log('--- Check BullBoard now! ---');
    });
});
