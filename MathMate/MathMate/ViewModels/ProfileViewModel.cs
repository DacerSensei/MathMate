using MathMate.Services;
using System;
using System.Collections.Generic;
using System.Text;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MathMate.ViewModels
{
    public class ProfileViewModel : ObservableObject
    {
        public ProfileViewModel()
        {
        }

        private string role;
        public string Role
        {
            get => role;
            set => SetProperty(ref role, value);
        }

    }
}
