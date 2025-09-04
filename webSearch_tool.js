import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

async function main() {
  const messages = [
    {
      role: "system",
      content: `You are a smart assitant who answers the asked questions.
                You have access to following tools :
                1. webSearch({query}) // search the latest and realtime data on the internet
      `,
    },
    {
      role: "user",
      content: "When was Iphone 16 launched ? ",
    },
  ];
  const completions = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: messages,
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description: "Search the latest and realtime data on the internet.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform search on.",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  // console.log(completions.choices[0].message);

  // Note : When a tool is called we do not get content in message, be get tool_calls. Meaning if tool_calls is not present , then we have final answer from the LLM.

  // console.log(JSON.stringify(completions.choices[0].message, null, 2));

  //LLM does not excecutes, it returns us a message, telling which tool we have to excecute programitaclly. And then we send the output of that tool to LLm, then at last LLM sends us the final output.

  //we will check if any tool is called

  const toolCalls = completions.choices[0].message.tool_calls;
  if (!toolCalls) {
    // this means we have our final answer from LLM
    console.log(`Assitant : ${completions.choices[0].message.content}`);
    return;
  }

  // if excecution comes here that means, any tool is been called. As tool_calls is an array, we have to loop over each, exceute the tool, and again send it's output to LLM as role = "tool".

  for (const tool of toolCalls) {
    // console.log(`tool : ${tool}`);
    const functionName = tool.function.name;
    const functionParams = tool.function.arguments;

    if (functionName == "webSearch") {
      const toolResponse = await webSearch(JSON.parse(functionParams));
      console.log(`Tool Response : ${toolResponse}`);
    }
  }
}

async function webSearch() {
  // here we will be using Tavily to search for query on internet

  return "It was launched in 2024, September.";
}

main();
