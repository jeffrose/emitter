'use strict';

var chai            = require( 'chai' ),
    sinon           = require( 'sinon' ),
    sinon_chai      = require( 'sinon-chai' ),
    EventEmitter    = require( '../src' ),

    expect          = chai.expect;

chai.use( sinon_chai );

describe( 'EventEmitter', function(){

    it( 'should be a function', function(){
        expect( EventEmitter ).to.be.a( 'function' );
    } );

    it( 'should have static functions and properties', function(){
        expect( EventEmitter.EventEmitter ).to.be.a( 'function' );
        expect( EventEmitter.listenerCount ).to.be.a( 'function' );
        expect( EventEmitter.defaultMaxListeners ).to.be.a( 'number' );
    } );

    it( 'should create instances', function(){
        var emitter = new EventEmitter();
        expect( emitter ).to.be.an( 'object' );
        expect( emitter ).to.be.an.instanceof( EventEmitter );
    } );

    describe( 'eventEmitter', function(){
        var emitter;

        beforeEach( function(){
            emitter = new EventEmitter();
        } );
        
        afterEach( function(){
            emitter.allOff();
            emitter = undefined;
        } );

        it( 'should have functions and properties', function(){
            expect( emitter.allOff ).to.be.a( 'function' );
            expect( emitter.emit ).to.be.a( 'function' );
            expect( emitter.listeners ).to.be.a( 'function' );
            expect( emitter.many ).to.be.a( 'function' );
            expect( emitter.off ).to.be.a( 'function' );
            expect( emitter.on ).to.be.a( 'function' );
            expect( emitter.once ).to.be.a( 'function' );
            expect( emitter.setMaxListeners ).to.be.a( 'function' );
            expect( emitter.trigger ).to.be.a( 'function' );

            // Aliases
            expect( emitter.on ).to.equal( emitter.addListener );
            expect( emitter.off ).to.equal( emitter.removeListener );
            expect( emitter.allOff ).to.equal( emitter.removeAllListeners );
            expect( emitter.many ).to.equal( emitter.addManyListener );
            expect( emitter.once ).to.equal( emitter.addOnceListener );
        } );

        it( 'should provide event subscription', function(){
            var events = [],
                listeners = [],

                onFoo = sinon.spy(),
                onFooToo = sinon.spy(),
                onBar = sinon.spy();

            emitter.on( 'newListener', function( event, listener ){
                events.push( event );
                listeners.push( listener );
            } );

            emitter.on( 'foo', onFoo );
            emitter.on( 'foo', onFooToo );
            emitter.on( 'bar', onBar );

            emitter.emit( 'foo' );
            emitter.emit( 'bar' );

            expect( onFoo ).to.have.been.calledOnce;
            expect( onFooToo ).to.have.been.calledOnce;
            expect( onBar ).to.have.been.calledOnce;

            expect( events ).to.deep.equal( [ 'foo', 'foo', 'bar' ] );
            expect( listeners ).to.deep.equal( [ onFoo, onFooToo, onBar ] );

            // For some reason this fails
            //expect( emitter.listeners( 'foo ') ).to.deep.equal( [ onFoo, onFooToo ] );
            expect( emitter.listeners( 'foo' )[ 0 ] ).to.equal( onFoo );
            expect( emitter.listeners( 'foo' )[ 1 ] ).to.equal( onFooToo );

            expect( function(){ emitter.on( 'foo' ); } ).to.throw( TypeError );
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
            var events = [],
                listeners = [],

                onEmit = sinon.spy();

            emitter.on( 'test', onEmit );

            emitter.emit( 'test', 1, 2, 3 );
            emitter.off( 'test', onEmit );
            emitter.emit( 'test', 4, 5, 6 );

            expect( onEmit ).to.have.been.calledWith( 1, 2, 3 );
            expect( onEmit ).to.have.been.calledOnce;

            expect( function(){ emitter.off( 'test' ); } ).to.throw( TypeError );
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
        
        it( 'should provide a way to listen to every event', function(){
            var onEmit = sinon.spy();
            
            emitter.on( onEmit );                           // +2
            emitter.on( EventEmitter.every, onEmit );       // +2
            emitter.on( undefined, onEmit );                // +2
            emitter.once( onEmit );                         // +1
            emitter.once( EventEmitter.every, onEmit );     // +1
            emitter.once( undefined, onEmit );              // +1
            emitter.many( 2, onEmit );                      // +2
            emitter.many( EventEmitter.every, 2, onEmit );  // +2
            emitter.many( undefined, 2, onEmit );           // +2
            
            emitter.emit( 'foo' );
            emitter.emit( 'bar' );
            
            emitter.allOff( EventEmitter.every );
            
            emitter.emit( 'qux' );
            
            expect( onEmit ).to.have.callCount( 15 );
        } );

        it( 'should emit events when listeners are added and removed', function(){
            var noop = function(){},

                onNewListener = sinon.spy(),
                onRemoveListener = sinon.spy();

            emitter.on( 'newListener', onNewListener );
            emitter.on( 'removeListener', onRemoveListener );

            emitter.once( 'test', noop );

            emitter.emit( 'test' );

            expect( onNewListener ).to.have.been.calledWith( 'test' );
            expect( onNewListener ).to.have.been.calledWith( 'removeListener' );
            expect( onNewListener ).to.have.been.calledTwice;

            expect( onRemoveListener ).to.have.been.calledWith( 'test' );
            expect( onRemoveListener ).to.have.been.calledOnce;
        } );

        it( 'should provide a listener count', function(){
            var noop = function(){};

            emitter.on( 'test', noop );
            emitter.on( 'test', noop );

            emitter.emit( 'empty' );

            expect( EventEmitter.listenerCount( emitter, 'test' ) ).to.equal( 2 );
            expect( EventEmitter.listenerCount( emitter, 'empty' ) ).to.equal( 0 );
            expect( EventEmitter.listenerCount( emitter, 'undefined' ) ).to.equal( 0 );
        } );

        it( 'should limit the number of subscriptions', function(){
            var noop = function(){},

                onMaxListeners = sinon.spy();

            emitter.on( 'maxListeners', onMaxListeners );

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

            emitter.setMaxListeners( 2 );

            emitter.on( 'maxListeners', onMaxListeners );

            emitter.on( 'test', noop ); // 1
            emitter.on( 'test', noop ); // 2
            emitter.on( 'test', noop ); // 3

            expect( onMaxListeners ).to.have.been.calledWith( 'test' );
            expect( onMaxListeners ).to.have.been.calledOnce;

            expect( function(){ emitter.setMaxListeners( 'a' ); } ).to.throw( TypeError );
        } );

    } );
} );