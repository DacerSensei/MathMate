using Firebase.Auth;
using Firebase.Auth.Providers;
using Firebase.Database;
using System.Threading.Tasks;

namespace MathMate.Config
{
    public static class Database
    {
        private static readonly string AuthenticationFirebase = "Qv2VwbHV1co7hSYw1rq8HS8TSWjJxj4fwKDmF9gm";
        private static readonly string WebAPI = "AIzaSyAnvTDqXibrOtkqxkUpF3ibC-tsffg2dFQ";
        private static readonly string AuthDomain = "mathmate-ee4f2.firebaseapp.com";
        private static readonly string DatabaseURL = "https://mathmate-ee4f2-default-rtdb.asia-southeast1.firebasedatabase.app/";

        private static FirebaseAuthConfig FirebaseConfig = new FirebaseAuthConfig()
        {
            ApiKey = WebAPI,
            AuthDomain = AuthDomain,
            Providers = new FirebaseAuthProvider[]
            {
                new GoogleProvider().AddScopes("email"),
                new FacebookProvider().AddScopes("email"),
                new EmailProvider()
            }
        };
        public static FirebaseClient FirebaseClient = new FirebaseClient(DatabaseURL, new FirebaseOptions { AuthTokenAsyncFactory = () => Task.FromResult(AuthenticationFirebase) });


        public static FirebaseAuthClient FirebaseAuthClient = new FirebaseAuthClient(FirebaseConfig);

    }
}
