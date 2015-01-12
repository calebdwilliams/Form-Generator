module.exports = function(data, callback) {
	var elements = data.initial.elements,
		formName = data.initial.name,
		optList = data.optionListResult,
		instance = data.config.id,
		output = '';

	output += '<form method="post" name="' + formName + '" action="https://s' + instance + '.t.eloqua.com/e/f2" id="' + data.initial.id + '" class="ws-validate inline-elements';

	if (data.config.ajax === 'y') {
		output += ' ajax-form';
	}

	output += '">';

	output += '<input value="' + formName + '" type="hidden" name="elqFormName">';
	output += '<input value="' + instance + '" type="hidden" name="elqSiteId">';
	output += '<input name="elqCampaignId" type="hidden">';

	for (var i = 0; i < elements.length; i++) {
		var required = false,
			element = elements[i];

		if (element.validations.length) {
			required = true;
		}

		if (element.displayType === 'text') {

			output += '<div id="formElement' + (i+1) + '">';
			output += '<label for="' + element.htmlName + '"><strong>' + element.name + '</strong>';
			if (required) {
				output += ' <span class="requiredField" aria-label="Required Field">*</span>';
			}
			output += '</label>';
			output += '<input type="';
			if (element.htmlName === 'emailAddress') {
				output += 'email';
			} else {
				output += 'text';
			}
			output += '" id="' + element.htmlName + '" name="' + element.htmlName + '"';
			if (required) {
				output += ' required="required"';
			}
			output += '>';
			output += '</div>';
		} else if (element.displayType === 'singleSelect') {
			// loop through optsList and see if it is set yet
			for (var c = 0; c < optList.length; c++) {
				if (element.optionListId == optList[c].id) {
					var opts = optList[c].content;
				}
			}

			output += '<div id="formElement' + (i+1) + '">';
			output += '<label for="' + element.htmlName + '"><strong>' + element.name + '</strong>';

			if (required) {
				output += ' <span class="requiredField" aria-label="Required Field">*</span>'
			}

			output += '</label>';
			output += '<select id="' + element.htmlName + '" name="' + element.htmlName + '"';

			if (required) {
				output += ' required="required" data-errormessage="Please select an item"';
			}

			output += '>';
			output += opts;
			output += '</select>';
			output += '</div>';
		} else if (element.displayType === 'checkbox') {
			for (var c = 0; c < optList.length; c++) {
				if (element.optionListId == optList[c].id) {
					var opts = optList[c].content;
				}
			}

			output += '<div id="formElement' + (i+1) + '">';
			output += '<div class="checkboxContainer">';
			output += '<label for="' + element.htmlName + '" class="checkboxLabel"><strong>' + element.name + '</strong></label>';

			output += '<div class="checkboxes">';

			output += opts;

			output += '</div>';
			output += '</div>';
			output += '</div>';
		} else if (element.displayType === 'submit') {
			output += '<div id="formElement' + (i+1) + '">';
			output += '<input type="submit" value="Submit" class="btn btn-warning" style="margin-left: 68.5%">';
			output += '</div>';
		} else if (element.displayType === 'hidden') {
			output += '<input type="hidden" name="' + element.htmlName + '" id="' + element.htmlName + '" value="' + element.defaultValue + '">';
		} else if (element.displayType === 'textArea') {
			output += '<div id="formElement' + (i+1) + '">';
			output += '<label for="' + element.htmlName + '">' + element.name;
			if (required) {
				output += ' <span class="requiredField" aria-label="Required Field">*</span>';
			}
			output += '</label>';
			output += '<textarea name="' + element.htmlName + '" id="' + element.htmlName + '"';
			if (required) {
				output += ' required="required"';
			}
			output += '">';
			output += '</textarea>';
			output += '</div>';
		} else if (element.displayType === 'radio') {
			for (var c = 0; c < optList.length; c++) {
				if (element.htmlName == optList[c].name) {
					var opts = optList[c].content;
				}
			}

			output += '<div id="formElement' + (i+1) + '">';
			output += '<label for="' + element.htmlName + '" class="radioLabel"><strong>' + element.name + '</strong>';
			if (required) {
				output += ' <span class="requiredField" aria-label="Required Field">*</span>';
			}
			output += '</label>';
			output += '<div class="radioContainer">';
			output += opts;
			output += '</div>';
			output += '</div>';
		}
	}
	output += '</form>';
	if (data.config.ajax === 'y') {
		output += '<div class="success-content" style="display: none" aria-live="assertive"><!-- SUCCESS CONTENT HERE --></div>';
	}

	callback(null, output);
}