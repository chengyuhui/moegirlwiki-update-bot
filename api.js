// Generated by CoffeeScript 1.7.1
(function() {
  var GPlusAPI, appVersion, client_id, client_secret, endpoint, random, red_uri, refresh, request, wait, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  wait = require('wait.for');

  _ = require('lodash');

  request = require('request');

  client_id = '545553600905.apps.googleusercontent.com';

  client_secret = 'q-tA1vMJhkoeoucVH7NfvryX';

  red_uri = 'urn:ietf:wg:oauth:2.0:oob';

  endpoint = 'https://www.googleapis.com/rpc?prettyPrint=false';

  appVersion = 16077;

  random = function(h, l) {
    return Math.round(Math.random() * (h - l) + l);
  };

  refresh = function(code, cb) {
    return wait.launchFiber(function() {
      var e, option, rep;
      option = {
        url: 'https://accounts.google.com/o/oauth2/token',
        method: 'POST',
        encoding: 'utf-8',
        headers: {
          'User-Agent': 'gtm-oauth2 com.google.GooglePlus/4.2.0',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Language': 'zh-cn'
        },
        form: {
          client_id: client_id,
          client_secret: client_secret,
          grant_type: 'refresh_token',
          refresh_token: code
        }
      };
      try {
        rep = JSON.parse(wait["for"](request, option).body);
        if (rep.error != null) {
          throw new Error(rep.error);
        }
      } catch (_error) {
        e = _error;
        return _.defer(cb, e);
      }
      return _.defer(cb, null, "" + rep.token_type + " " + rep.access_token);
    });
  };


  /*
  The main API class
  
  @mixin
   */

  GPlusAPI = (function() {

    /*
    Create an new API object
    
    @param refreshToken [String] The refresh token is used to login to the API and refresh the access token.
    @param userID [String] The user's Google+ profile ID. **Don't pass Integer**
     */
    function GPlusAPI(refreshToken, userID) {
      this.refreshToken = refreshToken;
      this.userID = userID;
      this.linkPreview = __bind(this.linkPreview, this);
      this.postPublicActivity = __bind(this.postPublicActivity, this);
      this.makeRequest = __bind(this.makeRequest, this);
    }


    /*
    Make API request.
    You can call this function manually if you want to make custom request.
    
    @param method [String] The JSON-RPC object's 'method' property.
    @param param [Object] The method's parameter.
    @param callback [function(err,result)] Called when the request executed.
     */

    GPlusAPI.prototype.makeRequest = function(method, param, cb) {
      return wait.launchFiber((function(_this) {
        return function() {
          var body, e, options, rep, _ref, _ref1;
          body = {
            id: random(233, 1),
            jsonrpc: '2.0',
            apiVersion: 'v2',
            method: method,
            params: {}
          };
          body.params = _.extend(param, {
            commonFields: {
              appVersion: appVersion,
              effectiveUser: _this.userID,
              sourceInfo: 'native:iphone_app'
            }
          });
          body = JSON.stringify(body);
          if (_this.access == null) {
            try {
              _this.access = wait["for"](refresh, _this.refreshToken);
            } catch (_error) {
              e = _error;
              return _.defer(cb, e);
            }
          }
          options = {
            url: endpoint,
            method: 'POST',
            encoding: 'utf-8',
            body: body,
            strictSSL: false,
            headers: {
              'Accept': 'application/json-rpc',
              'Accept-Language': 'zh-cn',
              'User-Agent': 'Mozilla/5.0 (iPad1,1; U; CPU iPhone OS 5_1_1 like Mac OS X; zh_CN) com.google.GooglePlus/13196 ' + '(KHTML, like Gecko) Mobile/K48AP (gzip)',
              'Authorization': _this.access
            }
          };
          try {
            rep = JSON.parse(wait["for"](request, options).body);
            if (((_ref = rep.error) != null ? _ref.message : void 0) === !'Invalid Credentials' && (rep.error != null)) {
              throw new Error(rep.error);
            }
          } catch (_error) {
            e = _error;
            return _.defer(cb, e);
          }
          if (((_ref1 = rep.error) != null ? _ref1.message : void 0) === 'Invalid Credentials') {
            try {
              _this.access = wait["for"](refresh, _this.refreshToken);
            } catch (_error) {
              e = _error;
              return _.defer(cb, e);
            }
            options.headers.Authorization = _this.access;
            try {
              rep = JSON.parse(wait["for"](request, options).body);
              if (rep.error != null) {
                throw new Error(rep.error);
              }
            } catch (_error) {
              e = _error;
              return _.defer(cb, e);
            }
          }
          return _.defer(cb, null, rep.result);
        };
      })(this));
    };


    /*
    Send a public post.
    
    
    @todo Implement sharing target selection
    @param updateText [String] The post's content.
    @param callback [function(err,result)] Called when the *plusi.ozinternal.postactivity* method executed
     */

    GPlusAPI.prototype.postPublicActivity = function(updateText, embed, callback) {
      var param;
      param = {
        externalId: "" + (random(1999999999999, 1000000000000)) + "_" + (random(39999999, 10000000)),
        updateText: updateText,
        sharingRoster: {
          sharingTargetId: [
            {
              groupType: "PUBLIC"
            }
          ]
        }
      };
      if (embed != null) {
        param.embed = embed;
      }
      return this.makeRequest('plusi.ozinternal.postactivity', param, callback);
    };

    GPlusAPI.prototype.linkPreview = function(url, callback) {
      return this.makeRequest('plusi.ozinternal.linkpreview', {
        content: url,
        fallbackToUrl: true,
        useSmallPreviews: true
      }, callback);
    };

    return GPlusAPI;

  })();

  module.exports = GPlusAPI;

}).call(this);

//# sourceMappingURL=api.map
