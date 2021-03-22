import {AsYouType, parsePhoneNumberFromString} from "libphonenumber-js";

UTILS.strings = {
    sanitizeUrl(string = '') {
        return UTILS.strings.sanitize(string, {
            urlSanitize: true,
            escapeHTMLEntities: false,
            removePerimSpaces: true,
        });
    },

    sanitizeName(string = '') {
        return UTILS.strings.sanitize(string, {
            removePerimSpaces: true,
            textCase: 'capitalizeEachWord',
            maxChars: UTILS.limits.name.max,
        });
    },

    sanitizeEmail(string = '') {
        return UTILS.strings.sanitize(string, {
            removePerimSpaces: true,
            textCase: 'default',
            maxChars: UTILS.limits.email.max,
            escapeHTMLEntities: true,
        });
    },

    sanitize(string = '', {removePerimSpaces = true, textCase = 'default', maxChars, removeNonNumbers = false, escapeHTMLEntities = true, urlSanitize = false, replaceNonWords = false}) {
        string = typeof string === 'string' ? string : '';

        // Parsing
        if (escapeHTMLEntities)
            string = UTILS.strings.escapeHTMLEntities(string);

        // Size Reducing
        if (removePerimSpaces)
            string = UTILS.strings.removePerimiterSpaces(string);

        if (removeNonNumbers)
            string = UTILS.strings.removeNonNumbers(string);

        if (replaceNonWords)
            string = UTILS.strings.replaceNonWords(string);

        // Transformation
        if (textCase === 'capitalizeEachWord')
            string = UTILS.strings.capitalize(string, true);

        else if (textCase === 'capitalize')
            string = UTILS.strings.capitalize(string, false);

        else if (textCase === 'lowercase')
            string = string.toLowerCase();

        // URL
        else if (textCase === 'uppercase')
            string = string.toUpperCase();

        // Size Sensitive
        if (urlSanitize)
            string = UTILS.strings.url(string);

        if (maxChars)
            string.substr(0, maxChars);

        return string;
    },

    escapeHTMLEntities(string = '') {
        return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    removePerimiterSpaces(string = '') {
        return string.replace(/(^\s*|\s*$)/ig, '');
    },

    capitalize(string = '', eachWord = false) {
        if (eachWord)
            string = string.toLowerCase();

        const regex = new RegExp('(^|-|\\s)\\w', eachWord ? 'gm' : 'm');

        return string.replace(regex, l => l.toUpperCase());
    },

    url(string) {
        if(string.indexOf(`http://`) !== 0 && string.indexOf(`https://`) !== 0)
            string = `https://${string}`;

        return string.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;()]/gi, "");
    },

    replaceNonWords(string) {
        return string.replace(/[\s\\+\\*&@#/%?=~_|!:.;\\(\\)]/ig, '-');
    },

    convertTitleToHandle(titleString = '') {
        // Remove non-words at beginning and end of string
        titleString = titleString.replace(/(^\W+|\W+$)/g, '');

        // Replace internal non-words with hyphens tags
        titleString = titleString.replace(/\W+/g, '-');

        // Make lowercase
        return titleString.toLowerCase();
    },

    createSearchRegex(string, subtractive = true) {
        if(!string)
            return string;

        const regChar = subtractive ? '+.*' : '|';

        const queryArray = [...string.split(/\W/)]
            .filter(word => !!word)
            .map(word => `(${word})${regChar}`);

        let pattern = `.*${queryArray.join('')}`;

        if(!subtractive) {
            const lastCharIndex  = pattern.length -1;

            if(pattern[lastCharIndex] === '|')
                pattern = pattern.substring(0, lastCharIndex);

            pattern = `${pattern}+.*`;
        }

        return new RegExp(pattern, 'igm');
    },

    removeHttpsAndWWW(string) {
		const httpsRegex = new RegExp('https?:\/\/');
		const wwwRegex = new RegExp('www\.');

		const noHttp = string.replace(httpsRegex, '');

		return noHttp.replace(wwwRegex, '');
    },

    fileEncode(string = '') {
        return string.replace(/[^a-zA-Z0-9:]*/gi, '');
    },

    formatAsYouType(phoneNumber = '') {
        const asYouType = new AsYouType('US');

        return asYouType.input(phoneNumber);
    },

    isPhoneValid(phoneString) {
        const phoneNumber = UTILS.strings.formatMobileNumber(phoneString, 'US');

        if(phoneNumber)
            return phoneNumber.isValid();
    },

    parseNationalPhoneString(phoneNumberString) {
        if(!phoneNumberString)
            return false;

        const formattedNumber = UTILS.strings.formatMobileNumber(phoneNumberString);

        return formattedNumber && formattedNumber.isValid() ? formattedNumber.nationalNumber : undefined;
    },

    formatMobileNumber(phoneNumberString) {

        return parsePhoneNumberFromString(phoneNumberString, 'US');
    },
};