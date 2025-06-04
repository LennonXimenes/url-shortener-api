import { Request } from "express";

export interface iRequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
  };
}
