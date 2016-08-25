interface Emitter {
    clear( type?: string ): this;
    emit( type: string, ...args: any[] ): boolean;
    first( type: string, ...args: any[] ): boolean;
    off( type: string, listener: Function ): this;
    on( type: string, listener: Function ): this;
    once( type: string, listener: Function ): this;
    listeners( type: string ): Function[];
    listenerCount( type: string ): number;
    tick( type: string, ...args: any[] ): boolean;
    trigger( type: string, ...args: any[] ): boolean;
    until( type: string, listener: Function ): this;
}

class Emitter implements Emitter {
    static every: string;
    static defaultMaxListeners: number;
    static version: string;
    
    clear( type?: string ): this;
    destroy(): void;
    emit( type: string, ...args: any[] ): boolean;
    eventTypes(): string[];
    first( type: string, ...args: any[] ): boolean;
    off( type: string, listener: Function ): this;
    on( type: string, listener: Function ): this;
    once( type: string, listener: Function ): this;
    listeners( type: string ): Function[];
    listenerCount( type: string ): number;
    tick( type: string, ...args: any[] ): boolean;
    toJSON(): object;
    toString(): string;
    trigger( type: string, ...args: any[] ): boolean;
    until( type: string, listener: Function ): this;
}