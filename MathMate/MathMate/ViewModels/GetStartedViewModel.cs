using MathMate.Views;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class GetStartedViewModel : ObservableObject
    {
        public GetStartedViewModel()
        {
            LoginCommand = new AsyncCommand(LoginExecute);
        }

        public ICommand LoginCommand { get; }
        private async Task LoginExecute()
        {
            await Application.Current.MainPage.Navigation.PushAsync(new Login());
        }
    }
}
