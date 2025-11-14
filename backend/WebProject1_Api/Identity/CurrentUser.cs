//using Application.Interfaces.Services;
//using Microsoft.AspNetCore.Http;
//using System.Security.Claims;

//namespace Presentation.Identity
//{
//    public sealed class CurrentUser : ICurrentUser
//    {
//        private readonly IHttpContextAccessor _http;

//        public CurrentUser(IHttpContextAccessor http) => _http = http;

//        public bool IsAuthenticated =>
//            _http.HttpContext?.User?.Identity?.IsAuthenticated == true;

//        public string? SupabaseId
//        {
//            get
//            {
//                var p = _http.HttpContext?.User;
//                if (p?.Identity?.IsAuthenticated != true) return null;

//                // OIDC "sub" first, then NameIdentifier
//                return p.FindFirst("sub")?.Value
//                    ?? p.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//            }
//        }

//        public Guid? UserId
//        {
//            get
//            {
//                var p = _http.HttpContext?.User;
//                if (p?.Identity?.IsAuthenticated != true) return null;

//                // Read the claim you stamped from app_metadata (e.g., "dbUserId")
//                var s = p.FindFirst("dbUserId")?.Value;
//                if (Guid.TryParse(s, out var id)) return id;

//                // Optional: fallback ONLY if you know NameIdentifier contains your Guid
//                s = p.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//                return Guid.TryParse(s, out id) ? id : null;
//            }
//        }
//    }
//}
