using MathMate.Views;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class DashboardViewModel : ObservableObject
    {
        public DashboardViewModel()
        {
            ViewFlashCardCommand = new AsyncCommand(ViewFlashCardExecute);
        }

        public ICommand ViewFlashCardCommand { get; }

        private async Task ViewFlashCardExecute()
        {
            await Application.Current.MainPage.Navigation.PushAsync(new FlashCardQuiz());
        }
    }
}
