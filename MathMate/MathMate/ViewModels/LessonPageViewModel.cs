using MathMate.Config;
using MathMate.Models;
using MathMate.Services;
using MathMate.Views;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class LessonPageViewModel : ObservableObject
    {
        public LessonPageViewModel()
        {
            LoadedCommand = new AsyncCommand(LoadedExecute);
            BackCommand = new AsyncCommand(BackExecute);
            RefreshCommand = new AsyncCommand(RefreshExecute);
            TakeQuizCommand = new Command(TakeQuizExecute);
        }



        public ObservableCollection<Lesson> LessonList { get; set; } = new ObservableCollection<Lesson>();

        public ICommand BackCommand { get; set; }
        public ICommand LoadedCommand { get; set; }
        public ICommand DeleteCommand { get; set; }
        public ICommand TakeQuizCommand { get; set; }

        private async void TakeQuizExecute(object parameter)
        {
            Quiz quiz = parameter as Quiz;
            if (quiz != null)
            {
                if (quiz.isCompleted)
                {
                    await ToastManager.ShowToast("You cannot take completed quiz", Color.FromHex("#FF605C"));
                }
                else
                {
                    await Application.Current.MainPage.Navigation.PushModalAsync(new TakeFlashCard()
                    {
                        BindingContext = new TakeFlashCardViewModel(quiz)
                    });
                }
            }
        }

        private async Task BackExecute()
        {
            await Application.Current.MainPage.Navigation.PopModalAsync();
        }

        private async Task LoadedExecute()
        {
            try
            {
                LessonList.Clear();

                var result = await Database.FirebaseClient.Child($"teachers/{UserManager.User.Teacher}/Lesson").OnceAsync<Lesson>();
                foreach (var item in result.Reverse())
                {
                    var finishedQuiz = await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Lesson").OnceAsync<Lesson>();
                    if (finishedQuiz != null)
                    {
                        foreach (var quiz in finishedQuiz)
                        {
                            if (item.Key == quiz.Key)
                            {
                                item.Object.isCompleted = true;
                            }
                        }
                    }
                    if (item.Object.isCompleted)
                    {
                        item.Object.status = "Completed";
                        item.Object.statusColor = "#1eb980";
                    }
                    else
                    {
                        item.Object.status = "Incomplete";
                        item.Object.statusColor = "#ff2a04";
                    }
                    item.Object.Key = item.Key;
                    LessonList.Add(item.Object);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                Debug.WriteLine(ex.InnerException);
            }
        }

        public ICommand RefreshCommand { get; }

        private async Task RefreshExecute()
        {
            await LoadedExecute();
            IsRefreshing = false;
        }

        bool isRefreshing;
        public bool IsRefreshing
        {
            get => isRefreshing;
            set
            {
                isRefreshing = value;
                OnPropertyChanged(nameof(IsRefreshing));
            }
        }
    }
}
