var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var request = require('request');
var URL = require('url-parse');
var fs = require('fs');
var async = require('async');
var path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
  var pageToVisit = 'https://www.medium.com';
  request(pageToVisit, function (error, response, body) {
    if (error) {
      console.log(error);
    }
    if (response.statusCode === 200) {
      var $ = cheerio.load(body);
      collectInternalLinks($);
    }
  });
  function collectInternalLinks($) {
    var absoluteLinks = $("a[href^='http']");
    async.each(absoluteLinks, function (link, callback) {
      fs.stat(path.resolve('output.txt'), function (err, stats) {
        if (err) {
          console.log(err);
        }
        fs.writeFile(path.resolve('output.txt'), `${link.attribs.href}\n`, { 'flag': 'a' }, function (err) {
          if (err) {
            console.log(err);
          }
          request(link.attribs.href, function (error, response, body) {
            if (error) {
              console.log(error);
            }
            if (response && response.statusCode === 200) {
              var $ = cheerio.load(body);
              collectInternalLinks($);
              callback();
            } else {
              callback();
            }
          });
        });
      });
    }, function (err) {
      if (err) {
        console.log(err);
      }
      console.log('Done!!!');
    });
  }
});

module.exports = router;
