using MathMate.Config;
using MathMate.Models;
using MathMate.Services;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class AddFlashCardQuizViewModel : ObservableObject
    {
        public AddFlashCardQuizViewModel()
        {
            SaveCommand = new AsyncCommand(SaveExecute);
            BackCommand = new AsyncCommand(BackExecute);
            AddCommand = new Command(AddExecute);
        }

        public ICommand SaveCommand { get; set; }
        public ICommand BackCommand { get; set; }
        public ICommand AddCommand { get; set; }

        public ObservableCollection<FlashCard> FlashCards { get; set; } = new ObservableCollection<FlashCard>();

        private async Task BackExecute()
        {
            await Application.Current.MainPage.Navigation.PopModalAsync();
        }

        private void AddExecute()
        {
            FlashCards.Add(new FlashCard { problem = string.Empty, solution = string.Empty });
        }

        private async Task SaveExecute()
        {
            try
            {
                var flashCardDictionary = new Dictionary<string, FlashCard>();
                for (int i = 0; i < FlashCards.Count; i++)
                {
                    flashCardDictionary[$"Question {i + 1}"] = FlashCards[i];
                }
                await Database.FirebaseClient.Child($"teachers/{UserManager.User.Uid}/Quiz/{Title}").PutAsync(JsonConvert.SerializeObject(flashCardDictionary));

                await Application.Current.MainPage.Navigation.PopModalAsync();
                await ToastManager.ShowToast("Successfully added new flash cards", Color.FromHex("#1eb980"));
            }
            catch (Exception ex)
            {
                await ToastManager.ShowToast("Something went wrong", Color.FromHex("#FF605C"));
                Debug.WriteLine(ex.Message);
                Debug.WriteLine(ex.InnerException);

            }
        }

        private string title;

        public string Title
        {
            get => title;
            set
            {
                SetProperty(ref title, value);
            }
        }

    }
}
