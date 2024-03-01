using Firebase.Auth;
using Firebase.Database.Query;
using MathMate.Config;
using MathMate.Services;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class ChangePasswordViewModel : ObservableObject
    {
        public ChangePasswordViewModel()
        {
            GoBackCommand = new AsyncCommand(GoBackExecute);
            SaveCommand = new AsyncCommand(SaveExecute);
        }

        public ICommand GoBackCommand { get; }
        private async Task GoBackExecute()
        {
            await Application.Current.MainPage.Navigation.PopModalAsync();
        }

        public ICommand SaveCommand { get; }
        private async Task SaveExecute()
        {
            if (string.IsNullOrWhiteSpace(NewPassword))
            {
                await ToastManager.ShowToast("New password cannot be empty", Color.FromHex("#FF605C"));
                return;
            }
            if (NewPassword.Length < 6)
            {
                await ToastManager.ShowToast("New password must be at least 6 characters", Color.FromHex("#FF605C"));
                return;
            }
            if (NewPassword != ConfirmPassword)
            {
                await ToastManager.ShowToast("Your new password and confirm password didn't match", Color.FromHex("#FF605C"));
                return;
            }
            if (!await Application.Current.MainPage.DisplayAlert("Notice", "Are you sure you want to change your password?", "Yes", "No", FlowDirection.LeftToRight))
            {
                return;
            }
            try
            {
                await Database.FirebaseClient.Child($"users/{Services.UserManager.User.Username}").PatchAsync(new { Password = NewPassword });
                Services.UserManager.User.Password = NewPassword;
                await Application.Current.MainPage.Navigation.PopModalAsync();
                await ToastManager.ShowToast("Your password has been changed", Color.FromHex("#1eb980"));
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
        }

        private string newPassword = string.Empty;
        public string NewPassword
        {
            get => newPassword;
            set => SetProperty(ref newPassword, value);
        }

        private string confirmPassword = string.Empty;
        public string ConfirmPassword
        {
            get => confirmPassword;
            set => SetProperty(ref confirmPassword, value);
        }
    }
}
