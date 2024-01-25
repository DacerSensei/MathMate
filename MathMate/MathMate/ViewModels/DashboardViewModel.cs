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
            ViewLessonCommand = new AsyncCommand(ViewLessonExecute);
            ViewPerformanceCommand = new AsyncCommand(ViewPerformanceExecute);
        }

        public ICommand ViewFlashCardCommand { get; }

        private async Task ViewFlashCardExecute()
        {
            await Application.Current.MainPage.Navigation.PushModalAsync(new FlashcardPage());
        }

        public ICommand ViewLessonCommand { get; }

        private async Task ViewLessonExecute()
        {
            await Application.Current.MainPage.Navigation.PushModalAsync(new LessonPage());
        }

        public ICommand ViewPerformanceCommand { get; }

        private async Task ViewPerformanceExecute()
        {
            await Application.Current.MainPage.Navigation.PushModalAsync(new PerformancePage());
        }
    }
}
