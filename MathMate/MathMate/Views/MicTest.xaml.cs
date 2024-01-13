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
    public partial class MicTest : ContentPage
    {
        public MicTest()
        {
            InitializeComponent();
        }

        private async void Button_Clicked(object sender, EventArgs e)
        {
            var answer = await WaitForSpeechToText();
            if(!string.IsNullOrEmpty(answer))
            {
                System.Diagnostics.Debug.WriteLine(answer);
            }
        }

        async Task<string> WaitForSpeechToText()
        {
            return await DependencyService.Get<Services.ISpeechToText>().SpeechToTextAsync();
        }
    }
}