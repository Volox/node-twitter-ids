'use strict';
// Load system modules
let stream = require( 'stream' );

// Load modules
let debug = require( 'debug' )( 'twitter-ids:collector' );

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration


// Module class declaration
class Collector extends stream.Transform {
  constructor() {
    super( { objectMode: true } );

    debug( 'Collector ready' );
    this.sources = 0;
  }

  // Implement methods
  _transform( tweet, enc, cb ) {
    debug( 'Got tweet: %s', tweet.id );
    // pass data
    return cb( null, tweet )
  }

  toString() {
    return `Collector`;
  }

  // Methods
  add( source ) {
    this.sources += 1;
    source
    .pipe( this, { end: false } )
    .on( 'end', () => this.sourceFinished() );
  }

  sourceFinished() {
    this.sources -= 1;
    if( this.sources===0 ) {
      // No more account to wait for...
      this.push( null );
    }
  }
}


// Module initialization (at first load)

// Module exports
module.exports = Collector;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78