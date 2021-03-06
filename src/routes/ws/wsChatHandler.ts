import ws from 'ws';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { Users, Message } from '../../database/models';

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
};

const cons: { id: string; wsCon: ws; }[] = [];
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

    try {
        const chatHistory = await Message.find({}, { __v: 0 });

        wsSend(ws, 'INIT', {
            id: userData.id,
            chatHistory: chatHistory.map((message) => ({
                id: message._id,
                text: message.text,
                author: { 
                    name: message.author.name,
                    photo: message.author.photo,
                },
            })),
        });
    } catch(err) {
        console.log(err);
    }
    
    ws.on('message', async (data: string) => {
        // TODO: Add text validation
        const action = JSON.parse(data);

        switch(action.type) {
            case 'NEW_MESSAGE': {
                const message = new Message({
                    author: userData,
                    text: action.payload,
                    date_added: new Date(),
                });

                try {
                    const savedMessage = await message.save();
    
                    cons.forEach(({ wsCon }) => wsSend(wsCon, 'NEW_MESSAGE', {
                        id: savedMessage._id,
                        text: savedMessage.text,
                        author: {
                            name: savedMessage.author.name,
                            photo: savedMessage.author.photo,
                        },
                    }));

                } catch (err) {
                    console.error(err)
                }
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

            case 'REMOVE_ALL': {
                let removeStatus = true;

                try {
                    await Message.deleteMany({});   
                } catch (err) {
                    removeStatus = false;
                    console.error(err);
                }

                cons.forEach(({ wsCon }) => wsSend(wsCon, 'REMOVE_ALL', removeStatus));
                break;
            }
        }
    });

    ws.on('close', () => {
        const indexToDel = cons.findIndex(({ wsCon }) => wsCon === ws);
        cons.splice(indexToDel, 1)
    });
};