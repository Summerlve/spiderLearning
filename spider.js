var Chapter = require("./chapter").Chapter;
var Section = require("./chapter").Section;
var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");
var iconv = require("iconv-lite");
var async = require("async");
var exec = require("child_process").exec;

var filepath = __dirname + "/藏海花.txt"; 
var URL = "http://www.zanghaihua.org/";

async.waterfall([
	function (cb) {
		fs.exists(filepath, function (isExists) {
			// console.log(filepath, isExists);
			return cb(null, isExists);
		});
	},
	function (isExists, cb) {
		if (!isExists) return cb(null);
		exec("rm " + filepath, function(err) {
			if (err) console.error(err);
			else return cb(null);
		});
	},
	function (cb) {
		exec("touch " + filepath, function (err) {
			if (err) console.error(err);
			else return cb(null);
		});
	},
	function (cb) {
		// get book;
		var book = [];
		request({
			method: "GET",
			url: URL,
			gzip: false,
			encoding: null
		}, function (err, res, body) {
			body = iconv.decode(body, "utf-8");
			var $ = cheerio.load(body);
			var v = $("span.v");	
			
			for (var i = 0; i < v.length; i++) {
				var cur = v.eq(i);
				var cname = cur.text().trim();
				var chapter = new Chapter(cname);
				book.push(chapter);
				
				var item = cur.next("span").not(".v");
				while (item.length) {
					var sname = item.find("a").text().trim();
					var slink = item.find("a").attr("href");
					var section = new Section(sname, slink, null);
					chapter.addSection(section);
					item = item.next("span").not(".v");
				}
			}
			
			return cb(null, book);
		});
	},
	function (book, cb) {
		// get content
		async.eachLimit(book, 1, function (chapter, cb_) {
			async.waterfall([
				function (cb__) {
					fs.appendFile(filepath, chapter.name + "\r\n", function (err) {
						if (err) console.error(err);
						return cb__(null);
					});
				}, 
				function (cb__) {
					async.eachLimit(chapter.sections, 1, function (section, cb___) {
						request({
							method: "GET",
							url: section.link,
							gzip: false,
							encoding: null
						}, function (err, res, body) {
							body = iconv.decode(body, "utf-8");
							var $ = cheerio.load(body);
							section.content = $("#BookText").text();
							fs.appendFile(filepath, section.toString(), function (err) {
								if (err) console.error(err);
								return cb___();
							});
						});
					}, function (err) {
						if (err) console.error(err);
						return cb__();
					});
				}
			], function (err) {
				if (err) console.error(err);
				return cb_();
			});
		}, function (err) {
			if (err) console.error(err);
			return cb(null);
		});
	}
], function (err) {
	if (err) console.error(err);
	else console.log("chh was finished");
});

