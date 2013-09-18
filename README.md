## restify-throttle
#### Token bucket based HTTP request throttle for Node.js

### Installation
```bash
npm install restify-throttle
```

### Basic Use
```js
var restify     = require('restify'),
    throttle    = require('restify-throttle');

// Create the server and pass-in the throttle middleware
var server      = restify.createServer();
server.use(throttle({
    burst: 100,
    rate: 50,
    ip: true,
    overrides: {
        '192.168.1.1': {
            rate: 0,        // unlimited
            burst: 0
        }
    }
}));

// Define a route
server.get('/hello/:name', function (req, res, next) {
    res.send('hello ' + req.params.name);
});

// Listen
server.listen(3333);
```

### Use Without Restify
The throttle module can be used in just about any application that supports the `function (req, res, next)` middleware convention (such as express / connect).

### Options
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Default</th>
            <th>Type</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr><td>rate</td><td>n/a</td><td>Number</td><td>Steady state number of requests/second to allow</td></tr>
        <tr><td>burst</td><td>n/a</td><td>Number</td><td>If available, the amount of requests to burst to</td></tr>
        <tr><td>ip</td><td>false</td><td>Boolean</td><td>Do throttling on a /32 (source IP)</td></tr>
        <tr><td>xff</td><td>false</td><td>Boolean</td><td>Do throttling on a /32 (X-Forwarded-For)</td></tr>
        <tr><td>username</td><td>false</td><td>Boolean</td><td>Do throttling on <code>req.username</code></td></tr>
        <tr><td>overrides</td><td>null</td><td>Object</td><td>Per "key" overrides</td></tr>
        <tr><td>tokensTable</td><td>lru-cache</td><td>Object</td><td>Storage engine; must support set/get</td></tr>
        <tr><td>maxKeys</td><td>10000</td><td>Number</td><td>If using the built-in storage table, the maximum distinct throttling keys to allow at a time</td></tr>
    </tbody>
</table>

### Testing
```bash
npm test
```

### Credits
This module is adapted from [restify's]() throttle plug-in – originally developed by [Mark Cavage]().