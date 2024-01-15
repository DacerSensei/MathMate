using Firebase.Database.Query;
using MathMate.Config;
using MathMate.Models;
using MathMate.Services;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
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
            FlashCards = new ObservableCollection<FlashCard>(quiz.FlashCardsList);
            FlashCards.FirstOrDefault().IsCurrentQuestion = true;
            AnswerCommand = new Command(AnswerExecute);
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

        public ICommand AnswerCommand { get; set; }

        private async void AnswerExecute(object parameter)
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
                            if (currentQuestion.solution.ToLower() == numericConversion.ToString().ToLower())
                            {
                                Score++;
                            }
                            currentQuestion.IsCurrentQuestion = false;
                            int nextIndex = (currentIndex + 1) % FlashCards.Count;
                            if (nextIndex != 0 || currentIndex != FlashCards.Count - 1)
                            {
                                FlashCards[nextIndex].IsCurrentQuestion = true;
                            }
                            else
                            {
                                Debug.WriteLine("Your total score is: " + Score);
                                await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = Score }));
                                await Application.Current.MainPage.Navigation.PopAsync();
                            }
                        }
                        else
                        {
                            if (WordToNumberMap.TryGetValue(answer, out int numericValue))
                            {
                                // Successfully converted the word to an integer
                                if (currentQuestion.solution.ToLower() == numericValue.ToString().ToLower())
                                {
                                    Score++;
                                }
                                currentQuestion.IsCurrentQuestion = false;
                                int nextIndex = (currentIndex + 1) % FlashCards.Count;
                                if (nextIndex != 0 || currentIndex != FlashCards.Count - 1)
                                {
                                    FlashCards[nextIndex].IsCurrentQuestion = true;
                                }
                                else
                                {
                                    Debug.WriteLine("Your total score is: " + Score);
                                    await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{CurrentQuiz.Key}").PutAsync(JsonConvert.SerializeObject(new { Score = Score }));
                                    await Application.Current.MainPage.Navigation.PopAsync();
                                }
                            }
                            else
                            {
                                // Handle the case where the word is not a valid representation of a number
                                Console.WriteLine("Invalid word representation of a number");
                            }
                        }
                    }

                }
            }
        }

        async Task<string> WaitForSpeechToText()
        {
            return await DependencyService.Get<Services.ISpeechToText>().SpeechToTextAsync();
        }

    }
}
