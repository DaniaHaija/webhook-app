import { Request, Response, NextFunction } from 'express';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  const VALID_KEY = process.env.ADMIN_API_KEY ;

  if (!apiKey || apiKey !== VALID_KEY) {
    return res.status(403).json({ error: "Unauthorized: Invalid API Key" });
  }
  next();
};