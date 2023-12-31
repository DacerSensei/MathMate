﻿using Firebase.Auth;
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
            LoginCommand = new AsyncCommand(LoginExecute);
            ForgotPasswordCommand = new AsyncCommand(ForgotPasswordExecute);
        }

        public ICommand ForgotPasswordCommand { get; }
        private async Task ForgotPasswordExecute()
        {
            await Application.Current.MainPage.Navigation.PushModalAsync(new ForgotPassword());
        }

        public ICommand LoginCommand { get; }
        private async Task LoginExecute()
        {
            if (string.IsNullOrWhiteSpace(Email))
            {
                await ToastManager.ShowToast("Email cannot be empty", Color.FromHex("#FF605C"));
                return;
            }
            if (!IsValidEmail)
            {
                await ToastManager.ShowToast("Email is not valid", Color.FromHex("#FF605C"));
                return;
            }
            if (string.IsNullOrWhiteSpace(Password))
            {
                await ToastManager.ShowToast("Password cannot be empty", Color.FromHex("#FF605C"));
                return;
            }
            if (Password.Length < 6)
            {
                await ToastManager.ShowToast("Password must be at least 6 characters", Color.FromHex("#FF605C"));
                return;
            }
            try
            {
                UserCredential userCredential = await Database.FirebaseAuthClient.SignInWithEmailAndPasswordAsync(Email, Password);

                IReadOnlyCollection<FirebaseObject<Models.User>> users = await Database.FirebaseClient.Child("users").OnceAsync<Models.User>();
                Services.UserManager.User = users.Where(user => user.Object.Uid == userCredential.User.Uid).FirstOrDefault().Object;
                Services.UserManager.User.Email = userCredential.User.Info.Email;

                await Application.Current.MainPage.Navigation.PushAsync(new ErrorPage());
            }
            catch (FirebaseAuthException ex)
            {
                switch (ex.Reason)
                {
                    case AuthErrorReason.UserDisabled:
                        await ToastManager.ShowToast("Account Disabled", Color.FromHex("#FF605C"));

                        break;
                    case AuthErrorReason.InvalidEmailAddress:
                        await ToastManager.ShowToast("Invalid Email Address", Color.FromHex("#FF605C"));

                        break;
                    case AuthErrorReason.UnknownEmailAddress:
                        await ToastManager.ShowToast("Email Address didn't exist", Color.FromHex("#FF605C"));
                        break;
                    case AuthErrorReason.Unknown:
                        await ToastManager.ShowToast("Your email or password is incorrect", Color.FromHex("#FF605C"));
                        break;
                    default:
                        Debug.WriteLine(ex.Message);
                        break;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                Debug.WriteLine(ex.InnerException.Message);
            }

        }

        private bool isValidEmail;

        public bool IsValidEmail
        {
            get => isValidEmail;
            set => SetProperty(ref isValidEmail, value);
        }

        private string email;
        public string Email
        {
            get => email;
            set => SetProperty(ref email, value);
        }

        private string password;
        public string Password
        {
            get => password;
            set => SetProperty(ref password, value);
        }
    }
}
