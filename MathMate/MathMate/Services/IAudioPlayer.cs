using System;
using System.Collections.Generic;
using System.Text;

namespace MathMate.Services
{
    public interface IAudioPlayer
    {
        void Load(int resourceId);
        void Play();
        void Stop();
    }
}
