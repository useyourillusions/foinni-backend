import { Response, Request } from 'express';

export const wrongRouteHandler = (req: Request, res: Response) => {
    res
        .status(404)
        .send(`
            <center>
                <img src="https://www.nicepng.com/png/detail/221-2215035_404doge-doge-404.png" alt="404 - Much sad"> 
            </center>
        `);
};
