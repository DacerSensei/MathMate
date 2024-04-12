using System;
using System.Collections.Generic;
using System.Text;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MathMate.Models
{
    public class Assessment : ObservableObject
    {
        public Assessment Copy()
        {
            return new Assessment { question = question, answer = answer };
        }

        private string _question;
        public string question
        {
            get => _question;
            set
            {
                SetProperty(ref _question, value);
            }
        }

        private string _answer;
        public string answer
        {
            get => _answer;
            set
            {
                SetProperty(ref _answer, value);
            }
        }

        private string _userAnswer;
        public string UserAnswer
        {
            get => _userAnswer;
            set
            {
                SetProperty(ref _userAnswer, value);
            }
        }
    }
}
