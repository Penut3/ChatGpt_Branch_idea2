using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices.JavaScript;



namespace Domain.Entities
{
    public class User : BaseEntity
    {
        public string Email { get; set; }

    }
}
