interface Emitter {
    new(): emitter;
}

interface emitter {
    clear(type?: string): this;
    emit(type: string, ...args: any[]): boolean;
    off(type: string, listener: Function): this;
    on(type: string, listener: Function): this;
    once(type: string, listener: Function): this;
    listeners(type: string): Function[];
    listenerCount(type: string): number;
    tick(type: string, ...args: any[]): boolean;
    trigger(type: string, ...args: any[]): boolean;
    until(type: string, listener: Function): this;
}