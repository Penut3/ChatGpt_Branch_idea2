using Application.Interfaces.Services;
using OpenAI.Chat;
using System.Runtime.CompilerServices;
using static Application.Interfaces.Services.IAiChatService;

public class AiChatService : IAiChatService
{
    private readonly ChatClient _client;

    public AiChatService(ChatClient client)
    {
        _client = client;
    }

    public async IAsyncEnumerable<string> GetReplyAsync(
    List<AiMessage> messages,
    [EnumeratorCancellation] CancellationToken ct = default)
    {
        // 1. Map your messages to the SDK's ChatMessage type
        List<ChatMessage> openAiMessages = messages.Select(msg => msg.Role switch
        {
            AiMessageRole.System => (ChatMessage)new SystemChatMessage(msg.Content),
            AiMessageRole.Assistant => new AssistantChatMessage(msg.Content),
            _ => new UserChatMessage(msg.Content)
        }).ToList();

        
        var stream = _client.CompleteChatStreamingAsync(openAiMessages, cancellationToken: ct);

        await foreach (var update in stream)
        {
            foreach (var part in update.ContentUpdate)
            {
                if (!string.IsNullOrEmpty(part.Text))
                {
                    yield return part.Text;
                }
            }
        }
    }
}
