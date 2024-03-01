using MathMate.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MathMate.Views
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class TakeFlashCard : ContentPage
	{
		public TakeFlashCard ()
		{
			InitializeComponent ();
		}

        protected override void OnAppearing()
        {
            base.OnAppearing();
            DependencyService.Get<IOrientationService>().SetLandscapeOrientation();
        }

        protected override void OnDisappearing()
        {
            base.OnDisappearing();
            DependencyService.Get<IOrientationService>().SetPortraitOrientation();
        }
    }
}