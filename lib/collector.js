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
  constructor( name ) {
    super( { objectMode: true } );

    this.name = name || '';
    this.sources = 0;
    this.setMaxListeners( 0 );

    debug( '%s ready', this );
  }

  toString() {
    return `Collector ${this.name}`;
  }

  // Methods
  addSource( source ) {
    this.sources += 1;
    debug( '%s, adding source: %d', this, this.sources );

    source.on( 'end', () => this.sourceFinished() );
    source.pipe( this, { end: false } );
  }

  sourceFinished() {
    this.sources -= 1;
    debug( '%s, source finished: %d', this, this.sources );

    if( this.sources===0 ) {
      debug( '%s, no more sources', this );
      // No more account to wait for...
      this.end();
    }
  }
}
Collector.prototype.add = Collector.prototype.addSource;

// Module initialization (at first load)

// Module exports
module.exports = Collector;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78