using MathMate.Config;
using MathMate.Models;
using MathMate.Services;
using MathMate.Views;
using Microcharts;
using SkiaSharp;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class PerformancePageViewModel : ObservableObject
    {
        public PerformancePageViewModel()
        {
            LoadedCommand = new AsyncCommand(LoadedExecute);
            BackCommand = new AsyncCommand(BackExecute);
            RefreshCommand = new AsyncCommand(RefreshExecute);
        }



        public ObservableCollection<Performance> PerformanceList { get; set; } = new ObservableCollection<Performance>();
        public ObservableCollection<Quiz> QuizList { get; set; } = new ObservableCollection<Quiz>();

        public ICommand BackCommand { get; set; }
        public ICommand LoadedCommand { get; set; }

        private async Task BackExecute()
        {
            await Application.Current.MainPage.Navigation.PopModalAsync();
        }

        private async Task LoadedExecute()
        {
            float completedQuiz = 0;
            try
            {
                QuizList.Clear();
                ChartEntries.Clear();
                PerformanceList.Clear();
                var performanceResult = await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz").OnceAsync<Performance>();
                if (performanceResult != null)
                {
                    foreach (var item in performanceResult)
                    {
                        item.Object.Key = item.Key;
                        PerformanceList.Add(item.Object);
                    }
                }


                var quizResult = await Database.FirebaseClient.Child($"teachers/{UserManager.User.Teacher}/Quiz").OnceAsync<Quiz>();
                if (quizResult != null)
                {
                    foreach (var item in quizResult)
                    {
                        var finishedQuiz = await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz").OnceAsync<Quiz>();
                        if (finishedQuiz != null)
                        {
                            foreach (var quiz in finishedQuiz)
                            {
                                if (item.Key == quiz.Key)
                                {
                                    completedQuiz++;
                                }
                            }
                        }
                        item.Object.Key = item.Key;
                        QuizList.Add(item.Object);
                    }
                }

            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                Debug.WriteLine(ex.InnerException);
            }

            float averageScore = PerformanceList.Sum(item => float.Parse(item.Score));
            float averageTotal = PerformanceList.Sum(item => float.Parse(item.Total));
            float quizTotal = QuizList.Count;
            ChartEntries.Add(CreateChartEntry(averageScore / averageTotal * 100, "Average", sKColors[0]));
            ChartEntries.Add(CreateChartEntry(completedQuiz / quizTotal * 100, "Completed", sKColors[1]));
            ChartEntries.Add(CreateChartEntry((quizTotal - completedQuiz) / quizTotal * 100, "Incomplete", sKColors[2]));
            UpdateBarChart();

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

        public Chart Chart { get; private set; }

        private void UpdateBarChart()
        {
            Chart = new BarChart()
            {
                LabelOrientation = Orientation.Horizontal,
                ValueLabelOrientation = Orientation.Horizontal,
                LabelTextSize = 40,
                MaxValue = 100,
                MinValue = 0,
                IsAnimated = true,
                Entries = ChartEntries,
                LabelColor = SKColor.Parse("#000"),
                
            };
            OnPropertyChanged(nameof(Chart));
        }

        public List<ChartEntry> ChartEntries { get; set; } = new List<ChartEntry>();
        private List<SKColor> sKColors = new List<SKColor>()
        {
            new SKColor(114, 9, 183),
            new SKColor(50, 172, 113),
            new SKColor(224, 30, 55),
            new SKColor(52, 152, 219)

        };

        private ChartEntry CreateChartEntry(float value, string label, SKColor color)
        {
            return new ChartEntry(value)
            {
                Label = label,
                ValueLabel = value.ToString("0") + "%",
                Color = color,
                TextColor = color
            };
        }
    }
}
