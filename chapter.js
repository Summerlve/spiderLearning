var util = require("util");

function Chapter (name) {
	this.name = name;
	this.sections = [];
}

Chapter.prototype.addSection = function (section) {
	this.sections.push(section);
}

function Section (name, link, content) {
	this.name = name;
	this.link = link;
	this.content = content;
}

Section.prototype.toString = function () {
	return util.format("%s\r\n%s\r\n", this.name, this.content);
}

module.exports.Chapter = Chapter;
module.exports.Section = Section;
