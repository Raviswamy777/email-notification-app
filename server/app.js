import express, { urlencoded } from "express";
import axios from "axios";
import sendEmailBrevo from './services/email.js';
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));

const MAX_RETRIES = 3;
let retryCount = 0;
let status = false;

app.use("/", express.static("dist"));

const emailQueue = [];

app.post('/send-email', async (req, res) => {
    try {
        const { to, subject, message, urgency, userActivity } = req.body;
        
        const delay = getDelay(urgency, userActivity);
        
        setTimeout(async () => {
            try {
                emailQueue.push({ to, subject, message });
                
                await processQueue(); // Await to handle errors in processQueue
                if(retryCount == 0){
                   return res.status(200).send("Email sent successfully");
                }else if(status){
                 res.status(200).send(`Email added to retry will send within 3 successful attempts`);
                }
            } catch (error) {
                console.log(error.message);
                return res.status(200).send(`Email added to retry will send within 3 successful attempts`);
            }
        }, delay);
        if(urgency == "high" && userActivity == "inactive"){
            status = true;
            return   res.status(200).send(`Email scheduled to send in 30 minutes`);
           } else if (urgency === 'medium') {
            status = true;
             return  res.status(200).send(`Email scheduled to send in 1 hour`);
           }else if(urgency === 'low'){
            status = true;
             return  res.status(200).send(`Email scheduled to send in 2 hour`);
           }
    } catch (error) {
        res.status(200).send(`Email added to retry will send within 3 successful attempts`);
    }
});

function getDelay(urgency, userActivity) {
    if (urgency === 'high') {
        return userActivity === 'active' ? 0 : 1800000; // 0 or 30 minutes
    } else if (urgency === 'medium') {
        return 3600000; // 1 hour
    } else {
        return 7200000; // 2 hours
    }
}

async function processQueue() {
    if (emailQueue.length === 0) return;
    const { to, subject, message } = emailQueue[0];
    try {
        
        await sendEmailBrevo(to, subject, message);
        console.log('Email sent successfully');
        emailQueue.shift();
        retryCount = 0; // Reset after successful send
    } catch (error) {
        retryCount++;
        status = true
        await handleFailure(to, subject, message);

    }
}

async function handleFailure(to, subject, message) {
    
    if (retryCount <= MAX_RETRIES && retryCount != 0) { // Added condition to check the emailQueue length
        console.log(`Retrying... Attempt ${retryCount}`);
        setTimeout(async () => {
            try {
                await processQueue();
            } catch (error) {
                console.error(`Retry attempt ${retryCount} failed. Error: ${error.message}`);
                }
        }, getRetryDelay(retryCount));
    } else {
        console.error('Max retries reached. Attempting to send via backup service.');
        if(emailQueue.length > 0){
            await handleBackupService(to, subject, message);
        }
    }
}

async function handleBackupService(to, subject, message) {
    try {
        await sendEmailBackup(to, subject, message);
        console.log('Email sent successfully via backup service');
    } catch (error) {
        console.error('Failed to send email via both services. No more retries.');
    } finally {
        emailQueue.shift(); // Remove the email from queue after processing
        retryCount = 0; // Reset after all attempts
    }
}

function getRetryDelay(retryCount) {
    const delay = [500, 500, 500]; // Keep the small delay
    return delay[retryCount - 1] || 900000;
}

async function sendEmailBackup(to, subject, message) {
    console.log('sending email using backup service');
    // Simulate backup email sending
}

app.listen(5578, () => {
    console.log('Server is running on port 5578');
});
