//'use strict';

/**
 * Module dependencies.
 */
const
    opts = {},
    passport = require('passport'),
    util = require('util'),
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError = require('passport-oauth').InternalOAuthError,
    parse = function (json) {
        let profile = {};

        profile.username = json.username;
        profile.firstName = json.firstName;
        profile.lastName = json.lastName;
        profile.fullNameEn = json.fullNameEn;
        profile.fullNameAr = json.fullNameAr;
        profile.mail = json.mail;
        profile.provider = json.provider;


        return profile;
    };

function psaStrategy(options = {}) {
    if (!options.authServerURL) { throw new TypeError('OAuth2Strategy requires a authServerURL option'); }
    if (!options.hostURL) { throw new TypeError('OAuth2Strategy requires a hostURL option'); }
    if (!options.clientID) { throw new TypeError('OAuth2Strategy requires a clientID option'); }
    if (!options.clientSecret) { throw new TypeError('OAuth2Strategy requires a clientSecret option'); }

    opts.authServerURL = options.authServerURL
    opts.authServerProfileURI = options.authServerProfileURI || 'user'
    opts.hostURL = options.hostURL
    opts.sessionKey = options.sessionKey
    opts.clientID = options.clientID
    opts.clientSecret = options.clientSecret
    opts.failureRedirect = options.failureRedirect || '/error'
    opts.debug = options.debug || false

    opts.oauth2 = {
        authorizationURL: opts.authServerURL + 'oauth2/authorize',
        tokenURL: opts.authServerURL + 'oauth2/token',
        clientID: opts.clientID,
        clientSecret: opts.clientSecret,
        callbackURL: opts.hostURL + 'oauth2/callback'
    }


    /**
     * `Strategy` constructor.
     *
     * The example-oauth2orize authentication strategy authenticates requests by delegating to
     * example-oauth2orize using the OAuth 2.0 protocol.
     *
     * Applications must supply a `verify` callback which accepts an `accessToken`,
     * `refreshToken` and service-specific `profile`, and then calls the `done`
     * callback supplying a `user`, which should be set to `false` if the
     * credentials are not valid.  If an exception occured, `err` should be set.
     *
     * Options:
     *   - `clientID`      your example-oauth2orize application's client id
     *   - `clientSecret`  your example-oauth2orize application's client secret
     *   - `callbackURL`   URL to which example-oauth2orize will redirect the user after granting authorization
     *
     * Examples:
     *
     *     passport.use(new ExampleStrategy({
     *         clientID: '123-456-789',
     *         clientSecret: 'shhh-its-a-secret'
     *         callbackURL: 'https://www.example.net/auth/example-oauth2orize/callback'
     *       },
     *       function (accessToken, refreshToken, profile, done) {
     *         User.findOrCreate(..., function (err, user) {
     *           done(err, user);
     *         });
     *       }
     *     ));
     *
     * @param {Object} options
     * @param {Function} verify
     * @api public
     */
    function Strategy(options, verify) {
        var me = this;

        options = options || {};
        options.authorizationURL =
            options.authorizationURL ||
            options.authorizationUrl ||
            (opts.oauth2.authorizationURL);
        options.tokenURL =
            options.tokenURL ||
            options.tokenUrl ||
            (opts.oauth2.tokenURL);

        OAuth2Strategy.call(me, options, verify);

        // must be called after prototype is modified
        me.name = 'PSA-AUTH-STRATEGY';
    }

    /**
     * Inherit from `OAuth2Strategy`.
     */
    util.inherits(Strategy, OAuth2Strategy);


    /**
     * Retrieve user profile from example-oauth2orize.
     *
     * This function constructs a normalized profile, with the following properties:
     *
     *   - `provider`         always set to `example-oauth2orize`
     *   - `id`
     *   - `username`
     *   - `displayName`
     *
     * @param {String} accessToken
     * @param {Function} done
     * @api protected
     */

    Strategy.prototype.userProfile = function (accessToken, done) {
        let me = this;

        me._oauth2.get(
            opts.authServerURL + opts.authServerProfileURI,
            accessToken,
            function (err, body /*, res*/) {
                if (opts.debug)
                    console.log('body', body)
                let json, profile;
                if (err) {
                    return done(new InternalOAuthError('failed to fetch user profile', err));
                }

                if ('string' === typeof body) {
                    try {
                        json = JSON.parse(body);
                    } catch (e) {
                        done(e);
                        return;
                    }
                } else if ('object' === typeof body) {
                    json = body;
                }
                profile = parse(json);
                profile.provider = me.name;
                if (opts.debug)
                    console.log('PROFILE', profile);
                // profile._raw = body;
                // profile._json = json;

                done(null, profile);
            }
        );
    };

    passport.use('PSA-AUTH-STRATEGY',
        new Strategy(opts.oauth2,
            function (accessToken, refreshToken, profile, done) {
                done(null, profile);
            }
        ));

    let middleware = [
        passport.initialize(),
        function (req, res, next) {
            if (req.url.indexOf('/oauth2/init') === 0) {
                return res.redirect(`${opts.oauth2.authorizationURL}?response_type=code&client_id=${opts.clientID}&&redirect_uri=${opts.oauth2.callbackURL}`)
            } else {
                return next();
            }

        },
        function (req, res, next) {
            if (req.url.indexOf('/oauth2/callback') === 0) {
                return passport.authenticate('PSA-AUTH-STRATEGY', {
                    session: false,
                    failureRedirect: opts.failureRedirect
                })(req, res, next)
            } else {
                return next();
            }

        },
        function (req, res, next) {
            if (req.url.indexOf('/oauth2/callback') === 0) {
                req.session[opts.sessionKey] = req.user.username
                return res.redirect('/');
            } else next()
        }
    ]

    return middleware
}

/**
 * Expose `passport`.
 */
module.exports = psaStrategy
