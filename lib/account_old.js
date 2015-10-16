'use strict';
// Load system modules

// Load modules
var _ = require( 'lodash' );
var Promise = require( 'bluebird' );
var Twit = require( 'twit' );
var debug = require( 'debug' )( 'twitter-ids:account' );

// Load my modules

// Constant declaration
var WINDOW = 1000*60*15;
var MAX_CALLS = 180;
var i = 0;

// Module variables declaration

// Module functions declaration
function Account( config ) {
  var api = new Twit( config );
  api = Promise.promisifyAll( api );

  this.api = api;
  this.count = 0;
  this.name = 'Account '+(++i);
  debug( 'Account created: %s', this.name );
}
Account.prototype.getTweet = function( id ) {
  debug( '%s get tweet: %s', this.name, id );
  this.count++;
  if( this.count>=MAX_CALLS ) {
    debug( '%s, limit reached', this.name );

    return Promise
    .delay( id, WINDOW )
    .bind( this )
    .then( function() {
      debug( '%s, reset count', this.name );
      this.count = 0;
    } )
    .then( this.getTweet );
  } else {
    return this.api
    .getAsync( 'statuses/show/:id', { id: id } )
    .catch( function( err ) {
      debug( '%s, error', this.name, err );
      return null;
    }.bind( this ) )
    .then( function( result ) {
      return result? result[ 0 ] : null;
    } )
    ;
  }
}
Account.prototype.process = function( ids ) {
  var data = [];
  debug( '%s, processing %d ids', this.name, ids.length );

  return Promise
  .resolve()
  .bind( this )
  .then( function callMe() {
    var id = ids.pop();
    debug( '%s, call me with id: %s', this.name, id );
    if( !id ) {
      return data;
    }

    return this
    .getTweet( id )
    .then( function( tweet ) {
      debug( '%s, got tweet', this.name );
      data.push( tweet );
    }.bind( this ) )
    .then( callMe.bind( this ) )
    ;
  } )
  .then( function( tweets ) {
    debug( '%s, got %d tweets', this.name, tweets.length );
    return _.flattenDeep( tweets );
  } )
  ;
};


// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports = Account;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78