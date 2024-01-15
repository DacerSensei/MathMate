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
            if (UserManager.User.IsTeacher)
            {
                Role = "Student";
            }
            else
            {
                Role = "Teacher";
            }
        }

        private string role;
        public string Role
        {
            get => role;
            set => SetProperty(ref role, value);
        }

    }
}
