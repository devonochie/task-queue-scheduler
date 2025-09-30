import { Job as BullJob } from 'bullmq';
import { sendEmail } from '../services/emailService';


export const jobProcessors = {
    async processEmail(job:BullJob) {
        const { to, subject, body } =  job.data

        console.log(`Sending email to: ${to}`);
        await new Promise(resolve => setTimeout(resolve, 2000))

         // use nodemailer later for real time dev
        await sendEmail.Email({
            to,
            subject,
            body
        })

        return { success: true, messageId: `email-${Date.now()}` };
    },

    async processReport(job: BullJob) {
        const { reportType, parameters } = job.data

        // Simulate report generation
        // downloading the report logic
        console.log(`Generating report: ${reportType}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        return { success: true, reportUrl: `/reports/${reportType}-${Date.now()}.pdf` }
    },

    async processDataSync(job: BullJob) {
        const { source, target, data } = job.data;
        
        // Simulate data synchronization
        console.log(`Syncing data from ${source} to ${target}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return { success: true, recordsProcessed: data.length };
    }
}