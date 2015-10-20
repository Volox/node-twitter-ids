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
class Collector extends stream.PassThrough {
  constructor() {
    super( { objectMode: true } );

    debug( 'Collector ready' );
    this.sources = 0;
    this.setMaxListeners( 0 );
  }

  toString() {
    return 'Collector';
  }

  // Methods
  addSource( source ) {
    this.sources += 1;
    debug( 'Adding source: %d', this.sources );

    source.on( 'end', () => this.sourceFinished() );
    source.pipe( this, { end: false } );
  }

  sourceFinished() {
    this.sources -= 1;
    debug( 'Source finished: %d', this.sources );

    if( this.sources===0 ) {
      debug( 'No more sources' );
      // No more account to wait for...
      this.end();
    }
  }
}


// Module initialization (at first load)

// Module exports
module.exports = Collector;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78