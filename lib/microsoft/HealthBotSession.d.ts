import { ChatbotSession } from '../ChatbotSession';
export default class HealthBotSession extends ChatbotSession {
    transactionCount: number;
    inputs: string[];
    private _debug;
    private _directlineSecret;
    private _userId;
    private _websocket;
    private _socketUrl;
    private _conversationId;
    private _lastestMessageText;
    private _lastestMessageData;
    constructor(directlineSecret: string, userId?: string, debug?: boolean);
    get latestMessageText(): string;
    get latestMessageData(): any;
    init(): Promise<any>;
    getNextResponse(input: string): Promise<any>;
    private _startWebSocket;
    private _handleSocketMessageData;
    dispose(): void;
}
