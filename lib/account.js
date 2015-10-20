'use strict';
// Load system modules
let stream = require( 'stream' );

// Load modules
let Promise = require( 'bluebird' );
let Twit = require( 'twit' );
let debug = require( 'debug' )( 'twitter-ids:account' );

// Load my modules

// Constant declaration
const WINDOW = 1000*60*15;

// Module variables declaration
let i = 0;

// Module functions declaration


// Module class declaration
class Account extends stream.Readable {
  constructor( config ) {
    super( { objectMode: true } );

    // Crete the low level API
    let api = new Twit( config );
    api = Promise.promisifyAll( api );

    this.api = api;
    this.total = 0;
    this.name = 'Account '+( ++i );
    this.timeReset = null;

    debug( '%s, created', this );
  }

  // Implement methods
  _read() {}

  toString() {
    return this.name;
  }

  // Methods
  getWaitTime() {
    let waitTime = this.timeReset.valueOf() - Date.now();
    if( waitTime >0 ) {
      return waitTime;
    } else {
      return 0;
    }
  }
  waitAndRetry( id ) {
    let promise;

    if( this.timeReset ) {
      // Use the associated time reset
      promise = Promise
      .resolve( this.getWaitTime() );
    } else {
      // Get the reset timestamp
      promise = this.api
      .getAsync( 'application/rate_limit_status', {
        resources: 'statuses',
      } )
      .get( 0 )
      .get( 'resources' )
      .get( 'statuses' )
      .get( '/statuses/show/:id' )
      .get( 'reset' )
      .then( seconds => seconds*1000 )
      .then( timestamp => {
        this.timeReset = new Date( timestamp );
        return this.getWaitTime();
      } )
      ;
    }

    return promise
    .then( waitTime => {
      debug( '%s, wait for %d ms', this, waitTime );
      return Promise.delay( waitTime );
    } )
    .then( ()=> {
      this.timeReset = null;
      return this.getTweet( id );
    } );
  }
  getTweet( id ) {
    if( typeof id !== 'string' ) {
      throw new Error( 'Cannot get tweet by id, not a string' );
    }

    debug( '%s, get tweet: %s', this, id );

    // Make request with the API
    return this.api
    .getAsync( 'statuses/show/:id', { id } )
    .spread( ( tweet, resp ) => {
      if( tweet ) {
        this.total += 1;
        debug( '%s, sending tweet %d', this, this.total );
        this.push( tweet );
      }

      if( !this.timeReset ) {
        let utcTime = Number( resp.headers[ 'x-rate-limit-reset' ] );
        debug( '%s, setting time reset to %d', this, utcTime );
        this.timeReset = new Date( utcTime*1000 );
      }
    } )
    .catch( err => {
      if( err.code===88 ) {
        debug( '%s, limit reached', this );
        return this.waitAndRetry( id );
      } else {
        debug( '%s, error', this, err.cause || err );
        return this.getTweet( id );
      }
    } );
  }

  processIds( ids ) {
    debug( '%s, processing %d ids', this, ids.length );

    let id = ids.pop();
    if( !id ) {
      // Done
      debug( '%s, done processing', this );
      this.push( null );
      return;
    }

    // Process id
    setImmediate( ()=> {
      this
      .getTweet( id )
      .then( () => {
        this.processIds( ids );
      } );
    } );
  }
}

// Module initialization (at first load)

// Module exports
module.exports = Account;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78