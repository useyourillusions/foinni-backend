import ws from 'ws';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Users } from '../../database/models/Users';

const cons: { id: string; wsCon: ws; }[] = [];
const messages: { id: string; author: string; text: string }[] = [];

export const wsHandler = async (ws: ws, req: Request) => {
    const token = req.query.token as string;
    let user: { id: string; firstName: string; lastName: string; };

    try {
        const decoded = jwt.verify(token, 'TOP_SECRET') as { userId: string; };
        const userById = await Users.findOne({ _id: decoded.userId });

        if (!userById) {
            throw 'User not found!'
        }

        cons.push({
            id: userById._id.toString(),
            wsCon: ws,
        });

        user = {
            id: userById._id.toString(),
            firstName: userById.firstName,
            lastName: userById.lastName,
        };

    } catch (err: any) {
        return ws.close(4001, err.message);
    }

    ws.send(JSON.stringify({ type: 'CHAT_HISTORY', payload: messages }));

    ws.on('message', (data: string) => {
        const action = JSON.parse(data);

        switch(action.type) {
            case 'NEW_MESSAGE': {
                const newMessage = {
                    id: randomUUID(),
                    author: user.firstName + ' ' + user.lastName,
                    text: action.payload,
                };

                messages.push(newMessage);
                cons.forEach(({ wsCon }) => {
                    wsCon.send(
                        JSON.stringify({ type: 'NEW_MESSAGE', payload: newMessage })
                    );
                });
                break;
            }

            case 'TYPING': {
                cons.forEach(({ wsCon }) => {
                    wsCon.send(
                        JSON.stringify({ type: 'TYPING' })
                    );  
                });
                break;
            }
        }
    });

    ws.on('close', () => {
        const indexToDel = cons.findIndex(({ wsCon }) => wsCon === ws);
        cons.splice(indexToDel, 1)
    });
};