var elq = require('eloqua-request'),
	prompt = require('prompt'),
	user = require('./helpers/user'),
	tidy = require('htmltidy').tidy,
	fs = require('fs'),
	async = require('async'),
	build = require('./helpers/build');

var schema = {
	properties: {
		instance: {
			pattern: /checkpoint|onesource/,
			message: 'Must be "checkpoint" or "onesource"',
			required: true,
			description: 'Eloqua instance'.magenta
		},
		formId: {
			pattern: /[1-9][0-9]*/,
			message: 'Form ID must be a number',
			require: true,
			description: 'Form ID number'.magenta
		},
		ajax: {
			pattern: /y|n/,
			default: 'n',
			message: 'Please enter y or n',
			require: false,
			description: 'AJAX form? (y/n)'.magenta
		}
	}
};

var config = {},
	siteCredentials = {};

prompt.message = 'Form Generator'.green;
prompt.start();

prompt.get(schema, function(err, result) {
	if (err) {throw err;}

	if (result.instance === 'checkpoint') {
		// Info redacted
		config.id = 'Checkpoint ID';
		config.site = 'Site ID';
		config.form = result.formId;
		config.ajax = result.ajax;
		siteCredentials.username = user.checkpoint.username;
		siteCredentials.password = user.checkpoint.password;
	} else if (result.instance === 'onesource') {
		// Info redacted
		config.id = 'ONESOURCE ID';
		config.site = 'Site ID';
		config.form = result.formId;
		config.ajax = result.ajax;
		siteCredentials.username = user.onesource.username;
		siteCredentials.password = user.onesource.password;
	}

	var eloqua = new elq(config.site, siteCredentials.username, siteCredentials.password);

	async.series([
		function(next) {
			var results = {
				config: config,
				initial: '',
				optionListIds: [],
				optionListResult: []
			};
			eloqua.get('/API/REST/2.0/assets/form/' + config.form + '?depth=complete', function(err, res) {
				if (err) { next(err, null); }
				
				results.initial = res;
				
				for (var i = 0; i < res.elements.length; i++) {
					var element = res.elements[i];
					if (element.displayType === 'singleSelect' || element.displayType === 'checkbox' || element.displayType === 'radio') {
						results.optionListIds.push({
							type: element.displayType,
							id: element.optionListId,
							name: element.htmlName
						});
					}
				}
				next(null, results);
			});
		},
		function(next) {
			next(null, null);
		}
	], function(err, results) {
		async.each(results[0].optionListIds, function(content, callback) {
			async.series([
				function(next) {
					eloqua.get('/API/REST/2.0/assets/optionList/' + content.id + '?depth=complete', function(err, res) {
						if (err) { next(err, null); }

						var output = '';

						if (content.type === 'singleSelect') {
							for (var i = 0; i < res.elements.length; i++) {
								var element = res.elements[i];
								if (element.value === undefined) {
									output += '<option value="" selected="selected">' + element.displayName + '</option>';
								} else {
									output += '<option value="' + element.value + '">' + element.displayName + '</option>';
								}
							}
						} else if (content.type === 'checkbox') {
							for (var i = 0; i < res.elements.length; i++) {
								var element = res.elements[i];
								output += '<label for="checkbox' + (i+1) + '">';
								output += '<input id="checkbox' + (i+1) + '" name="' + content.name + '" type="checkbox" value="' + element.value + '">' + element.displayName + '</label>';
							}
						} else if (content.type === 'radio') {
							for (var i = 0; i < res.elements.length; i++) {
								var element = res.elements[i];
								output += '<label for="radio' + (i+1) + '" class="radioLabel">';
								output += '<input id="radio' + (i+1) + '" name="' + content.name + '" type="radio" value="' + element.value + '">' + element.displayName;
								output += '</label>';
							}
						}

						next(null, {
							name: content.name,
							id: content.id,
							content: output
						});
					});
				}
			], function(err, result) {
				if (err) { throw err; }
				results[0].optionListResult.push(result[0]);
				if (results[0].optionListResult.length === results[0].optionListIds.length) {
					var name = 'output/' + results[0].initial.name + '.html';
					build(results[0], function(err, markup) {
						if (err) {throw err;}

						var opts = {
							'doctype': 'omit',
							'output-html': true,
							'show-body-only': true,
							'indent': true,
							'wrap': 0
						};

						tidy(markup, opts, function(err, contents) {
							fs.writeFile(name, contents, function(err) {
								if (err) {throw err;}

								console.log('File is ready at ' + name);

								prompt.start();

								var show = {
									properties: {
										show: {
											pattern: /y|n/,
											required: false,
											description: 'Show results? (y|n)'.magenta
										}
									}
								};

								prompt.get(show, function(err, result) {
									if (result.show === 'y') {
										console.log(contents);
									}
								});
							});
						});
					});
				}
			});
		});
	});
});