using MathMate.Views;
using System;
using Xamarin.Forms;
using Xamarin.Forms.PlatformConfiguration.AndroidSpecific;
using Xamarin.Forms.Xaml;
using Application = Xamarin.Forms.Application;

[assembly: ExportFont("Poppins-Regular.ttf", Alias = "PoppinsRegular"), ExportFont("Poppins-Bold.ttf", Alias = "PoppinsBold")]
namespace MathMate
{
    public partial class App : Application
    {
        public App()
        {
            App.Current.On<Xamarin.Forms.PlatformConfiguration.Android>().UseWindowSoftInputModeAdjust(WindowSoftInputModeAdjust.Resize);
            InitializeComponent();
            DependencyService.Get<IEnvironment>().SetStatusBarColor(Color.FromHex("#85182a"), false);
            MainPage = new NavigationPage(new Login());
        }

        protected override void OnStart()
        {
        }

        protected override void OnSleep()
        {
        }

        protected override void OnResume()
        {
        }
    }
}
