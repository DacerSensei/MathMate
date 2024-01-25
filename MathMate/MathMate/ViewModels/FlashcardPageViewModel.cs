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
    public class FlashcardPageViewModel : ObservableObject
    {
        public FlashcardPageViewModel()
        {
            LoadedCommand = new AsyncCommand(LoadedExecute);
            BackCommand = new AsyncCommand(BackExecute);
            RefreshCommand = new AsyncCommand(RefreshExecute);
            TakeQuizCommand = new Command(TakeQuizExecute);
        }



        public ObservableCollection<Quiz> QuizList { get; set; } = new ObservableCollection<Quiz>();

        public ICommand AddCommand { get; set; }
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
                QuizList.Clear();
                var result = await Database.FirebaseClient.Child($"teachers/{UserManager.User.Teacher}/Quiz").OnceAsync<Quiz>();

                foreach (var quiz in result.Reverse())
                {
                    var finishedQuiz = await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz").OnceAsync<Performance>();
                    DateTime? dateFinished = null;
                    if (finishedQuiz != null)
                    {
                        foreach (var completedQuiz in finishedQuiz)
                        {
                            if (quiz.Key == completedQuiz.Key)
                            {
                                quiz.Object.isCompleted = true;
                                dateFinished = Convert.ToDateTime(completedQuiz.Object.Date.ToString());
                            }
                        }
                    }
                    if (quiz.Object.isCompleted)
                    {
                        if (dateFinished != null)
                        {
                            if (dateFinished < quiz.Object.DueDate)
                            {
                                quiz.Object.status = "Completed";
                            }
                            else
                            {
                                quiz.Object.status = "Done Late";
                            }
                            quiz.Object.statusColor = "#1eb980";
                        }
                    }
                    else
                    {
                        if (quiz.Object.DueDate < DateTime.Now)
                        {
                            quiz.Object.status = "Missing";
                            quiz.Object.statusColor = "#ff2a04";
                        }
                        else
                        {
                            quiz.Object.status = "Incomplete";
                            quiz.Object.statusColor = "#ffb702";

                        }
                    }
                    quiz.Object.Key = quiz.Key;
                    QuizList.Add(quiz.Object);
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
