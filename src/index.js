const { distance } = require("fastest-levenshtein");

const romanHash = {
	i: 1,
	v: 5,
	x: 10,
	l: 50,
	c: 100,
	d: 500,
	m: 1000,
};
const romanCharacters = Object.keys(romanHash);

function romanToInt(s)
{
	s = s.toLowerCase();

	let accumulator = 0;
	for (let i = 0; i < s.length; i++)
	{
		if (s[i] === "i" && s[i + 1] === "v")
		{
			accumulator += 4;
			i++;
		}
		else if (s[i] === "i" && s[i + 1] === "x")
		{
			accumulator += 9;
			i++;
		}
		else if (s[i] === "x" && s[i + 1] === "l")
		{
			accumulator += 40;
			i++;
		}
		else if (s[i] === "x" && s[i + 1] === "c")
		{
			accumulator += 90;
			i++;
		}
		else if (s[i] === "c" && s[i + 1] === "d")
		{
			accumulator += 400;
			i++;
		}
		else if (s[i] === "c" && s[i + 1] === "m")
		{
			accumulator += 900;
			i++;
		}
		else
		{
			accumulator += romanHash[s[i]];
		}
	}
	return accumulator;
}

function isRomanNumber(str)
{
	return [...str].every(c => romanCharacters.includes(c));
}

function isLetterOrDigit(char)
{
	return char >= 'a' && char <= 'z'
		|| char >= 'A' && char <= 'Z'
		|| char >= '0' && char <= '9';
}

function tokenEqual(valid, input, tolerance)
{
	const cleanValid = toAsciiCharSet(valid.trim()).toLowerCase();
	const cleanInput = toAsciiCharSet(input.trim()).toLowerCase();
	
	//console.log(`Check if token match: "${cleanValid}" =?= "${cleanInput}" (originally "${valid}" and "${input}")`);

	if (isRomanNumber(cleanValid))
	{
		// Roman number as int must match exactly input as int
		return isNaN(input) ? cleanValid == cleanInput : romanToInt(cleanValid) == parseInt(cleanInput, 10);
	}
	if (!isNaN(cleanValid) && !isNaN(cleanInput))
	{
		// Numbers must be exactly equal
		return parseInt(cleanValid, 10) == parseInt(cleanInput, 10);
	}
	else
	{
		const validToCompare = cleanValid.replaceAll(" ", "");
		const inputToCompare = cleanInput.replaceAll(" ", "");
		const allowedErrors = Math.floor(cleanValid.length / tolerance);

		// String tokens should match with 1 mistake every <tolerance> characters
		return distance(validToCompare, inputToCompare) <= allowedErrors;
	}
}

function toAsciiCharSet(str, keepSpaces)
{
	// normalize decomposes Unicode characters to their components, like é = e + ̀ 
	// NFKD means we also want to decompose things like œ to o + e
	// filter to only key letters and digits (and spaces if parameter is at true)
	// join characters back into a string
	return [...str.normalize("NFKD")]
		.filter(char => isLetterOrDigit(char) || keepSpaces && char == " ")
		.join("");
}

function doesMatch(valid, input, tolerance)
{
	//console.log(`Checking if propositions matches: ${valid} =?= ${input}`);

	if (!valid.includes(" ") && tokenEqual(valid, input, tolerance))
		return true;

	if (valid.includes(":"))
	{
		const splitByColon = valid.split(":");
		for (const part of splitByColon)
		{
			if (doesMatch(part.trim(), input, tolerance))
			{
				return true;
			}
		}
	}

	const validParts = valid.split(" ").filter(part => part.length > 0);
	const inputParts = input.split(" ").filter(part => part.length > 0);
	if (inputParts.length == validParts.length)
	{
		const allPartsEquals = validParts.every(
			(validPart, index) => tokenEqual(validPart, inputParts[index], tolerance));
		if (allPartsEquals)
			return true;
	}
	else
	{
		// Could be implemented in some way
		// Like checking if token + nexttoken matches what was provided, but not implemented yet
		return false;
	}
	
	return false;
}

const defaultOptions = {
	/** Means that 1 error is tolerated every five characters. */
	tolerance: 5,
	/** An object mapping abbreviated strings to their full counterpart.  */
	abbreviations: {}
};

const answerListCache = {};

function getOrComputeAnswerList(validAnswer, options)
{
	if (answerListCache[validAnswer] != undefined)
		return answerListCache[validAnswer];

	const answerList = [ validAnswer ];
	for (const [original, abbreviated] of Object.entries(options.abbreviations))
	{
		if (validAnswer.includes(original))
		{
			answerList.push(validAnswer.replace(original, abbreviated));
		}
	}
	answerListCache[validAnswer] = answerList;
	return answerList;
}

/**
 * Checks if an answer
 * @param {string} validAnswer 
 * @param {string} answer 
 * @param {object} options 
 */
function check(validAnswer, answer, options)
{
	options = Object.assign({}, defaultOptions, options);
	answer = answer.trim();

	const validAnswerList = getOrComputeAnswerList(validAnswer, options);	
	for (const va of validAnswerList)
	{
		if (doesMatch(va, answer, options.tolerance))
			return true;
	}

	return false;
}

module.exports = {
	check
};