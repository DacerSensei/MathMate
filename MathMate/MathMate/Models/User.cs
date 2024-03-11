using System;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MathMate.Models
{
    public class User : ObservableObject
    {
        public string Uid { get; set; }

        private string contact;
        public string Contact
        {
            get => contact;
            set
            {
                SetProperty(ref contact, value);
            }
        }

        private string gender;
        public string Gender
        {
            get => gender;
            set
            {
                SetProperty(ref gender, value);
                OnPropertyChanged(nameof(GenderColor));
            }
        }

        private string username;
        public string Username
        {
            get => username;
            set
            {
                SetProperty(ref username, value);
            }
        }

        private string password;
        public string Password
        {
            get => password;
            set
            {
                SetProperty(ref password, value);
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

        private Teacher adviser;
        public Teacher Adviser
        {
            get => adviser;
            set
            {
                SetProperty(ref adviser, value);
            }
        }

        private string teacher;
        public string Teacher
        {
            get => teacher;
            set
            {
                SetProperty(ref teacher, value);
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

        private string firstName;
        public string FirstName
        {
            get => firstName;
            set
            {
                SetProperty(ref firstName, value);
                OnPropertyChanged(nameof(CompleteName));
                OnPropertyChanged(nameof(InitialName));
            }
        }

        private string lastName;
        public string LastName
        {
            get => lastName;
            set
            {
                SetProperty(ref lastName, value);
                OnPropertyChanged(nameof(CompleteName));
                OnPropertyChanged(nameof(InitialName));

            }
        }

        public string CompleteName
        {
            get
            {
                return FirstName + " " + LastName;
            }
        }

        public string InitialName
        {
            get
            {
                return FirstName[0].ToString() + LastName[0].ToString();
            }
        }

        public string GenderColor
        {
            get
            {
                if (Gender != null)
                {
                    return Gender.ToUpper() == "MALE" ? "#02b0f0" : "#f75b95";
                }
                return "#000";
            }
        }

        private Uri displayPicture;
        public Uri DisplayPicture
        {
            get => displayPicture;
            set
            {
                SetProperty(ref displayPicture, value);
            }
        }

        private string displayFileName;
        public string DisplayFileName
        {
            get => displayFileName;
            set
            {
                SetProperty(ref displayFileName, value);
            }
        }
    }
}
