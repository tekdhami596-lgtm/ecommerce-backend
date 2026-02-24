declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        firstName: string;
        lastName: string;
        role: string;
      };
    }
  }
}

export {};
