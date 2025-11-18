using Application.Interfaces.Services;
using OpenAI.Chat;
using static Application.Interfaces.Services.IAiChatService;

public class AiChatService : IAiChatService
{
    private readonly ChatClient _client;

    public AiChatService(ChatClient client)
    {
        _client = client;
    }

    public async Task<string> GetReplyAsync(IReadOnlyList<AiMessage> messages)
    {
        var openAiMessages = new List<ChatMessage>();

        foreach (var msg in messages)
        {
            switch (msg.Role)
            {
                case AiMessageRole.System:
                    openAiMessages.Add(new SystemChatMessage(msg.Content));
                    break;
                case AiMessageRole.Assistant:
                    openAiMessages.Add(new AssistantChatMessage(msg.Content));
                    break;
                case AiMessageRole.User:
                default:
                    openAiMessages.Add(new UserChatMessage(msg.Content));
                    break;
            }
        }

        var result = await _client.CompleteChatAsync(openAiMessages);
        return result.Value.Content[0].Text;
    }
}
