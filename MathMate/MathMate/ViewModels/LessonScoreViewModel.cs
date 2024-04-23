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
    public class LessonScoreViewModel : ObservableObject
    {
        
        public LessonScoreViewModel(int initialScore, int finalScore, int overall, DateTime dateTime)
        {
            BackCommand = new Command(BackExecute);
            this.initialScore = initialScore;
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

        private int initialScore;

        public int InitialScore
        {
            get => initialScore;
            set
            {
                SetProperty(ref initialScore, value);
                OnPropertyChanged(nameof(InitialScorePercent));
                OnPropertyChanged(nameof(InitialScoreColor));
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

        public int InitialScorePercent
        {
            get
            {
                double result = (double)InitialScore / OverallScore * 100;
                return (int)Math.Round(result);
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

        public string InitialScoreColor
        {
            get
            {
                if (InitialScorePercent > 75)
                {
                    return "#32ac71";
                }
                else if (InitialScorePercent > 50)
                {
                    return "#ffb702";
                }
                else
                {
                    return "#e01e37";
                }
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
