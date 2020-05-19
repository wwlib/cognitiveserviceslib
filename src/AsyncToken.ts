import { EventEmitter } from 'events';

export default class AsyncToken<T> extends EventEmitter {

    public complete: Promise<T> | undefined;
    public resolve: any;
    public reject: any;

    constructor() {
        super();
    }

    dispose(): void {
        this.complete = undefined;
        this.resolve = undefined;
        this.reject = undefined;
        this.removeAllListeners();
    }
}
