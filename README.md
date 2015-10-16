# Twitter IDs

Get a list of raw tweets based on a list of ids.

## Usage

```js
var getTweets = require( 'get-tweets' );

var ids = [
    'id1',
    'id2',
    ...
]

var keys = [
    {
        key: 'key',
        secret: 'secret',
    },
    
]

let tweetStream = getTweet( ids, keys );
tweetStream.on( 'data', tweet => console.log( tweet.id_str ) );
```