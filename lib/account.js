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
const MAX_CALLS = 180;

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
    this.count = 0;
    this.total = 0;
    this.name = 'Account '+( ++i );

    debug( '%s created', this );
  }

  // Implement methods
  _read() {}

  toString() {
    return this.name;
  }

  // Methods
  waitAndRetry( id ) {
    return Promise
    .delay( WINDOW ) // Wait WINDOW ms then retry
    .then( ()=> {
      debug( '%s, reset count', this );
      this.count = 0;
      return this.getTweet( id );
    } );
  }
  getTweet( id ) {
    if( typeof id !== 'string' ) {
      throw new Error( 'Cannot get tweet by id, not a string' );
    }

    debug( '%s get tweet: %s', this, id );
    this.count += 1;

    // Limit reached
    if( this.count>=MAX_CALLS ) {
      debug( '%s, limit reached', this );
      return this.waitAndRetry( id );

    // Make request with the API
    } else {
      return this.api
      .getAsync( 'statuses/show/:id', { id } )
      .then( result => {
        if( Array.isArray( result ) && result[ 0 ] ) {
          this.total += 1;
          this.push( result[ 0 ] );
        }
      } )
      .catch( err => {
        if( err.code===88 ) {
          return this.waitAndRetry( id );
        } else {
          debug( '%s, error', this, err );
        }
      } );
    }
  }

  processIds( ids ) {

    debug( '%s, processing %d ids', this, ids.length );
    let id = ids.pop();
    if( !id ) {
      // Done
      debug( '%s, Done processing', this );
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