using Firebase.Auth;
using Firebase.Database;
using MathMate.Config;
using MathMate.Models;
using MathMate.Services;
using MathMate.Views;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class LoginViewModel : ObservableObject
    {
        public LoginViewModel()
        {
            //LoadedCommand = new AsyncCommand(LoginExecute);
            LoginCommand = new AsyncCommand(LoginExecute);
            ForgotPasswordCommand = new AsyncCommand(ForgotPasswordExecute);
        }
        public ICommand LoadedCommand { get; }

        public ICommand ForgotPasswordCommand { get; }
        private async Task ForgotPasswordExecute()
        {
            await Application.Current.MainPage.Navigation.PushModalAsync(new ForgotPassword());
        }

        public ICommand LoginCommand { get; }
        private async Task LoginExecute()
        { 
            TapButton.TapSound();
            if (string.IsNullOrWhiteSpace(StudentNumber))
            {
                await ToastManager.ShowToast("Email cannot be empty", Color.FromHex("#FF605C"));
                return;
            }
            if (string.IsNullOrWhiteSpace(Password))
            {
                await ToastManager.ShowToast("Password cannot be empty", Color.FromHex("#FF605C"));
                return;
            }
            try
            {
                //StudentNumber = "123";
                //Password = "123";
                Models.User user = await Database.FirebaseClient.Child($"users/{StudentNumber}").OnceSingleAsync<Models.User>();

                if (user != null)
                {
                    if (user.Password == Password)
                    {
                        Services.UserManager.User = user;
                        Services.UserManager.User.Uid = StudentNumber;
                        if (!string.IsNullOrEmpty(user.Teacher))
                        {
                            Teacher teacher = await Database.FirebaseClient.Child($"teachers/{user.Teacher}").OnceSingleAsync<Teacher>();
                            Services.UserManager.User.Adviser = teacher;
                        }
                        await Application.Current.MainPage.Navigation.PushAsync(new MainMenu());

                        StudentNumber = string.Empty;
                        Password = string.Empty;
                    }else
                    {
                        await ToastManager.ShowToast("Your password is incorrect", Color.FromHex("#FF605C"));
                    }
                }
                else
                {
                    await ToastManager.ShowToast("Your account didn't exist", Color.FromHex("#FF605C"));
                }
            }
            catch (Exception)
            {
                await ToastManager.ShowToast("Something went wrong", Color.FromHex("#FF605C"));
            }

        }

        private string studentNumber;
        public string StudentNumber
        {
            get => studentNumber;
            set => SetProperty(ref studentNumber, value);
        }

        private string password;
        public string Password
        {
            get => password;
            set => SetProperty(ref password, value);
        }
    }
}
