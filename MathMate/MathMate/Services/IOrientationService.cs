using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace MathMate.Services
{
    public interface IOrientationService
    {
        void SetLandscapeOrientation();
        void SetPortraitOrientation();
    }
}
