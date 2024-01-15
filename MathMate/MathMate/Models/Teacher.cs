using System;
using System.Collections.Generic;
using System.Text;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MathMate.Models
{
    public class Teacher : ObservableObject
    {
        public string Uid { get; set; }

        private string email;
        public string Email
        {
            get => email;
            set
            {
                SetProperty(ref email, value);
            }
        }

        private string gender;
        public string Gender
        {
            get => gender;
            set
            {
                SetProperty(ref gender, value);
            }
        }

        private string gradeLevel;
        public string GradeLevel
        {
            get => gradeLevel;
            set
            {
                SetProperty(ref gradeLevel, value);
            }
        }

        private string section;
        public string Section
        {
            get => section;
            set
            {
                SetProperty(ref section, value);
            }
        }

        private string firstName;
        public string FirstName
        {
            get => firstName;
            set
            {
                SetProperty(ref firstName, value);
            }
        }

        private string lastName;
        public string LastName
        {
            get => lastName;
            set
            {
                SetProperty(ref lastName, value);
            }
        }

        private string birthday;
        public string Birthday
        {
            get => birthday;
            set
            {
                SetProperty(ref birthday, value);
            }
        }

        private string status;
        public string Status
        {
            get => status;
            set
            {
                SetProperty(ref status, value);
            }
        }

        public string CompleteName
        {
            get
            {
                return FirstName + " " + LastName;
            }
        }
    }
}
