using Application.Interfaces.Services;
using OpenAI.Chat;

public class AiChatService : IAiChatService
{
    private readonly ChatClient _client;

    public AiChatService(ChatClient client)
    {
        _client = client;
    }

    public async Task<string> GetReplyAsync(string prompt)
    {
        var messages = new List<ChatMessage>
        {
            new UserChatMessage(prompt)
        };

        var result = await _client.CompleteChatAsync(messages);
        var reply = result.Value.Content[0].Text;
        return reply;
    }
}
