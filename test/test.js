'use strict';

var chai        = require( 'chai' ),
    sinon       = require( 'sinon' ),
    sinon_chai  = require( 'sinon-chai' ),
    Emitter     = require( '../src' ),

    expect      = chai.expect;

chai.use( sinon_chai );

describe( 'Emitter', function(){

    it( 'should be a function', function(){
        expect( Emitter ).to.be.a( 'function' );
    } );

    it( 'should have static functions and properties', function(){
        expect( Emitter.asEmitter ).to.be.a( 'function' );
        expect( Emitter.listenerCount ).to.be.a( 'function' );
        expect( Emitter.defaultMaxListeners ).to.be.a( 'number' );
    } );

    it( 'should create instances', function(){
        var emitter = new Emitter();
        expect( typeof emitter ).to.equal( 'object' );
        expect( emitter ).to.be.an.instanceof( Emitter );
    } );
    
    it( 'should mixin functionality', function(){
        var emitter = Object.create( null );
        
        Emitter.asEmitter.call( emitter );
        
        expect( emitter.clear ).to.be.a( 'function' );
        expect( emitter.defineEvents ).to.be.a( 'function' );
        expect( emitter.defineMaxListeners ).to.be.a( 'function' );
        expect( emitter.emit ).to.be.a( 'function' );
        expect( emitter.listeners ).to.be.a( 'function' );
        expect( emitter.many ).to.be.a( 'function' );
        expect( emitter.off ).to.be.a( 'function' );
        expect( emitter.on ).to.be.a( 'function' );
        expect( emitter.once ).to.be.a( 'function' );
        expect( emitter.trigger ).to.be.a( 'function' );
    
        emitter.defineEvents();
        emitter.defineMaxListeners( 10 );
        
        expect( emitter.destroyEvents ).to.be.a( 'function' );
        expect( emitter.destroyMaxListeners ).to.be.a( 'function' );
        expect( emitter.maxListeners ).to.be.a( 'number' );
        
        emitter.destroyEvents();
        emitter.destroyMaxListeners();
        emitter = undefined;
    } );

    describe( 'Emitter', function(){
        var emitter;

        beforeEach( function(){
            emitter = new Emitter();
        } );
        
        afterEach( function(){
            emitter.destroy();
            emitter = undefined;
        } );

        it( 'should have functions and properties', function(){
            expect( emitter.clear ).to.be.a( 'function' );
            expect( emitter.defineEvents ).to.be.a( 'function' );
            expect( emitter.defineMaxListeners ).to.be.a( 'function' );
            expect( emitter.destroy ).to.be.a( 'function' );
            expect( emitter.destroyEvents ).to.be.a( 'function' );
            expect( emitter.destroyMaxListeners ).to.be.a( 'function' );
            expect( emitter.emit ).to.be.a( 'function' );
            expect( emitter.listeners ).to.be.a( 'function' );
            expect( emitter.many ).to.be.a( 'function' );
            expect( emitter.off ).to.be.a( 'function' );
            expect( emitter.on ).to.be.a( 'function' );
            expect( emitter.once ).to.be.a( 'function' );
            expect( emitter.maxListeners ).to.be.a( 'number' );
            expect( emitter.trigger ).to.be.a( 'function' );
        } );

        it( 'should provide event subscription', function(){
            var events = [],
                listeners = [],

                onFoo = sinon.spy(),
                onFooToo = sinon.spy(),
                onBar = sinon.spy();

            emitter.on( ':on', function( event, listener ){
                events.push( event );
                listeners.push( listener );
            } );

            emitter.on( 'foo', onFoo );
            
            emitter.on( {
                'foo': onFooToo,
                'bar': onBar
            } );

            emitter.emit( 'foo' );
            emitter.emit( 'bar' );

            expect( onFoo ).to.have.been.calledOnce;
            expect( onFooToo ).to.have.been.calledOnce;
            expect( onBar ).to.have.been.calledOnce;

            expect( events ).to.deep.equal( [ 'foo', 'foo', 'bar' ] );
            expect( listeners ).to.deep.equal( [ onFoo, onFooToo, onBar ] );

            expect( emitter.listeners( 'foo' )[ 0 ] ).to.equal( onFoo );
            expect( emitter.listeners( 'foo' )[ 1 ] ).to.equal( onFooToo );

            expect( function(){ emitter.on( 'foo' ); } ).to.throw( TypeError );
        } );
        
        it( 'should provide event subscription at construction time', function(){
            var events = [],
                listeners = [],

                onFoo = sinon.spy(),
                onFooToo = sinon.spy(),
                onBar = sinon.spy();
            
            emitter = new Emitter( {
                ':on': function( event, listener ){
                    events.push( event );
                    listeners.push( listener );
                },
                'foo': [ onFoo, onFooToo ],
                'bar': onBar
            } );

            emitter.emit( 'foo' );
            emitter.emit( 'bar' );

            expect( onFoo ).to.have.been.calledOnce;
            expect( onFooToo ).to.have.been.calledOnce;
            expect( onBar ).to.have.been.calledOnce;

            expect( events ).to.deep.equal( [ 'foo', 'foo', 'bar' ] );
            expect( listeners ).to.deep.equal( [ onFoo, onFooToo, onBar ] );

            expect( emitter.listeners( 'foo' )[ 0 ] ).to.equal( onFoo );
            expect( emitter.listeners( 'foo' )[ 1 ] ).to.equal( onFooToo );

            expect( function(){ emitter.on( 'foo' ); } ).to.throw( TypeError );
        } );

        it( 'should support namespaced event types', function(){
             var onFoo = sinon.spy(),
                onBar = sinon.spy(),
                onQux = sinon.spy();

            emitter.on( 'foo', onFoo );
            emitter.on( 'foo:bar', onBar );
            emitter.on( 'foo:bar:qux', onQux );
            
            emitter.emit( 'foo:bar:qux', 1, 2, 3 );
            
            expect( onFoo ).to.have.been.calledWith( 1, 2, 3 );
            expect( onBar ).to.have.been.calledWith( 1, 2, 3 );
            expect( onQux ).to.have.been.calledWith( 1, 2, 3 );
            
            emitter.trigger( 'foo:bar:qux', [ 4, 5, 6 ] );
            
            expect( onFoo ).to.have.been.calledWith( 4, 5, 6 );
            expect( onBar ).to.have.been.calledWith( 4, 5, 6 );
            expect( onQux ).to.have.been.calledWith( 4, 5, 6 );
            
            expect( onFoo ).to.have.been.calledTwice;
            expect( onBar ).to.have.been.calledTwice;
            expect( onQux ).to.have.been.calledTwice;
        } );

        it( 'should emit events differently based on the number of arguments', function(){
            var test = Symbol( '@@test' ),
                onEmit = sinon.spy();

            emitter.on( 'test', onEmit );
            emitter.on( test, onEmit );

            emitter.emit( 'test' );
            emitter.emit( 'test', 0 );
            emitter.emit( 'test', 1, 2 );
            emitter.emit( 'test', 3, 4, 5 );
            emitter.trigger( 'test', [  6, 7, 8, 9 ] );
            emitter.emit( test );

            expect( onEmit ).to.have.been.calledWith();
            expect( onEmit ).to.have.been.calledWith( 0 );
            expect( onEmit ).to.have.been.calledWith( 1, 2 );
            expect( onEmit ).to.have.been.calledWith( 3, 4, 5 );
            expect( onEmit ).to.have.been.calledWith( 6, 7, 8, 9 );
            expect( onEmit ).to.have.callCount( 6 );

            expect( function(){ emitter.emit( 'error' ); } ).to.throw( Error );
            expect( function(){ emitter.emit( 'error', new Error( 'test error' ) ); } ).to.throw( Error );
        } );

        it( 'should provide a way to unsubscribe', function(){
            var onAll       = sinon.spy(),
                onEmit      = sinon.spy(),
                onEmitToo   = sinon.spy(),
                onOff       = sinon.spy();

            emitter.on( ':off', onOff );
            
            emitter.on( 'test', onEmit );
            emitter.on( 'test', onEmitToo );
            
            emitter.on( onAll );

            emitter.emit( 'test', 1, 2, 3 );
            emitter.off( 'test', onEmit );
            emitter.emit( 'test', 4, 5, 6 );
            emitter.off( 'test', onEmitToo );
            
            emitter.off( onAll );
            
            emitter.off( 'undefined', onEmit );

            expect( onEmit ).to.have.been.calledWith( 1, 2, 3 );
            expect( onEmit ).to.have.been.calledOnce;
            
            expect( onEmitToo ).to.have.been.calledWith( 1, 2, 3 );
            expect( onEmitToo ).to.have.been.calledWith( 4, 5, 6 );
            expect( onEmitToo ).to.have.been.calledTwice;
            
            expect( function(){ emitter.off( 'test' ); } ).to.throw( TypeError );
            
            expect( onOff ).to.have.been.calledWith( 'test', onEmit );
            expect( onOff ).to.have.been.calledWith( 'test', onEmitToo );
            expect( onOff ).to.have.been.calledThrice;
        } );

        it( 'should provide one-time event subscription', function(){
            var onEmit = sinon.spy();

            emitter.once( 'test', onEmit );

            emitter.emit( 'test', 1, 2, 3 );
            emitter.emit( 'test', 4, 5, 6 );

            expect( onEmit ).to.have.been.calledWith( 1, 2, 3 );
            expect( onEmit ).to.have.been.calledOnce;

            expect( function(){ emitter.once( 'test' ); } ).to.throw( TypeError );
        } );

        it( 'should provide for many-time event subscription', function(){
            var onEmit = sinon.spy();

            emitter.many( 'test', 2, onEmit );

            emitter.emit( 'test', 1, 2, 3 );
            emitter.emit( 'test', 4, 5, 6 );
            emitter.emit( 'test', 7, 8, 9 );

            expect( onEmit ).to.have.been.calledWith( 1, 2, 3 );
            expect( onEmit ).to.have.been.calledWith( 4, 5, 6 );
            expect( onEmit ).to.have.been.calledTwice;

            expect( function(){ emitter.many( 'test', 2 ); } ).to.throw( TypeError );
            expect( function(){ emitter.many( 'test' ); } ).to.throw( TypeError );
        } );
        
        it( 'should provide for conditional event subscription', function(){
            var onEmit = sinon.spy();

            emitter.until( 'test', function( first, second, third ){
                onEmit( first, second, third );
                return third === 6;
            } );

            emitter.emit( 'test', 1, 2, 3 );
            emitter.emit( 'test', 4, 5, 6 );
            emitter.emit( 'test', 7, 8, 9 );

            expect( onEmit ).to.have.been.calledWith( 1, 2, 3 );
            expect( onEmit ).to.have.been.calledWith( 4, 5, 6 );
            expect( onEmit ).to.have.been.calledTwice;

            expect( function(){ emitter.until( 'test' ); } ).to.throw( TypeError );
        } );
        
        it( 'should provide a way to listen to every event', function(){
            var onEmit = sinon.spy();
            
            emitter.on( onEmit );                      // +2
            emitter.on( Emitter.every, onEmit );       // +2
            emitter.on( undefined, onEmit );           // +2
            emitter.once( onEmit );                    // +1
            emitter.once( Emitter.every, onEmit );     // +1
            emitter.once( undefined, onEmit );         // +1
            emitter.many( 2, onEmit );                 // +2
            emitter.many( Emitter.every, 2, onEmit );  // +2
            emitter.many( undefined, 2, onEmit );      // +2
            
            emitter.emit( 'foo' );
            emitter.emit( 'bar' );
            
            emitter.clear( Emitter.every );
            
            emitter.emit( 'qux' );
            
            expect( onEmit ).to.have.callCount( 15 );   // = 15
        } );

        it( 'should emit events when listeners are added and removed', function(){
            var noop = function(){},

                onNewListener = sinon.spy(),
                onRemoveListener = sinon.spy();

            emitter.on( ':on', onNewListener );
            emitter.on( ':off', onRemoveListener );

            emitter.once( 'test', noop );

            emitter.emit( 'test' );

            expect( onNewListener ).to.have.been.calledWith( 'test' );
            expect( onNewListener ).to.have.been.calledWith( ':off' );
            expect( onNewListener ).to.have.been.calledTwice;

            expect( onRemoveListener ).to.have.been.calledWith( 'test' );
            expect( onRemoveListener ).to.have.been.calledOnce;
        } );

        it( 'should provide a listener count', function(){
            var noop = function(){};

            emitter.on( 'test', noop );
            emitter.on( 'test', noop );

            emitter.emit( 'empty' );

            expect( Emitter.listenerCount( emitter, 'test' ) ).to.equal( 2 );
            expect( Emitter.listenerCount( emitter, 'empty' ) ).to.equal( 0 );
            expect( Emitter.listenerCount( emitter, 'undefined' ) ).to.equal( 0 );
            expect( emitter.listenerCount( 'test' ) ).to.equal( 2 );
            expect( emitter.listenerCount( 'empty' ) ).to.equal( 0 );
            expect( emitter.listenerCount( 'undefined' ) ).to.equal( 0 );
        } );

        it( 'should limit the number of subscriptions', function(){
            var noop = function(){},

                onMaxListeners = sinon.spy();

            emitter.on( ':maxListeners', onMaxListeners );

            // The default max listeners is 10
            emitter.on( 'test', noop ); // 1
            emitter.on( 'test', noop ); // 2
            emitter.on( 'test', noop ); // 3
            emitter.on( 'test', noop ); // 4
            emitter.on( 'test', noop ); // 5
            emitter.on( 'test', noop ); // 6
            emitter.on( 'test', noop ); // 7
            emitter.on( 'test', noop ); // 8
            emitter.on( 'test', noop ); // 9
            emitter.on( 'test', noop ); // 10
            emitter.on( 'test', noop ); // 11

            expect( onMaxListeners ).to.have.been.calledWith( 'test' );
            expect( onMaxListeners ).to.have.been.calledOnce;
        } );

        it( 'should set the maximum number of subscriptions', function(){
            var noop = function(){},

                onMaxListeners = sinon.spy();

            emitter.maxListeners = 2;

            emitter.on( ':maxListeners', onMaxListeners );

            emitter.on( 'test', noop ); // 1
            emitter.on( 'test', noop ); // 2
            emitter.on( 'test', noop ); // 3

            expect( onMaxListeners ).to.have.been.calledWith( 'test' );
            expect( onMaxListeners ).to.have.been.calledOnce;

            expect( function(){ emitter.maxListeners = 'a'; } ).to.throw( TypeError );
        } );

    } );
} );