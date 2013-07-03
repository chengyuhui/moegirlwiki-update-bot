// Generated by IcedCoffeeScript 1.6.2d
(function() {
  var GPlusAPI, api, col_e, col_upd, counter, crc32, db, fetch, fs, iced, jsdom, make_esc, mongo, question, request, time, update, _, __iced_k, __iced_k_noop,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  iced = require('iced-coffee-script').iced;
  __iced_k = __iced_k_noop = function() {};

  make_esc = require('iced-error').make_esc;

  jsdom = require('jsdom');

  fs = require('fs');

  request = require('request');

  crc32 = require('crc').crc32;

  mongo = require('mongoskin');

  _ = require('underscore');

  time = require('time');

  global.CONFIG = JSON.parse(fs.readFileSync('config.json'));

  GPlusAPI = require('./lib/api');

  api = new GPlusAPI(CONFIG.refresh_token, CONFIG.uid);

  db = mongo.db(CONFIG.mongodb, {
    w: true
  });

  col_upd = db.collection('updates');

  col_e = db.collection('edits');

  fetch = function(gcb) {
    var $, e, esc, html, item, list, req, window, ___iced_passed_deferral, __iced_deferrals, __iced_k,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    esc = make_esc(gcb);
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "main.coffee",
        funcname: "fetch"
      });
      request({
        url: 'http://zh.moegirl.org/api.php',
        qs: {
          format: 'json',
          action: 'parse',
          page: 'User:萌星空/你知道吗/存档/更新姬版',
          prop: 'text'
        },
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Node.js'
        }
      }, esc(__iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            return req = arguments[0];
          };
        })(),
        lineno: 33
      })));
      __iced_deferrals._fulfill();
    })(function() {
      if (req.statusCode === !200) {
        return gcb(req.statusCode);
      }
      html = '';
      try {
        html = JSON.parse(req.body).parse.text['*'];
      } catch (_error) {
        e = _error;
        return gcb(e);
      }
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "main.coffee",
          funcname: "fetch"
        });
        jsdom.env(html, ['jquery.js'], {}, esc(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return window = arguments[0];
            };
          })(),
          lineno: 43
        })));
        __iced_deferrals._fulfill();
      })(function() {
        $ = window.$;
        $('table').remove();
        list = (function() {
          var _i, _len, _ref, _results;
          _ref = $('li');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            _results.push({
              title: $.trim($(item).text().split('——')[0]),
              url: 'http://zh.moegirl.org' + $(item).children('a:last').attr('href'),
              "new": $(item).children('a:last').hasClass('new')
            });
          }
          return _results;
        })();
        return gcb(null, list);
      });
    });
  };

  update = function(gcb) {
    var activity, e, embed, esc, item, rc, rcids, req, results, str, ___iced_passed_deferral, __iced_deferrals, __iced_k,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    esc = make_esc(gcb);
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "main.coffee",
        funcname: "update"
      });
      request({
        url: 'http://zh.moegirl.org/api.php?format=json&action=query&list=recentchanges&rcnamespace=0&rctoponly=1',
        method: 'GET',
        timeout: 10000,
        proxy: 'http://127.0.0.1:8888',
        headers: {
          'User-Agent': 'Node.js'
        }
      }, esc(__iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            return req = arguments[0];
          };
        })(),
        lineno: 63
      })));
      __iced_deferrals._fulfill();
    })(function() {
      if (req.statusCode === !200) {
        return gcb(req.statusCode);
      }
      rc = [];
      try {
        rc = JSON.parse(req.body).query.recentchanges;
      } catch (_error) {
        e = _error;
        return gcb(e);
      }
      rcids = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = rc.length; _i < _len; _i++) {
          item = rc[_i];
          _results.push(item.rcid);
        }
        return _results;
      })();
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "main.coffee",
          funcname: "update"
        });
        col_e.find({
          rcid: {
            '$in': rcids
          }
        }, {
          _id: 0,
          rcid: 1
        }).toArray(esc(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return results = arguments[0];
            };
          })(),
          lineno: 75
        })));
        __iced_deferrals._fulfill();
      })(function() {
        if (rc.length === results.length) {
          return gcb('nothing to post');
        }
        results = _.flatten(results.map(function(item) {
          return item.rcid;
        }));
        item = _.find(rc, function(item) {
          var _ref;
          return _ref = item.rcid, __indexOf.call(results, _ref) < 0;
        });
        if (item == null) {
          return gcb('nothing to post');
        }
        item.url = 'http://zh.moegirl.org/' + item.title;
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "main.coffee",
            funcname: "update"
          });
          api.linkPreview(encodeURI(item.url), esc(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return embed = arguments[0];
              };
            })(),
            lineno: 83
          })));
          __iced_deferrals._fulfill();
        })(function() {
          if (!embed.succeeded) {
            return gcb(new Error("Cannot fetch " + item.url + " from Google server."));
          }
          str = "条目： #" + (item.title.replace(' ', '_')) + "\n\n更新了哦！不来看看么？\n传送在此：\n\n→_→ " + (encodeURI(item.url));
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "main.coffee",
              funcname: "update"
            });
            api.postPublicActivity(str, embed.embedItem[0], esc(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return activity = arguments[0];
                };
              })(),
              lineno: 96
            })));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "main.coffee",
                funcname: "update"
              });
              col_e.insert({
                rcid: item.rcid
              }, esc(__iced_deferrals.defer({
                lineno: 98
              })));
              __iced_deferrals._fulfill();
            })(function() {
              return gcb(null, activity, item.rcid);
            });
          });
        });
      });
    });
  };

  question = function(gcb) {
    var activity, embed, esc, hash, i, item, list, results, ___iced_passed_deferral, __iced_deferrals, __iced_k,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    esc = make_esc(gcb);
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "main.coffee",
        funcname: "question"
      });
      fetch(esc(__iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            return list = arguments[0];
          };
        })(),
        lineno: 104
      })));
      __iced_deferrals._fulfill();
    })(function() {
      var _i, _len;
      hash = [];
      for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
        item = list[i];
        item.hash = crc32(item.title);
        list[i].hash = item.hash;
        hash.push(item.hash);
      }
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "main.coffee",
          funcname: "question"
        });
        col_upd.find({
          hash: {
            '$in': hash
          }
        }, {
          _id: 0,
          hash: 1
        }).toArray(esc(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return results = arguments[0];
            };
          })(),
          lineno: 112
        })));
        __iced_deferrals._fulfill();
      })(function() {
        if (list.length === results.length) {
          return gcb('nothing to post');
        }
        results = _.flatten(results.map(function(item) {
          return item.hash;
        }));
        item = _.find(list, function(item) {
          var _ref;
          return _ref = item.hash, __indexOf.call(results, _ref) < 0;
        });
        if (item == null) {
          return gcb('nothing to post');
        }
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "main.coffee",
            funcname: "question"
          });
          api.linkPreview(encodeURI(item.url), esc(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return embed = arguments[0];
              };
            })(),
            lineno: 119
          })));
          __iced_deferrals._fulfill();
        })(function() {
          if (!embed.succeeded) {
            return gcb(new Error("Cannot fetch " + item.url + " from Google server."));
          }
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "main.coffee",
              funcname: "question"
            });
            api.postPublicActivity(item.title, embed.embedItem[0], esc(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return activity = arguments[0];
                };
              })(),
              lineno: 123
            })));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "main.coffee",
                funcname: "question"
              });
              col_upd.insert(item, esc(__iced_deferrals.defer({
                lineno: 125
              })));
              __iced_deferrals._fulfill();
            })(function() {
              return gcb(null, activity, item);
            });
          });
        });
      });
    });
  };

  counter = 1;

  setInterval(function() {
    var now;
    now = new time.Date();
    now.setTimezone('Asia/Shanghai');
    if (now.getHours() < 6) {
      if (counter === 4) {
        update(function(err, a, rcid) {
          counter = 1;
          if (err) {
            return require('util').log("[U][ERROR]" + err.message);
          }
          return require('util').log("[Q][POSTED]" + a.stream.update[0].updateId + "(" + rcid + ")");
        });
        question(function(err, a, i) {
          if (err) {
            return require('util').log("[Q][ERROR]" + err.message);
          }
          return require('util').log("[Q][POSTED]" + a.stream.update[0].updateId + "(" + i.hash + ")");
        });
      } else {
        counter++;
      }
    } else {
      if (counter === 4) {
        question(function(err, a, i) {
          counter = 1;
          if (err) {
            return require('util').log("[Q][ERROR]" + err.message);
          }
          return require('util').log("[Q][POSTED]" + a.stream.update[0].updateId + "(" + i.hash + ")");
        });
      }
      update(function(err, a, rcid) {
        counter = 1;
        if (err) {
          setTimeout(function() {
            return update(function(err, a, rcid) {
              if (err) {
                return require('util').log("[U][ERROR]" + err.message);
              }
              return require('util').log("[U][POSTED]" + a.stream.update[0].updateId + "(" + i.hash + ")");
            });
          }, 300000);
          return require('util').log("[U][ERROR]" + err.message);
        }
        return require('util').log("[U][POSTED]" + a.stream.update[0].updateId + "(" + rcid + ")");
      });
    }
    return question(function(err, a, i) {
      if (err) {
        return require('util').log("[Q][ERROR]" + err.message);
      }
      return require('util').log("[Q][POSTED]" + a.stream.update[0].updateId + "(" + i.hash + ")");
    });
  }, 1200000);

}).call(this);
