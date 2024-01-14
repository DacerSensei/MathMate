﻿using MathMate.Config;
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
    public class FlashCardQuizViewModel : ObservableObject
    {
        public FlashCardQuizViewModel()
        {
            LoadedCommand = new AsyncCommand(LoadedExecute);
            AddCommand = new AsyncCommand(AddExecute);
            BackCommand = new AsyncCommand(BackExecute);
            DeleteCommand = new Command(DeleteExecute);
            RefreshCommand = new AsyncCommand(RefreshExecute);
        }

        public ObservableCollection<Quiz> QuizList { get; set; } = new ObservableCollection<Quiz>();

        public ICommand AddCommand { get; set; }
        public ICommand BackCommand { get; set; }
        public ICommand LoadedCommand { get; set; }
        public ICommand DeleteCommand { get; set; }

        private async void DeleteExecute(object parameter)
        {
            Quiz quiz = parameter as Quiz;
            if (quiz != null)
            {
                if (await Application.Current.MainPage.DisplayAlert("Notice", "Are you sure you want to delete?", "Yes", "No"))
                {
                    var deleteGoalTask = Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz/{quiz.Key}").DeleteAsync();
                    try
                    {
                        await Task.WhenAll(deleteGoalTask);
                        await LoadedExecute();
                        await ToastManager.ShowToast("Quiz has been deleted", Color.FromHex("#1eb980"));
                    }
                    catch (Exception)
                    {
                        await ToastManager.ShowToast("Something went wrong", Color.FromHex("#FF605C"));
                    }
                }
            }
        }

        private async Task AddExecute()
        {
            await Application.Current.MainPage.Navigation.PushModalAsync(new AddFlashCardQuiz());
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
                if (!UserManager.User.IsTeacher)
                {
                    var result = await Database.FirebaseClient.Child($"teachers/{UserManager.User.Uid}/Quiz").OnceAsync<Quiz>();
                    foreach (var item in result.Reverse())
                    {
                        var flashCards = await Database.FirebaseClient.Child($"teachers/{UserManager.User.Uid}/Quiz/{item.Key}").OnceAsync<FlashCard>();
                        if (flashCards != null)
                        {
                            foreach (var cards in flashCards)
                            {
                                cards.Object.Key = cards.Key;
                                item.Object.FlashCardsList.Add(cards.Object);
                            }
                        }
                        item.Object.Key = item.Key;
                        QuizList.Add(item.Object);
                    }
                }
                else
                {
                    var result = await Database.FirebaseClient.Child($"teachers/{UserManager.User.Teacher}/Quiz").OnceAsync<Quiz>();
                    foreach (var item in result.Reverse())
                    {
                        var flashCards = await Database.FirebaseClient.Child($"teachers/{UserManager.User.Teacher}/Quiz/{item.Key}").OnceAsync<FlashCard>();
                        if (flashCards != null)
                        {
                            foreach (var cards in flashCards)
                            {
                                cards.Object.Key = cards.Key;
                                item.Object.FlashCardsList.Add(cards.Object);
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

        public bool IsTeacher
        {
            get
            {
                return UserManager.User.IsTeacher;
            }
        }
    }
}