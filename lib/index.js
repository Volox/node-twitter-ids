'use strict';
// Load system modules

// Load modules
let debug = require( 'debug' )( 'twitter-ids' );

// Load my modules
let Account = require( './account' );
let Collector = require( './collector' );

// Constant declaration

// Module variables declaration

// Module class declaration

// Module functions declaration
function createAccount( config ) {
  debug( 'Creating account with config', config );

  return new Account( config );
}
function getTweets( ids, keys ) {
  debug( 'Creating all the accounts' );
  let accounts = keys.map( createAccount );

  // Shallow copy of the data, so we dont mess up with the input source
  let idsCopy = ids.slice();
  let collector = new Collector();

  // Connect all the account to the collector
  accounts.forEach( account => {
    debug( 'Adding %s to %s', account, collector );
    collector.add( account );
  } );

  // Start all the accounts
  accounts.forEach( account => {
    debug( 'Start processing on %s', account );
    account.processIds( idsCopy );
  } );

  return collector;
}

// Module initialization (at first load)

// Module exports
module.exports = getTweets;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78