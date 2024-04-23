using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class FlashcardScoreViewModel : ObservableObject
    {
        
        public FlashcardScoreViewModel(int finalScore, int overall, DateTime dateTime)
        {
            BackCommand = new Command(BackExecute);
            this.finalScore = finalScore;
            overallScore = overall;
            dateFinish = dateTime.ToShortDateString();
            timeFinish = dateTime.ToShortTimeString();
        }

        public ICommand BackCommand { get; set; }
        private async void BackExecute()
        {
            await Application.Current.MainPage.Navigation.PopModalAsync(); 
        }

        private string dateFinish;

        public string DateFinish
        {
            get => dateFinish;
            set
            {
                SetProperty(ref dateFinish, value);
            }
        }

        private string timeFinish;

        public string TimeFinish
        {
            get => timeFinish;
            set
            {
                SetProperty(ref timeFinish, value);
            }
        }

        private int overallScore;

        public int OverallScore
        {
            get => overallScore;
            set
            {
                SetProperty(ref overallScore, value);
            }
        }

        private int finalScore;

        public int FinalScore
        {
            get => finalScore;
            set
            {
                SetProperty(ref finalScore, value);
                OnPropertyChanged(nameof(FinalScorePercent));
                OnPropertyChanged(nameof(FinalScoreColor));
            }
        }

        public int FinalScorePercent
        {
            get
            {
                double result = (double)FinalScore / OverallScore * 100;
                return (int)Math.Round(result);
            }
        }

        public string FinalScoreColor
        {
            get
            {
                if (FinalScorePercent > 75)
                {
                    return "#32ac71";
                }
                else if (FinalScorePercent > 50)
                {
                    return "#ffb702";
                }
                else
                {
                    return "#e01e37";
                }
            }
        }

    }
}
