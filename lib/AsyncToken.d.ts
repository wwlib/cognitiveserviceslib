/// <reference types="node" />
import { EventEmitter } from 'events';
export default class AsyncToken<T> extends EventEmitter {
    complete: Promise<T> | undefined;
    resolve: any;
    reject: any;
    constructor();
    dispose(): void;
}
