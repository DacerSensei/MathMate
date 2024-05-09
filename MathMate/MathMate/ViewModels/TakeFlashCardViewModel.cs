using Firebase.Database.Query;
using MathMate.Config;
using MathMate.Models;
using MathMate.Services;
using MathMate.Views;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class TakeFlashCardViewModel : ObservableObject
    {
        private Quiz CurrentQuiz;
        public TakeFlashCardViewModel(Quiz quiz)
        {
            CurrentQuiz = quiz;
            var quizzes = quiz.Flashcards.Values.ToList();
            quizzes.Shuffle();
            FlashCards = new ObservableCollection<FlashCard>(quizzes);
            FlashCards.FirstOrDefault().IsCurrentQuestion = true;
            AnswerMicCommand = new Command(AnswerMicExecute);
            AnswerTextCommand = new Command(AnswerTextExecute);
            UpdateOverItems();
        }

        Dictionary<string, int> WordToNumberMap = new Dictionary<string, int>
        {
            {"one", 1},
            {"two", 2},
            {"three", 3},
            {"four", 4},
            {"five", 5},
            {"six", 6},
            {"seven", 7},
            {"eight", 8},
            {"nine", 9},
            // Add more mappings as needed
        };

        private int Score = 0;

        public ObservableCollection<FlashCard> FlashCards { get; set; }

        public ICommand AnswerMicCommand { get; set; }
        public ICommand AnswerTextCommand { get; set; }



        private async void AnswerMicExecute(object parameter)
        {
            FlashCard flashCard = parameter as FlashCard;
            if (flashCard != null)
            {
                var answer = await WaitForSpeechToText();
                if (!string.IsNullOrEmpty(answer))
                {
                    FlashCard currentQuestion = FlashCards.FirstOrDefault(card => card.IsCurrentQuestion == true);
                    int currentIndex = FlashCards.IndexOf(currentQuestion);
                    if (currentQuestion != null)
                    {
                        if (int.TryParse(answer, out int numericConversion))
                        {
                            // Successfully converted the word to an integer
                            if (CurrentItem < FlashCards.Count)
                            {
                                CurrentItem++;
                            }
                            UpdateOverItems();
                            if (flashCard.solution.ToLower() == numericConversion.ToString().ToLower())
                            {
                                Score++;
                            }

                            if (SelectedTab + 1 < FlashCards.Count)
                            {
                                SelectedTab++;
                            }
                            else
                            {
                                var dateNow = DateTime.Now;
                                var attempt = CurrentQuiz.Attempts == 0 ? 1 : CurrentQuiz.Attempts + 1;
                                if (CurrentQuiz.Attempts == 0)
                                {
                                    await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = Score, Date = dateNow.ToShortDateString(), Total = FlashCards.Count, Title = "Flashcard", Description = CurrentQuiz.Description, Attempts = attempt }));

                                }
                                else if (Score > CurrentQuiz.HighestScore)
                                {
                                    await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = Score, Date = dateNow.ToShortDateString(), Total = FlashCards.Count, Title = "Flashcard", Description = CurrentQuiz.Description, Attempts = attempt }));

                                }
                                else
                                {
                                    await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = CurrentQuiz.HighestScore, Date = dateNow.ToShortDateString(), Total = FlashCards.Count, Title = "Flashcard", Description = CurrentQuiz.Description, Attempts = attempt }));
                                }
                                await Application.Current.MainPage.Navigation.PopModalAsync();
                                await Application.Current.MainPage.Navigation.PushModalAsync(new FlashcardScore() { BindingContext = new FlashcardScoreViewModel(Score, FlashCards.Count, dateNow) });
                            }
                            TextAnswer = string.Empty;
                        }
                        else
                        {
                            if (WordToNumberMap.TryGetValue(answer, out int numericValue))
                            {
                                // Successfully converted the word to an integer
                                if (CurrentItem < FlashCards.Count)
                                {
                                    CurrentItem++;
                                }
                                UpdateOverItems();
                                if (flashCard.solution.ToLower() == numericValue.ToString().ToLower())
                                {
                                    Score++;
                                }

                                if (SelectedTab + 1 < FlashCards.Count)
                                {
                                    SelectedTab++;
                                }
                                else
                                {
                                    var dateNow = DateTime.Now;
                                    var attempt = CurrentQuiz.Attempts == 0 ? 1 : CurrentQuiz.Attempts + 1;
                                    if (CurrentQuiz.Attempts == 0)
                                    {
                                        await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = Score, Date = dateNow.ToShortDateString(), Total = FlashCards.Count, Title = "Flashcard", Description = CurrentQuiz.Description, Attempts = attempt }));

                                    }
                                    else if (Score > CurrentQuiz.HighestScore)
                                    {
                                        await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = Score, Date = dateNow.ToShortDateString(), Total = FlashCards.Count, Title = "Flashcard", Description = CurrentQuiz.Description, Attempts = attempt }));

                                    }
                                    else
                                    {
                                        await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = CurrentQuiz.HighestScore, Date = dateNow.ToShortDateString(), Total = FlashCards.Count, Title = "Flashcard", Description = CurrentQuiz.Description, Attempts = attempt }));
                                    }
                                    await Application.Current.MainPage.Navigation.PopModalAsync();
                                    await Application.Current.MainPage.Navigation.PushModalAsync(new FlashcardScore() { BindingContext = new FlashcardScoreViewModel(Score, FlashCards.Count, dateNow) });
                                }
                                TextAnswer = string.Empty;
                            }
                            else
                            {
                                // Handle the case where the word is not a valid representation of a number
                                await ToastManager.ShowToast("Invalid Answer. Try again.", Color.FromHex("#FF605C"));
                            }
                        }
                    }

                }
            }
        }

        private async void AnswerTextExecute(object parameter)
        {
            TapButton.TapSound();
            FlashCard flashCard = parameter as FlashCard;
            if (flashCard != null)
            {
                if (!string.IsNullOrEmpty(TextAnswer))
                {
                    if (int.TryParse(TextAnswer, out int numericConversion))
                    {
                        // Successfully converted the word to an integer
                        if (CurrentItem < FlashCards.Count)
                        {
                            CurrentItem++;
                        }
                        UpdateOverItems();
                        if (flashCard.solution.ToLower() == numericConversion.ToString().ToLower())
                        {
                            Score++;
                        }

                        FlashCards[CurrentItem - 2].IsCurrentQuestion = false;
                        FlashCards[CurrentItem - 1].IsCurrentQuestion = true;

                        if (SelectedTab + 1 < FlashCards.Count)
                        {
                            SelectedTab++;
                        }
                        else
                        {
                            var dateNow = DateTime.Now;
                            var attempt = CurrentQuiz.Attempts == 0 ? 1 : CurrentQuiz.Attempts + 1;
                            if (CurrentQuiz.Attempts == 0)
                            {
                                await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = Score, Date = dateNow.ToShortDateString(), Total = FlashCards.Count, Title = "Flashcard", Description = CurrentQuiz.Description, Attempts = attempt }));

                            }
                            else if (Score > CurrentQuiz.HighestScore)
                            {
                                await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = Score, Date = dateNow.ToShortDateString(), Total = FlashCards.Count, Title = "Flashcard", Description = CurrentQuiz.Description, Attempts = attempt }));

                            }
                            else
                            {
                                await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = CurrentQuiz.HighestScore, Date = dateNow.ToShortDateString(), Total = FlashCards.Count, Title = "Flashcard", Description = CurrentQuiz.Description, Attempts = attempt }));
                            }
                            await Application.Current.MainPage.Navigation.PopModalAsync();
                            await Application.Current.MainPage.Navigation.PushModalAsync(new FlashcardScore() { BindingContext = new FlashcardScoreViewModel(Score, FlashCards.Count, dateNow) });
                        }
                        TextAnswer = string.Empty;
                    }
                    else
                    {
                        await ToastManager.ShowToast("Invalid Answer. Try again.", Color.FromHex("#FF605C"));
                    }
                }
            }
        }

        private string overItems;
        public string OverItems
        {
            get => overItems;
            set => SetProperty(ref overItems, value);
        }

        private int CurrentItem = 1;

        private void UpdateOverItems()
        {
            OverItems = $"{CurrentItem}/{FlashCards.Count}";
        }

        async Task<string> WaitForSpeechToText()
        {
            return await DependencyService.Get<ISpeechToText>().SpeechToTextAsync();
        }

        private string textAnswer;
        public string TextAnswer
        {
            get => textAnswer;
            set => SetProperty(ref textAnswer, value);
        }

        private int _selectedTab;

        public int SelectedTab
        {
            get => _selectedTab;
            set => SetProperty(ref _selectedTab, value);
        }


    }
}
