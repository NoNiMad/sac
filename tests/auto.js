const assert = require("node:assert");
const sac = require("../src/index.js");

function check(valid, input, options)
{
	if (sac.check(valid, input, options))
	{
		console.log("=> OK");
	}
	else
	{
		console.log("==> ERROR");
		process.exit();
	}
}

function testSimpleAnswer(testName, valid, input)
{
	console.log(`${testName}: "${valid}" <=> "${input}"`);
	check(valid, input);
}

function testWithAbbreviations(testName, valid, input, abbreviations)
{
	const abbreviationsStr = Object
		.keys(abbreviations)
		.map(key => `${key} = ${abbreviations[key]}`)
		.join(", ");
	console.log(`${testName}: "${valid}" <=> "${input}" (${abbreviationsStr})`);
	
	check(valid, input, { abbreviations });
}

function testTolerance(testName, valid, input, tolerance)
{
	console.log(`${testName}: "${valid}" <=> "${input}" (Tolerance ${tolerance})`);
	check(valid, input, { tolerance });
}

function testOptions(testName, valid, input, options)
{
	console.log(options);
	console.log(`${testName}: "${valid}" <=> "${input}" (Tolerance ${tolerance})`);
	check(valid, input, options);
}

const mortalKombat = "Mortal Kombat X";
const acIV = "Assassin's Creed IV: Black Flag";
const acAbbreviation = { "Assassin's Creed": "AC" };

console.log("-- Basics --\n");

testSimpleAnswer("Exact match", mortalKombat, "Mortal Kombat X");
testSimpleAnswer("Roman number with digits", mortalKombat, "Mortal Kombat 10");
testSimpleAnswer("Different cases roman number", mortalKombat, "Mortal Kombat x");
testSimpleAnswer("Different cases string token", mortalKombat, "Mortal kombat X");
testSimpleAnswer("Spaces around", mortalKombat, "  Mortal Kombat X ");
testSimpleAnswer("Spaces in the middle", mortalKombat, "Mortal   Kombat X");

console.log("\n-- Abbreviations --\n");

testWithAbbreviations("Abbreviations", "Assassin's Creed II", "AC II", acAbbreviation);
testWithAbbreviations("Variants", "Assassin's Creed II", "ac ii", acAbbreviation);
testWithAbbreviations("Variants", "Assassin's Creed II", "aC 2", acAbbreviation);

console.log("\n-- Separator --\n");

testWithAbbreviations("Separator first part", acIV, "Asassin's Creed IV", acAbbreviation);
testWithAbbreviations("Separator abbreviated first part", acIV, "AC IV", acAbbreviation);
testWithAbbreviations("Separator second part", acIV, "Black Flag", acAbbreviation);
testWithAbbreviations("Separator whole text abbreviated", acIV, "AC 4 Black Flag", acAbbreviation);

console.log("\n-- Tolerance --\n");

testSimpleAnswer("Default tolerance (5), one mistake, single token", "Token", "Toen");
testTolerance("Custom tolerance, three mistakes, single token", "TolEraNce", "ToErNc", 3);
testSimpleAnswer("Default tolerance, one mistake for each token", "Token Token Token", "Toke tken oken");

console.log("\n-- Everything --\n");

testWithAbbreviations("Separator + Mistake + Abbreviation", acIV, "AC IV: Blak Flag", acAbbreviation);