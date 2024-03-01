using System.Threading.Tasks;
using Android.Content.PM;
using MathMate;
using MathMate.Droid;
using Xamarin.Forms;
using MathMate.Services;

[assembly: Dependency(typeof(OrientationService))]
namespace MathMate.Droid
{
    public class OrientationService : IOrientationService
    {
        public void SetLandscapeOrientation()
        {
            var activity = Xamarin.Essentials.Platform.CurrentActivity;
            activity.RequestedOrientation = ScreenOrientation.Landscape;
        }

        public void SetPortraitOrientation()
        {
            var activity = Xamarin.Essentials.Platform.CurrentActivity;
            activity.RequestedOrientation = ScreenOrientation.Portrait;
        }
    }
}