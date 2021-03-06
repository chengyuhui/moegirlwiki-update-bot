// Generated by CoffeeScript 1.7.1
(function() {
  var EventEmitter, GPlusAPI, api, http, l, maxRetry, mongoose, recentChangeModel, recentChangeSchema, request, retries, scheduleJob, updateJob, wait, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  http = require('http');

  wait = require('wait.for');

  request = require('request');

  EventEmitter = require('eventemitter3');

  mongoose = require('mongoose');

  GPlusAPI = require('./api');

  _ = require('lodash');

  scheduleJob = require('pomelo-schedule').scheduleJob;

  l = require('tracer').colorConsole({
    format: '{{timestamp}} <{{title}}>{{message}}',
    dateformat: "HH:MM:ss"
  });

  api = new GPlusAPI(process.env.REFRESH_TOKEN, process.env.GPLUS_UID);

  mongoose.connect(process.env.MONGODB);

  
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('hello, i know nodejitsu\n');
}).listen(80);
;

  recentChangeSchema = new mongoose.Schema({
    rcid: {
      type: Number,
      index: true
    }
  });

  recentChangeModel = mongoose.model('RecentChange', recentChangeSchema);

  maxRetry = 3;

  retries = 0;

  updateJob = function() {
    return wait.launchFiber(function() {
      var activity, e, embed, item, rc, rcids, rep, skip, str;
      try {
        rep = wait["for"](request, {
          url: 'http://zh.moegirl.org/api.php?format=json&action=query&list=recentchanges' + '&rcnamespace=0&rctoponly=1&rcprop=flags|title|ids',
          method: 'GET',
          timeout: 10000,
          headers: {
            'User-Agent': 'UpdateBot4G+'
          }
        });
        if (rep.statusCode === !200) {
          throw new Error(rep.statusCode);
        }
      } catch (_error) {
        e = _error;
        if (retries < maxRetry) {
          setTimeout(updateJob, 1000 * 60);
          retries++;
          l.error('Moegirlwiki request error,retrying in 1 minute.');
        }
        return l.error('Moegirlwiki request error:%s', e.toString());
      }
      try {
        rc = JSON.parse(rep.body).query.recentchanges;
      } catch (_error) {
        e = _error;
        if (retries < maxRetry) {
          setTimeout(updateJob, 1000 * 60);
          retries++;
          l.error('Moegirlwiki API error,retrying in 1 minute.');
        }
        return l.error('Moegirlwiki API error:%s', e.toString());
      }
      rc = rc.filter(function(i) {
        return i.bot == null;
      });
      rcids = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = rc.length; _i < _len; _i++) {
          item = rc[_i];
          _results.push(item.rcid);
        }
        return _results;
      })();
      try {
        skip = wait.forMethod(recentChangeModel.find()["in"]('rcid', rcids).select('rcid'), 'exec');
      } catch (_error) {
        e = _error;
        if (retries < maxRetry) {
          setTimeout(updateJob, 1000 * 60);
          retries++;
          l.error('Mongodb query error,retrying in 1 minute.');
        }
        return l.error('Mongodb query error:%s', e.toString());
      }
      if (rc.length === skip.length) {
        return l.info('Nothing to post.');
      }
      item = _.find(rc, function(item) {
        var _ref;
        return _ref = item.rcid, __indexOf.call(skip, _ref) < 0;
      });
      item.url = 'http://zh.moegirl.org/' + encodeURIComponent(item.title);
      try {
        embed = wait["for"](api.linkPreview, item.url);
        if (!embed.succeeded) {
          throw new Error();
        }
      } catch (_error) {
        e = _error;
        if (retries < maxRetry) {
          setTimeout(updateJob, 1000 * 60);
          retries++;
          l.error('Embed fetching error,retrying in 1 minute.');
        }
        return l.error('Cannot fetch %s from Google server:%s', item.url, e.toString());
      }
      str = "条目： #" + (item.title.replace(' ', '_')) + "\n\n更新了哦！不来看看么？\n传送在此：\n\n→_→ " + item.url;
      try {
        activity = wait["for"](api.postPublicActivity, str, embed.embedItem[0]);
      } catch (_error) {
        e = _error;
        if (retries < maxRetry) {
          setTimeout(updateJob, 1000 * 60);
          retries++;
          l.error('Google+ posting error,retrying in 1 minute.');
        }
        return l.error('Google+ posting error:%s', e.toString());
      }
      recentChangeModel.create({
        rcid: item.rcid
      });
      return l.info('Finished posting:%s', activity.stream.update[0].updateId);
    });
  };

  scheduleJob({
    period: 1200000
  }, updateJob);

  l.info('Main loop started.');

}).call(this);

//# sourceMappingURL=app.map
