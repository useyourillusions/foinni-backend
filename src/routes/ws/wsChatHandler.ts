import ws from 'ws';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { Users } from '../../database/models/Users';

interface Message {
    id: string;
    author: {
        name: string;
        photo: string;
    };
    text: string
};
interface UserData {
    id: string;
    name: string;
    photo: string;
    err?: any;
};

const cons: { id: string; wsCon: ws; }[] = [];
const messages: Message[] = [];
const fetchUserData = async (token: string): Promise<UserData | string> => {
    try {
        const decoded = jwt.verify(token, 'TOP_SECRET') as { userId: string; };
        const user = await Users.findById(decoded.userId);

        if (!user) {
            throw 'User not found!'
        }

        return {
            id: user._id.toString(),
            name: user.firstName + ' ' + user.lastName,
            photo: user.photo,
        };

    } catch (err: any) {
        return err?.message || 'Unknown error occurred!'
    }
}

export const wsChatHandler = async (ws: ws, req: Request) => {
    const wsSend = (socket: ws, type: string, payload?: unknown) =>
        socket.send(JSON.stringify({type, payload}));
    const userData = await fetchUserData(req.query.token as string);

    if (typeof userData === 'string') {
        return ws.close(4001, userData);
    }

    cons.push({
        id: userData.id,
        wsCon: ws,
    });

    wsSend(ws, 'INIT', {
        id: userData.id,
        chatHistory: messages
    });
    
    ws.on('message', (data: string) => {
        const action = JSON.parse(data);

        switch(action.type) {
            case 'NEW_MESSAGE': {
                const newMessage = {
                    id: randomUUID(),
                    author: {
                        name: userData.name,
                        photo: userData.photo,
                    },
                    text: action.payload,
                };

                messages.push(newMessage);
                cons.forEach(({ wsCon }) => wsSend(wsCon, 'NEW_MESSAGE', newMessage));
                break;
            }

            case 'TYPING': {
                cons.forEach(({ id, wsCon }) => {
                    if (id !== action.payload) {
                        wsSend(wsCon, 'TYPING', userData.name);
                    }
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