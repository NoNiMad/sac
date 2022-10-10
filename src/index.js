const { distance } = require('fastest-levenshtein');

const romanHash = {
	I: 1,
	V: 5,
	X: 10,
	L: 50,
	C: 100,
	D: 500,
	M: 1000,
};
const romanCharacters = Object.keys(romanHash);

function romanToInt(s)
{
	let accumulator = 0;
	for (let i = 0; i < s.length; i++)
	{
		if (s[i] === "I" && s[i + 1] === "V")
		{
			accumulator += 4;
			i++;
		}
		else if (s[i] === "I" && s[i + 1] === "X")
		{
			accumulator += 9;
			i++;
		}
		else if (s[i] === "X" && s[i + 1] === "L")
		{
			accumulator += 40;
			i++;
		}
		else if (s[i] === "X" && s[i + 1] === "C")
		{
			accumulator += 90;
			i++;
		}
		else if (s[i] === "C" && s[i + 1] === "D")
		{
			accumulator += 400;
			i++;
		}
		else if (s[i] === "C" && s[i + 1] === "M")
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

function tokenEqual(valid, input)
{
	//console.log("Check if token match: " + valid.trim() + " =?= " + input.trim());

	if (isRomanNumber(valid))
	{
		// Roman number as int must match exactly input as int
		return isNaN(input) ? valid == input : romanToInt(valid) == parseInt(input, 10);
	}
	if (!isNaN(valid) && !isNaN(input))
	{
		// Numbers must be exactly equal
		return parseInt(valid, 10) == parseInt(input, 10);
	}
	else
	{
		const validToCompare = toAsciiCharSet(valid).toLowerCase().replaceAll(" ", "");
		const inputToCompare = toAsciiCharSet(input).toLowerCase().replaceAll(" ", "");
		const tolerance = Math.floor(valid.length / 5);

		// String tokens should match with a tolerance of 1 mistake every 5 characters
		return distance(validToCompare, inputToCompare) <= tolerance;
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

function doesMatch(valid, input)
{
	//console.log("Checking if propositions match: " + valid + " =?= " + input);

	if (!valid.includes(" ") && tokenEqual(valid, input))
		return true;

	if (valid.includes(":"))
	{
		const splitByColon = valid.split(":");
		for (const part of splitByColon)
		{
			if (doesMatch(part.trim(), input))
			{
				return true;
			}
		}
	}

	const validParts = valid.split(" ");
	const inputParts = input.split(" ");
	if (inputParts.length == validParts.length)
	{
		const allPartsEquals = validParts.every((validPart, index) => {
			return tokenEqual(validPart, inputParts[index])
		});
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
	for (const [abbreviated, original] of Object.entries(options.abbreviations))
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

	const validAnswerList = getOrComputeAnswerList(validAnswer, options);
	for (const va of validAnswerList)
	{
		if (doesMatch(va, answer))
			return true;
	}

	return false;
}

module.exports = {
	check
};