declare module Express {
    interface Request {
        userId?: string | null;
        isAccessJwtExpired?: boolean;
        user?: {
            firstName: string;
            lastName: string;
            photo: string;
            email: string;
        }
    }
}