﻿using MathMate.Config;
using MathMate.Views;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class SettingsViewModel : ObservableObject
    {
        public SettingsViewModel()
        {
            LogoutCommand = new AsyncCommand(LogoutExecute);
            //EditInformationCommand = new AsyncCommand(EditInformationExecute);
            ChangePasswordCommand = new AsyncCommand(ChangePasswordExecute);
        }

        public ICommand LogoutCommand { get; }
        public ICommand EditInformationCommand { get; }
        public ICommand ChangePasswordCommand { get; }
        private async Task LogoutExecute()
        {
            await Application.Current.MainPage.Navigation.PopAsync();
        }

        //private async Task EditInformationExecute()
        //{
        //    await Application.Current.MainPage.Navigation.PushModalAsync(new EditInformation());
        //}

        private async Task ChangePasswordExecute()
        {
            await Application.Current.MainPage.Navigation.PushModalAsync(new ChangePassword());
        }
    }
}
