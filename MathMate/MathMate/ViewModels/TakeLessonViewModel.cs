using MathMate.Config;
using MathMate.Models;
using MathMate.Services;
using MathMate.Views;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class TakeLessonViewModel : ObservableObject
    {
        public ObservableCollection<Assessment> InitialAssessmentList { get; set; }
        public ObservableCollection<Assessment> FinalAssessmentList { get; set; }
        private Lesson Lesson;
        public TakeLessonViewModel(Lesson lesson)
        {
            Lesson = lesson;
            VideoPath = new Uri(lesson.videoPath);
            InitialAssessmentList = new ObservableCollection<Assessment>(lesson.Assessment.Values.Select(a => a.Copy()));
            FinalAssessmentList = new ObservableCollection<Assessment>(lesson.Assessment.Values.Select(a => a.Copy()));
            InitialAssessmentCommand = new Command(InitialAssessmentExecute);
            FinalAssessmentCommand = new AsyncCommand(FinalAssessmentExecute);
            NextCommand = new Command(NextExecute);
        }

        public ICommand InitialAssessmentCommand { get; set; }
        public ICommand NextCommand { get; set; }
        public ICommand FinalAssessmentCommand { get; set; }
        public ICommand LoadedCommand { get; set; }

        private void InitialAssessmentExecute()
        {
            TapButton.TapSound();
            SelectedTab = 1;
        }

        private void NextExecute()
        {
            TapButton.TapSound();
            SelectedTab++;
        }

        private async Task FinalAssessmentExecute()
        {
            TapButton.TapSound();
            int InitialScore = 0;
            int FinalScore = 0;

            for (int i = 0; i < InitialAssessmentList.Count; i++)
            {
                if (InitialAssessmentList[i].UserAnswer != null && InitialAssessmentList[i].answer.ToLower() == InitialAssessmentList[i].UserAnswer.ToLower())
                {
                    InitialScore++;
                }
            }

            for (int i = 0; i < FinalAssessmentList.Count; i++)
            {
                if (FinalAssessmentList[i].UserAnswer != null && FinalAssessmentList[i].answer.ToLower() == FinalAssessmentList[i].UserAnswer.ToLower())
                {
                    FinalScore++;
                }
            }

            try
            {
                var dateNow = DateTime.Now;
                await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Lesson/{Lesson.Key}").PutAsync(JsonConvert.SerializeObject(new { InitialScore = InitialScore, FinalScore = FinalScore, Date = dateNow.ToShortDateString(), Total = InitialAssessmentList.Count, Title = "Assessment", Description = Lesson.description }));
                await Application.Current.MainPage.Navigation.PopModalAsync();
                await Application.Current.MainPage.Navigation.PushModalAsync(new LessonScore() { BindingContext = new LessonScoreViewModel(InitialScore, FinalScore, InitialAssessmentList.Count, dateNow) });

            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                await Application.Current.MainPage.DisplayAlert("Error:", "Something Went Wrong", "Ok");
            }
        }

        private int _selectedTab;

        public int SelectedTab
        {
            get => _selectedTab;
            set => SetProperty(ref _selectedTab, value);
        }

        private Uri _videoPath;

        public Uri VideoPath
        {
            get => _videoPath;
            set => SetProperty(ref _videoPath, value);
        }

    }
}
