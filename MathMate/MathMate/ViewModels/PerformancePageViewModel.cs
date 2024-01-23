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
    public class PerformancePageViewModel : ObservableObject
    {
        public PerformancePageViewModel()
        {
            LoadedCommand = new AsyncCommand(LoadedExecute);
            BackCommand = new AsyncCommand(BackExecute);
            RefreshCommand = new AsyncCommand(RefreshExecute);
        }



        public ObservableCollection<Performance> PerformanceList { get; set; } = new ObservableCollection<Performance>();

        public ICommand BackCommand { get; set; }
        public ICommand LoadedCommand { get; set; }

        private async Task BackExecute()
        {
            await Application.Current.MainPage.Navigation.PopModalAsync();
        }

        private async Task LoadedExecute()
        {
            try
            {
                PerformanceList.Clear();
                var result = await Database.FirebaseClient.Child($"users/{UserManager.User.Uid}/Quiz").OnceAsync<Performance>();
                if (result != null)
                {
                    foreach (var item in result)
                    {
                        item.Object.Key = item.Key;
                        PerformanceList.Add(item.Object);
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
    }
}
