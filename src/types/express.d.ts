import express from "express";

declare global {
    namespace Express {
        interface Request {
            userID?: number;
            email_address?: string;
        }
    }
}

export { }