import ws from 'ws';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Users } from '../../database/models/Users';

const cons: { id: string; wsCon: ws; }[] = [];
const messages: {
    id: string;
    author: {
        name: string;
        photo: string;
    };
    text: string
}[] = [];

export const wsHandler = async (ws: ws, req: Request) => {
    const token = req.query.token as string;
    let user: { id: string; name: string; photo: string; };

    // SINGLE RESPONIBILITY
    try {
        const decoded = jwt.verify(token, 'TOP_SECRET') as { userId: string; };
        const userById = await Users.findById(decoded.userId);

        if (!userById) {
            throw 'User not found!'
        }

        user = {
            id: userById._id.toString(),
            name: userById.firstName + ' ' + userById.lastName,
            photo: userById.photo,
        };

        cons.push({
            id: user.id,
            wsCon: ws,
        });

    } catch (err: any) {
        return ws.close(4001, err.message);
    }

    ws.send(JSON.stringify({
        type: 'INIT',
        payload: {
            id: user.id,
            chatHistory: messages
        },
    }));

    ws.on('message', (data: string) => {
        const action = JSON.parse(data);

        switch(action.type) {
            case 'NEW_MESSAGE': {
                const newMessage = {
                    id: randomUUID(),
                    author: {
                        name: user.name,
                        photo: user.photo,
                    },
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
                cons.forEach(({ id, wsCon }) => {
                    if (id == action.payload) {
                        return;
                    }

                    wsCon.send(
                        JSON.stringify({ type: 'TYPING', payload: user.name })
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