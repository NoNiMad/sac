const readline = require("readline");
const sac = require("../src/index.js");

const validAnswers = [
	"Dark Souls II",
	"The Elder Scrolls V: Skyrim",
	"Sid Meier's Civilization VI",
	"Civilization VI",
	"Borderlands 3",
	"H1Z1: King of the Kill",
	"Pretty Girls Mahjong Solitaire",
	"Assassin's Creed Origins",
	"Lego Star Wars : La Saga Skywalker",
	"Death Stranding",
	"Mortal Kombat X"
];
const abbreviations = {
	"Assassin's Creed": "AC",
	"The Elder Scrolls": "TES",
	"Civilization": "Civ"
};

async function main()
{
	console.log("Press Ctrl+C to exit.");

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	rl.on("close", function () {
		process.exit(0);
	});

	while (true)
	{
		const res = await askForAnswer();
		if (res !== null)
		{
			console.log("Matched with: " + res);
		}
		else
		{
			console.log("No match found.");
		}
	}

	function askForAnswer()
	{
		return new Promise(resolve => {
			rl.question("Enter an answer: ", function (answer) {
				resolve(matchAnswer(answer));
			});
		});
	}

	function matchAnswer(answer)
	{
		for (const validAnswer of validAnswers)
		{
			if (sac.check(validAnswer, answer, { abbreviations }))
				return validAnswer;
		}

		return null;
	}
}

main().catch(console.error);