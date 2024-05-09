using Android.Content.PM;
using MathMate.Droid;
using Xamarin.Forms;
using MathMate.Services;
using Android.Media;
using Android.Content.Res;
using System.Threading.Tasks;
using Android.Content;
using Xamarin.Forms.Platform.Android;
using System.Diagnostics;

[assembly: Dependency(typeof(AudioPlayer))]
namespace MathMate.Droid
{
    public class AudioPlayer : IAudioPlayer
    {
        private MediaPlayer mediaPlayer;

        public void Load(int resourceId)
        {
            Context context = Android.App.Application.Context;
            mediaPlayer= MediaPlayer.Create(context, resourceId); 
            mediaPlayer.SetVolume((float)Volume.Max, (float)Volume.Max);
        }

        public void Play()
        {
            if (mediaPlayer == null)
            {
                return;
            }
            if (mediaPlayer.IsPlaying)
            {
                mediaPlayer.Stop();
            }
            mediaPlayer.Start();

        }

        public void Stop()
        {
            if (mediaPlayer != null && mediaPlayer.IsPlaying)
            {
                mediaPlayer.Stop();
                mediaPlayer.Release();
                mediaPlayer = null;
            }
        }
    }
}