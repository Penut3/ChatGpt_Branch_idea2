using Microsoft.AspNetCore.Mvc;
using OpenAI;
using OpenAI.Chat;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly ChatClient _chat;

    public ChatController(OpenAIClient openAi)
    {
        // here we pick our model; e.g. "gpt-3.5-turbo" or "gpt-4o"
        _chat = openAi.GetChatClient("gpt-3.5-turbo");
    }

    public class ChatRequest
    {
        public string Prompt { get; set; }
    }

    public class ChatResponse
    {
        public string Reply { get; set; }
    }

    [HttpPost]
    public async Task<ActionResult<ChatResponse>> Post([FromBody] ChatRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Prompt))
            return BadRequest("Prompt must not be empty.");

        // send the user prompt and await the completion
        ChatCompletion completion = await _chat.CompleteChatAsync(req.Prompt);
        string reply = completion.Content[0].Text.Trim();

        return Ok(new ChatResponse { Reply = reply });
    }
}
