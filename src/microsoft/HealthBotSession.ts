import { ChatbotSession, ChatbotStatus } from '../ChatbotSession';

const axios = require('axios');
const WebSocket = require('ws');

export default class HealthBotSession extends ChatbotSession {

    public transactionCount: number;
    public inputs: string[];

    private _debug: boolean;
    private _directlineSecret: string;
    private _userId: string;
    private _websocket: any;
    private _socketUrl: string = '';
    private _conversationId: string = '';
    // private _replyToId: string = '';
    private _lastestMessageText: string = '';
    private _lastestMessageData: any;
    // private _pendingResolve: any = undefined;


    constructor(directlineSecret: string, userId?: string, debug: boolean = false) {
        super();
        this._directlineSecret = directlineSecret;
        this._userId = userId || `dl_${Math.random()}`;
        this._debug = debug;
        this.transactionCount = 0;
        this.inputs = [];
        this.status = ChatbotStatus.IDLE;
    }

    get latestMessageText(): string {
        return this._lastestMessageText;
    }

    get latestMessageData(): any {
        return this._lastestMessageData;
    }

    init(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const options = {
                method: 'POST',
                url: 'https://directline.botframework.com/v3/directline/conversations', //'https://directline.botframework.com/v3/directline/tokens/generate',
                headers: {
                    'Authorization': 'Bearer ' + this._directlineSecret
                },
                data: {
                    User: { Id: this._userId }
                }
            };

            axios(options)
                .then((response: any) => {
                    // console.log(response);
                    this._conversationId = response.data.conversationId;
                    this._socketUrl = response.data.streamUrl;
                    this._startWebSocket(this._socketUrl);
                    resolve(response.data);

                })
                .catch((error: any) => {
                    console.log(error);
                    reject({ error: 'HealthBotSession: call to retrieve token from Direct Line failed' })
                });
        });
    }

    getNextResponse(input: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.inputs.push(input);
            this.status = ChatbotStatus.REQUESTING_NEXT_PROMPT;

            // this._pendingResolve = resolve;
            // this._sendActivity(this._conversationId, input);
            // resolve();

            let message = {
                type: "message",
                // replyToId: replyToId,
                from: {
                    id: this._userId
                },
                text: input
            }

            const options = {
                method: 'POST',
                url: `https://directline.botframework.com/v3/directline/conversations/${this._conversationId}/activities`,
                headers: {
                    'Authorization': 'Bearer ' + this._directlineSecret
                },
                data: message
            };

            console.log(`SEND_ACTIVITY: --> id: ${this._conversationId}, input: ${input}`);

            axios(options)
                .then((response: any) => {
                    // console.log(response);
                    console.log(`SEND_ACTIVITY: <-- id: ${this._conversationId}, input: ${input}: body:`);
                    console.log(response.data);
                    resolve(response.data);
                })
                .catch((error: any) => {
                    console.log('Call to send activity to Direct Line failed:', error);
                    reject({ error, statusCode: 0 });
                });
        });
    }

    private _startWebSocket = (socketUrl: string) => {
        this._websocket = new WebSocket(socketUrl);

        if (this._websocket) {
            this._websocket.on('error', (error: any) => {
                // console.log(`error:`, error);
                this.emit('error', error);
            });

            this._websocket.on('open', () => {
                // console.log(`websocket on open`);
                this.emit('open');
            });

            this._websocket.on('message', (message: string, flags: any) => {
                // console.log('HealthBotSession: received message: ', message);
                this._lastestMessageText = message;
                this._lastestMessageData = undefined;
                let messageData;
                try {
                    messageData = JSON.parse(message);
                } catch (error) {
                    console.log(`websocket onMessage: not JSON: `, message);
                    messageData = undefined;
                }
                if (messageData) {
                    // console.log('websocket onMessage: JSON: ', messageData);
                    this._handleSocketMessageData(messageData);
                }
            });

            this._websocket.on('close', () => {
                // console.log('websocket client closed');
                this.emit('close');
                this._websocket = undefined;
            });
        } else {
            console.log(`HealthBotSession: error starting websocket`)
        }

    }

    // private _sendActivity = (conversationId: string, text: string) => {
    //     let message = {
    //         type: "message",
    //         // replyToId: replyToId,
    //         from: {
    //             id: this._userId
    //         },
    //         text: text
    //     }

    //     const options = {
    //         method: 'POST',
    //         uri: `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`,
    //         headers: {
    //             'Authorization': 'Bearer ' + this._directlineSecret
    //         },
    //         json: message
    //     };

    //     console.log(`_sendActivity: --> id: ${conversationId}, input: ${text}`);
    //     request.post(options, (error: any, response: any, body: any) => {
    //         if (!error && response.statusCode < 300) {
    //             console.log(`_sendActivity: <-- id: ${conversationId}, input: ${text}: body:`);
    //             console.log(body);
    //         }
    //         else {
    //             console.log('Call to send activity to Direct Line failed');
    //         }
    //     });
    // }

    private _handleSocketMessageData(messageData: any) {
        // console.log(`_handleSocketMessageData`, messageData);
        this._lastestMessageData = messageData;
        let replyToId = '';
        let replyToIdParts = [];
        let messageType: string = '';
        if (messageData.activities && messageData.activities[0]) {
            replyToId = messageData.activities[0].replyToId;
            replyToIdParts = replyToId ? replyToId.split('|') : [];
            messageType = messageData.activities[0].type;
        }
        if (messageType === 'message' && replyToIdParts.length == 2) { // ignore echoed messages with no replyToId
            // this._pendingResolve(messageData);
            // this._pendingResolve = undefined;
            if (this._debug) {
                console.log(`SENDING message type: ${messageType}:`);
                console.log(messageData);
            }
            this.emit('message', messageData);
        } else if (this._debug) {
            console.log(`IGNORING message type: ${messageType}:`);
            console.log(`replyToId: ${replyToId}`);
            // console.log(`pendingResolve:`, this._pendingResolve);
            console.log(messageData);
        }
    }

    /*
    messageData: {
        "activities": [
            {
                "type": "message",
                "id": "BHz9MwrbXPW5BXV9ZBU4rl-j|0000000",
                "timestamp": "2020-06-29T13:56:36.797082Z",
                "localTimestamp": "2020-06-29T13:56:36.763+00:00",
                "channelId": "directline",
                "from": {
                    "id": "ntd-rapo-jibo-hcbot1-3yqmqrj",
                    "name": "ntd-rapo-jibo-hcbot1"
                },
                "conversation": {
                    "id": "BHz9MwrbXPW5BXV9ZBU4rl-j"
                },
                "text": "Hello. What is your name?",
                "speak": "Hello. What is your name?",
                "inputHint": "expectingInput",
                "suggestedActions": {
                    "actions": [
                        {
                            "type": "imBack",
                            "title": "Joe",
                            "value": "Joe"
                        },
                        {
                            "type": "imBack",
                            "title": "Jane",
                            "value": "Jane"
                        },
                        {
                            "type": "imBack",
                            "title": "Jibo",
                            "value": "Jibo"
                        }
                    ]
                },
                "replyToId": "IAe50FYEQf2"
            }
        ],
        "watermark": "0"
    }
    */

    dispose() {
        this.removeAllListeners();
        this.inputs = [];
        // this._pendingResolve = undefined;
        this._lastestMessageData = undefined;
        if (this._websocket) {
            this._websocket.close();
            this._websocket = undefined;
        }
    }
}
