using MathMate.Models;
using Xamarin.Forms.Xaml;

namespace MathMate.Services
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public static class UserManager
    {
        public static User User { get; set; }
    }
}
