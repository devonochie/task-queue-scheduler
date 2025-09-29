import { JobDocument } from "@/models/Job";
import { WorkerDocument } from "@/models/Worker";


declare global {
    namespace Express {
        interface Request {
            worker?: WorkerDocument
            job?: JobDocument
        }
        
        interface Response {
            success(data?: unknown, message?: string): void;
            error(error: string | Error, statusCode?: number): void;
        }
    }
}