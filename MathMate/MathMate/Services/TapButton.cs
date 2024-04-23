using Newtonsoft.Json.Bson;
using System;
using System.Collections.Generic;
using System.Text;
using Xamarin.Forms;

namespace MathMate.Services
{
    public static class TapButton
    {
        private enum SoundID{
            TapSound = 2131165369,
            Congratulation = 2131165300
        }

        public static void TapSound()
        {
            DependencyService.Get<IAudioPlayer>().Load((int)SoundID.TapSound);
            DependencyService.Get<IAudioPlayer>().Play();
        }

        public static void CongratulationSound()
        {
            DependencyService.Get<IAudioPlayer>().Load((int)SoundID.Congratulation);
            DependencyService.Get<IAudioPlayer>().Play();
        }
    }

}
